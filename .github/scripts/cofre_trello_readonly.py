#!/usr/bin/env python3
"""Cofre Zero Trello candidate: read-only source export into a private offsite archive."""
import hashlib, json, os, pathlib, re, sys, time, urllib.error, urllib.parse, urllib.request, zipfile
from datetime import datetime, timezone

KEY=os.getenv("TRELLO_API_KEY","")
TOKEN=os.getenv("TRELLO_API_TOKEN","")
BRIDGE=os.getenv("TRELLO_BACKUP_BRIDGE","")
BRIDGE_TOKEN=os.getenv("TRELLO_BACKUP_BRIDGE_TOKEN","")
READY=bool(BRIDGE and BRIDGE_TOKEN) or bool(KEY and TOKEN)
DEST=pathlib.Path(os.getenv("TRELLO_EXPORT_DIR","trello-private-snapshot"))
ROOT="https://api.trello.com/1"
MAX_BYTES=int(os.getenv("TRELLO_MAX_BYTES",str(2*1024*1024*1024)))
TOTAL_BYTES=0
class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        new=super().redirect_request(req,fp,code,msg,headers,newurl)
        if new and urllib.parse.urlsplit(newurl).hostname != "api.trello.com":
            new.remove_header("Authorization")
        return new
OPENER=urllib.request.build_opener(SafeRedirect())
OAUTH='OAuth oauth_consumer_key="'+KEY+'", oauth_token="'+TOKEN+'"'
_OIDC={"token":"","created":0.0}
def github_oidc():
    now=time.monotonic()
    if _OIDC["token"] and now-_OIDC["created"]<120:
        return _OIDC["token"]
    base=os.getenv("ACTIONS_ID_TOKEN_REQUEST_URL","")
    auth=os.getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN","")
    if not base or not auth:raise RuntimeError("OIDC runtime unavailable")
    url=base+("&" if "?" in base else "?")+"audience=construrei-cofre-trello-readonly-v1"
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+auth},method="GET")
    with urllib.request.urlopen(req,timeout=30) as r:
        token=json.load(r).get("value","")
    if not token:raise RuntimeError("GitHub OIDC token unavailable")
    _OIDC.update(token=token,created=time.monotonic())
    return token
def request(path,params=None,binary=False):
    url=ROOT+path
    if params:url += "?"+urllib.parse.urlencode(params)
    if BRIDGE:url=BRIDGE+"?"+urllib.parse.urlencode({"path":path,**(params or {})})
    for attempt in range(7):
        try:
            headers={"Authorization":"Bearer "+github_oidc(),"User-Agent":"CONSTRUREI-CofreZero-ReadOnly/3"} if BRIDGE else {"Authorization":OAUTH,"User-Agent":"CONSTRUREI-CofreZero-ReadOnly/1"}
            req=urllib.request.Request(url,headers=headers,method="GET")
            time.sleep(.15)
            with OPENER.open(req,timeout=90) as resp:
                body=resp.read(MAX_BYTES+1) if binary else resp.read(20*1024*1024)
                if binary:
                    if len(body)>MAX_BYTES:raise RuntimeError("Single attachment exceeds safety limit")
                    return body
                return json.loads(body)
        except urllib.error.HTTPError as e:
            if e.code in (429,500,502,503,504) and attempt<6:
                time.sleep(min(2**attempt,60));continue
            raise RuntimeError("Trello read failed HTTP "+str(e.code)+" on "+path) from None
    raise RuntimeError("Retries exceeded "+path)
def write_json(name,obj):
    name.parent.mkdir(parents=True,exist_ok=True)
    name.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2),encoding="utf-8")
def safe_name(name):
    s=re.sub(r'[^a-zA-Z0-9._ -]',"_",str(name or "attachment"))[:120]
    return s if s not in ("",".","..") else "attachment"
def actions(board_id):
    all_items=[];last=None;seen=set()
    for _ in range(150):
        params={"limit":1000,"filter":"all"}
        if last:params["before"]=last
        batch=request("/boards/"+board_id+"/actions",params)
        if not isinstance(batch,list):raise RuntimeError("Invalid action page")
        if not batch: return all_items
        if any(not a.get("id") for a in batch):raise RuntimeError("Action without id")
        fresh=[a for a in batch if a["id"] not in seen]
        if not fresh:raise RuntimeError("Action pagination repeated")
        all_items.extend(fresh)
        seen.update(a["id"] for a in fresh)
        if len(batch)<1000:return all_items
        last=batch[-1]["id"]
    raise RuntimeError("Action pagination safety cap reached")
def export():
    global TOTAL_BYTES
    if not READY:raise RuntimeError("BLOCKED: Trello API read credentials missing; no download attempted")
    DEST.mkdir(parents=True,exist_ok=True)
    boards=request("/members/me/boards",{"filter":"all","fields":"all"})
    if not isinstance(boards,list) or len(boards)<13:raise RuntimeError("No boards discovered")
    manifest={"format":"CONSTRUREI_TRELLO_OFFSITE_V1","captured_at":datetime.now(timezone.utc).isoformat(),
      "board_count":len(boards),"boards":[],"attachment_count":0,"attachment_bytes":0,
      "external_link_attachments_metadata_only":0,"complete":False,"production_modified":False}
    seen=set()
    for board in boards:
        bid=str(board["id"])
        if not re.fullmatch(r"[0-9a-f]{24}",bid):raise RuntimeError("Unexpected board ID")
        if bid in seen:raise RuntimeError("Duplicate board ID")
        seen.add(bid)
        cards=request("/boards/"+bid+"/cards",{"filter":"all","attachments":"true","checklists":"all","customFieldItems":"true"})
        if not isinstance(cards,list):raise RuntimeError("Invalid board card listing")
        parent=DEST/"boards"/bid
        write_json(parent/"board.json",board)
        write_json(parent/"cards.json",cards)
        write_json(parent/"lists.json",request("/boards/"+bid+"/lists",{"filter":"all"}))
        labels=request("/boards/"+bid+"/labels",{"limit":1000})
        if len(labels)>=1000:raise RuntimeError("Label listing limit reached")
        write_json(parent/"labels.json",labels)
        write_json(parent/"customFields.json",request("/boards/"+bid+"/customFields"))
        write_json(parent/"actions.json",actions(bid))
        count=0
        for card in cards:
            cid=str(card.get("id",""))
            if not re.fullmatch(r"[0-9a-f]{24}",cid):raise RuntimeError("Invalid card ID")
            carddir=parent/"cards"/cid
            if card.get("idChecklists"):
                write_json(carddir/"checklists.json",card.get("checklists") if isinstance(card.get("checklists"),list) else request("/cards/"+cid+"/checklists"))
            if not card.get("badges",{}).get("attachments",0):
                continue
            attachments=card.get("attachments") if isinstance(card.get("attachments"),list) else request("/cards/"+cid+"/attachments")
            write_json(carddir/"attachments.json",attachments)
            for att in attachments:
                if not att.get("isUpload"):
                    manifest["external_link_attachments_metadata_only"]+=1
                    continue
                aid=str(att.get("id",""))
                if not re.fullmatch(r"[0-9a-f]{24}",aid):raise RuntimeError("Invalid attachment ID")
                original_filename=str(att.get("fileName") or att.get("name") or "attachment")
                filename=safe_name(original_filename)
                blob=request("/cards/"+cid+"/attachments/"+aid+"/download/"+urllib.parse.quote(original_filename,safe=""),binary=True)
                TOTAL_BYTES+=len(blob)
                if TOTAL_BYTES>MAX_BYTES:raise RuntimeError("Total attachment limit exceeded; no completed archive published")
                if att.get("bytes") is not None and len(blob)!=int(att["bytes"]):
                    raise RuntimeError("Attachment size mismatch "+aid)
                target=carddir/"files"/(aid+"_"+filename)
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes(blob)
                count+=1
                manifest["attachment_count"]+=1
                manifest["attachment_bytes"]+=len(blob)
                write_json(carddir/"files"/(aid+".metadata.json"),
                   {"attachment_id":aid,"file":target.name,"sha256":hashlib.sha256(blob).hexdigest(),"size":len(blob)})
        manifest["boards"].append({"id":bid,"name":board.get("name"),"cards":len(cards),"uploaded_attachments":count})
        print("Board exported",len(manifest["boards"]),"/",len(boards),"cards",len(cards),"binaries",count,flush=True)
    manifest["card_count"]=sum(x["cards"] for x in manifest["boards"])
    manifest["complete"]=True
    write_json(DEST/"RECOVERY_MANIFEST.json",manifest)
    return manifest
def main():
    if not READY:
        print("BLOCKED: TRELLO_API_KEY / TRELLO_API_TOKEN absent; no Trello operation")
        return 2
    manifest=export()
    file_index=[]
    for p in sorted(DEST.rglob("*")):
        if p.is_file():
            h=hashlib.sha256()
            with p.open("rb") as stream:
                for chunk in iter(lambda:stream.read(1024*1024),b""):h.update(chunk)
            file_index.append({"path":str(p.relative_to(DEST)),"bytes":p.stat().st_size,"sha256":h.hexdigest()})
    write_json(DEST/"FILE_MANIFEST.json",file_index)
    archive=DEST.parent/"TRELLO_READONLY_SNAPSHOT.zip"
    with zipfile.ZipFile(archive,"w",compression=zipfile.ZIP_DEFLATED,allowZip64=True) as z:
        for p in sorted(DEST.rglob("*")):
            if p.is_file():z.write(p,p.relative_to(DEST))
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:raise RuntimeError("ZIP CRC recovery test failed")
        m=json.loads(z.read("RECOVERY_MANIFEST.json"))
        if not m.get("complete") or m["card_count"]!=manifest["card_count"]:
            raise RuntimeError("Manifest validation failed")
    size=archive.stat().st_size
    h=hashlib.sha256()
    with archive.open("rb") as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b""):h.update(chunk)
    sha=h.hexdigest()
    write_json(DEST.parent/"TRANSFER_MANIFEST.json",{"archive":archive.name,
      "archive_size":size,"sha256":sha,
      "board_count":manifest["board_count"],"card_count":manifest["card_count"],
      "status":"VERIFIED_ZIP_STATIC_SNAPSHOT","scope":"read-only Trello data and uploaded binaries, external link targets are not copied",
      "production_modified":False})
    print("PASS: boards",manifest["board_count"],"cards",manifest["card_count"],"uploaded attachments",manifest["attachment_count"])
    return 0
if __name__=="__main__":
    try:sys.exit(main())
    except Exception as exc:
        print("BLOCKED/FAILED: "+str(exc),file=sys.stderr)
        sys.exit(1)
