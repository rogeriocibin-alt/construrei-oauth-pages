#!/usr/bin/env python3
"""Recover private Trello ZIP into a new directory and a queryable SQLite catalog."""
import hashlib,json,pathlib,sqlite3,stat,sys,zipfile
def check(ok,msg):
    if not ok:raise ValueError(msg)
def digest(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):h.update(chunk)
    return h.hexdigest()
def load(path):return json.loads(path.read_text(encoding="utf-8"))
def main(src,dest):
    src,dest=pathlib.Path(src),pathlib.Path(dest)
    check(not dest.exists(),"Destination already exists")
    transfer=load(src/"TRANSFER_MANIFEST.json")
    archive=src/"TRELLO_READONLY_SNAPSHOT.zip"
    check(archive.stat().st_size==transfer["archive_size"] and digest(archive)==transfer["sha256"],"Archive mismatch")
    dest.mkdir(parents=True)
    with zipfile.ZipFile(archive) as z:
        names=z.namelist()
        check(len(names)==len(set(names)),"Duplicate ZIP member")
        files=json.loads(z.read("FILE_MANIFEST.json"))
        check(set(names)=={f["path"] for f in files}|{"FILE_MANIFEST.json"},"Inventory mismatch")
        for info in z.infolist():
            name=info.filename
            check(not name.startswith("/") and "\\" not in name and all(p not in ("",".","..") for p in name.split("/")),"Unsafe ZIP path")
            check(not info.is_dir() and not stat.S_ISLNK(info.external_attr>>16),"Nonregular file")
            out=dest/name;out.parent.mkdir(parents=True,exist_ok=True)
            with z.open(info) as f,out.open("wb") as target:
                for chunk in iter(lambda:f.read(1024*1024),b""):target.write(chunk)
    for f in files:
        p=dest/f["path"]
        check(p.stat().st_size==f["bytes"] and digest(p)==f["sha256"],"Restored content mismatch")
        if p.suffix==".json":load(p)
    manifest=load(dest/"RECOVERY_MANIFEST.json")
    check(manifest["complete"] and manifest["board_count"]==transfer["board_count"],"Incomplete manifest")
    dbpath=src/"TRELLO_RECOVERED.sqlite"
    check(not dbpath.exists(),"Catalog already exists")
    db=sqlite3.connect(dbpath)
    db.execute("create table recovered(kind text not null,id text not null,board_id text,payload text not null,primary key(kind,id))")
    counts={}
    def insert(kind,obj,bid):
        check(bool(obj.get("id")),"Record ID absent")
        db.execute("insert into recovered values(?,?,?,?)",(kind,obj["id"],bid,json.dumps(obj,ensure_ascii=False)))
        counts[kind]=counts.get(kind,0)+1
    for board in manifest["boards"]:
        bid=board["id"];base=dest/"boards"/bid
        insert("board",load(base/"board.json"),bid)
        cards=load(base/"cards.json");lists=load(base/"lists.json")
        check(len(cards)==board["cards"],"Card count mismatch")
        listids={x["id"] for x in lists}
        for card in cards:
            check(card["idList"] in listids,"Card list absent")
            insert("card",card,bid)
        for kind,filename in [("list","lists.json"),("label","labels.json"),("action","actions.json"),("custom_field","customFields.json")]:
            for row in load(base/filename):insert(kind,row,bid)
    check(counts.get("card",0)==manifest["card_count"]==transfer["card_count"],"Recovered card count mismatch")
    attachments=list(dest.glob("boards/*/cards/*/files/*.metadata.json"))
    check(len(attachments)==manifest["attachment_count"],"Attachment count mismatch")
    for p in attachments:
        meta=load(p);binary=p.parent/meta["file"]
        check(binary.stat().st_size==meta["size"] and digest(binary)==meta["sha256"],"Attachment mismatch")
    db.commit()
    check(db.execute("pragma integrity_check").fetchone()[0]=="ok","SQLite integrity failed")
    check(db.execute("select count(*) from recovered where kind='card'").fetchone()[0]==manifest["card_count"],"SQLite query mismatch")
    db.close()
    report={"status":"PASS_OFFLINE_RECOVERY","counts":counts,"attachments":len(attachments),"verified_files":len(files),"zip_sha256":transfer["sha256"],"sqlite_sha256":digest(dbpath),"production_modified":False,"scope":"Full Drive readback; isolated JSON and binary reconstruction; queryable SQLite catalog. No import into live Trello. External link targets and workspace/account automation are not included."}
    (src/"RESTORE_REPORT.json").write_text(json.dumps(report,indent=2))
    print("PASS_OFFLINE_RECOVERY boards",manifest["board_count"],"cards",manifest["card_count"],"attachments",len(attachments),"files",len(files),flush=True)
if __name__=="__main__":main(sys.argv[1],sys.argv[2])
