#!/usr/bin/env python3
"""Inventory every owned Netlify site and recover all genuinely published static assets.
Metadata is strict allowlist, never exports environment secrets or functions.
"""
import hashlib,json,os,pathlib,re,sys,urllib.parse,urllib.request,zipfile
from datetime import datetime,timezone
SITES=[
 ("construrei-dashboard","ced2aaac-5345-494c-81f0-e9f0578f8583"),
 ("construrei-f01","261cd338-9242-41b3-b0a0-20dd02670981"),
 ("construrei-knowledge-v3","480bb25d-ef03-4032-9b22-496db28c9c4d"),
 ("construrei-central-failover-v1","769401fa-5091-4845-a870-ed046d49ffac"),
 ("construrei-agenda-v52","fd982870-e7aa-47d4-8acb-94b106d3a743"),
 ("construrei-home-reference-preview-20260930","e4b8680a-af71-4ead-8ed8-718958d6ed20"),
 ("construrei-f00-canonical-preview-20261001","50dfa117-7cf6-4753-982f-e62e47c65e63"),
]
BASE="https://api.netlify.com/api/v1"
OUT=pathlib.Path(os.environ.get("COFRE_OUTPUT_DIR","netlify-inventory"))
TOKEN=os.environ.get("NETLIFY_AUTH_TOKEN","")
def get(path,raw=False):
    url=path if path.startswith(BASE+"/") else BASE+path
    if not url.startswith(BASE+"/"): raise RuntimeError("Unapproved host")
    headers={"Authorization":"Bearer "+TOKEN,"Accept":"application/vnd.bitballoon.v1.raw" if raw else "application/json"}
    req=urllib.request.Request(url,headers=headers,method="GET")
    with urllib.request.urlopen(req,timeout=90) as r:
        return r.read(),r.headers.get("Link","")
def obj(path):
    payload,_=get(path);return json.loads(payload)
def safe(path):
    if not isinstance(path,str):raise RuntimeError("No file path")
    name=path.lstrip("/")
    if not name or "\\" in name or "\x00" in name or any(part in ("",".","..") for part in name.split("/")):
        raise RuntimeError("Bad file path")
    return name
def listing(site):
    url="/sites/"+site+"/files";seen=set();records=[]
    for _ in range(100):
        if url in seen:raise RuntimeError("Pagination loop")
        seen.add(url)
        data,link=get(url);parsed=json.loads(data)
        if not isinstance(parsed,list):raise RuntimeError("Invalid files response")
        records.extend(parsed)
        m=re.search(r'<([^>]+)>;\s*rel="next"',link)
        if not m:return records
        url=m.group(1)
    raise RuntimeError("Pagination cap")
def digest(data):
    return hashlib.sha256(data).hexdigest()
def site_inventory(name,site):
    item=obj("/sites/"+site)
    dep=item.get("published_deploy_id") or (item.get("published_deploy") or {}).get("id")
    result={"name":name,"id":site,"site_url":item.get("url"),"published_deploy_id":dep,"state":"UNPUBLISHED","static_files":0}
    if not dep:return result
    files=listing(site)
    if not files:raise RuntimeError("Published deploy reported but static file listing empty")
    zip_path=OUT/(name+"-"+dep+"-STATIC.zip")
    sha_index=[];paths=set()
    with zipfile.ZipFile(zip_path,"w",compression=zipfile.ZIP_DEFLATED,allowZip64=True) as zipped:
        for item in files:
            path=safe(item.get("path"))
            if path in paths:raise RuntimeError("Duplicate file path")
            paths.add(path)
            sha=str(item.get("sha") or "").lower()
            if not re.fullmatch(r"[0-9a-f]{40}",sha):raise RuntimeError("Missing SHA1")
            raw,_=get("/sites/"+site+"/files/"+urllib.parse.quote(path,safe="/"),True)
            if hashlib.sha1(raw).hexdigest()!=sha:raise RuntimeError("File hash mismatch")
            if item.get("size") is not None and len(raw)!=int(item["size"]):raise RuntimeError("File size mismatch")
            zipped.writestr(path,raw);sha_index.append({"path":path,"bytes":len(raw),"sha1":sha})
    if (obj("/sites/"+site).get("published_deploy_id") or dep)!=dep:raise RuntimeError("Site redeployed mid-copy")
    with zipfile.ZipFile(zip_path) as z:
        if z.testzip() is not None:raise RuntimeError("Corrupt archive")
        for entry in sha_index:
            if hashlib.sha1(z.read(entry["path"])).hexdigest()!=entry["sha1"]:raise RuntimeError("Restore hash mismatch")
    result.update(state="STATIC_VERIFIED",static_files=len(sha_index),archive=zip_path.name,sha256=digest(zip_path.read_bytes()))
    return result
def main():
    if not TOKEN:raise RuntimeError("Netlify authorization unavailable")
    OUT.mkdir(parents=True,exist_ok=True)
    inventory=[];errors=[]
    for name,site in SITES:
        try:
            item=site_inventory(name,site);inventory.append(item)
            print("SITE",name,item["state"],item["static_files"],flush=True)
        except Exception as e:
            errors.append({"name":name,"reason":type(e).__name__})
            print("ERROR",name,type(e).__name__,str(e)[:180],flush=True)
    restored=sum(x["state"]=="STATIC_VERIFIED" for x in inventory)
    without=sum(x["state"]=="UNPUBLISHED" for x in inventory)
    status="PASS_INVENTORY_WITH_PUBLISHED_STATIC" if not errors and len(inventory)==7 and restored>0 else "FAIL_INVENTORY"
    report={"format":"CR_NETLIFY_SITE_INVENTORY_V1","captured_at":datetime.now(timezone.utc).isoformat(),
       "status":status,"registered_sites":7,"inventoried_sites":len(inventory),
       "published_static_verified":restored,"without_published_deploy":without,
       "scope":"7 site metadata; verified static files for published deploys only",
       "not_covered":["site environment secrets","Netlify Functions","DNS","historical deploys","sites without published files"],
       "sites":inventory,"errors":errors,"production_modified":False}
    (OUT/"INVENTORY.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    for p in list(OUT.glob("*")):
        if p.is_file() and p.name!="SHA256SUMS.txt":
            pass
    with (OUT/"SHA256SUMS.txt").open("w") as f:
        for p in sorted(OUT.iterdir()):
            if p.is_file() and p.name!="SHA256SUMS.txt":f.write(digest(p.read_bytes())+"  "+p.name+"\n")
    if status!="PASS_INVENTORY_WITH_PUBLISHED_STATIC":raise RuntimeError("Incomplete inventory/export")
    print("PASS: inventory 7/7, verified published static",restored,"other sites without published deployment",without,flush=True)
if __name__=="__main__":
    try:main()
    except Exception as e:
        print("BACKUP FAILED:",type(e).__name__,str(e)[:160],file=sys.stderr);sys.exit(1)
