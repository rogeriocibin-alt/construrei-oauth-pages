#!/usr/bin/env python3
"""Read-only export of Netlify published static assets; DOES NOT export functions/secrets."""
import hashlib, json, os, pathlib, re, sys, urllib.parse, urllib.request, zipfile
from datetime import datetime, timezone
SITES=[
("construrei-dashboard","ced2aaac-5345-494c-81f0-e9f0578f8583"),
("construrei-f01","261cd338-9242-41b3-b0a0-20dd02670981"),
("construrei-knowledge-v3","480bb25d-ef03-4032-9b22-496db28c9c4d"),
("construrei-central-failover-v1","769401fa-5091-4845-a870-ed046d49ffac"),
("construrei-agenda-v52","fd982870-e7aa-47d4-8acb-94b106d3a743"),
("construrei-home-reference-preview-20260930","e4b8680a-af71-4ead-8ed8-718958d6ed20"),
("construrei-f00-canonical-preview-20261001","50dfa117-7cf6-4753-982f-e62e47c65e63")]
BASE="https://api.netlify.com/api/v1"
TOKEN=os.environ.get("NETLIFY_AUTH_TOKEN","")
OUT=pathlib.Path(os.environ.get("COFRE_OUTPUT_DIR","netlify-output"))
RAW="application/vnd.bitballoon.v1.raw"
def api(url,raw=False):
    url=url if url.startswith(BASE+"/") else BASE+url
    heads={"Authorization":"Bearer "+TOKEN,"User-Agent":"CONSTRUREI-Cofre-Zero/1",
           "Accept":RAW if raw else "application/json"}
    if raw: heads["Content-Type"]=RAW
    req=urllib.request.Request(url,headers=heads,method="GET")
    with urllib.request.urlopen(req,timeout=60) as rsp:
        return rsp.read(),rsp.headers.get("Link","")
def listing(site):
    target="/sites/"+site+"/files"; seen=set(); out=[]
    for _ in range(100):
        if target in seen: raise ValueError("Pagination cycle")
        seen.add(target)
        body,links=api(target)
        data=json.loads(body)
        if not isinstance(data,list): raise ValueError("File list not an array")
        out.extend(data)
        m=re.search(r'<([^>]+)>;\s*rel="next"',links)
        if not m: return out
        target=m.group(1)
        if not target.startswith(BASE+"/"):raise ValueError("Unsafe pagination URL")
    raise ValueError("Too many pages")
def safe(name):
    if not isinstance(name,str):raise ValueError("Missing file path")
    path=name.lstrip("/")
    if not path or "\\" in path or chr(0) in path or any(p in (".","..","") for p in path.split("/")):
        raise ValueError("Unsafe file path")
    return path
def published(site):
    body,_=api("/sites/"+site)
    d=json.loads(body)
    return (d.get("published_deploy") or {}).get("id") or d.get("published_deploy_id")
def copy_site(name,site):
    dep=published(site)
    if not dep:raise ValueError("Published deploy ID unavailable")
    items=listing(site)
    if not items:raise ValueError("Published static files empty")
    dest=OUT/(name+"-"+dep+"-STATIC.zip"); found=set(); rec=[]
    with zipfile.ZipFile(dest,"w",compression=zipfile.ZIP_DEFLATED) as z:
        for item in items:
            path=safe(item.get("path"))
            if path in found:raise ValueError("Duplicate file")
            found.add(path)
            expected=str(item.get("sha","")).lower()
            if not re.fullmatch("[0-9a-f]{40}",expected):
                raise ValueError("Missing SHA1 for "+path)
            blob,_=api("/sites/"+site+"/files/"+urllib.parse.quote(path,safe="/"),True)
            digest=hashlib.sha1(blob).hexdigest()
            if digest!=expected:raise ValueError("SHA1 mismatch "+path)
            if item.get("size") is not None and int(item["size"])!=len(blob):
                raise ValueError("Size mismatch "+path)
            z.writestr(path,blob)
            rec.append({"path":path,"sha1":digest,"bytes":len(blob)})
    if published(site)!=dep:raise ValueError("Site redeployed during export; snapshot invalid")
    with zipfile.ZipFile(dest) as z:
        if len(z.namelist())!=len(rec):raise ValueError("ZIP count mismatch")
        for f in rec:
            if hashlib.sha1(z.read(f["path"])).hexdigest()!=f["sha1"]:
                raise ValueError("ZIP verification failed")
    return {"name":name,"site_id":site,"deploy_id":dep,"archive":dest.name,
            "archive_sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),
            "file_count":len(rec),"files":rec,"status":"VERIFIED_STATIC_ONLY"}
def main():
    if not TOKEN:
        print("BLOCKED: NETLIFY_AUTH_TOKEN missing in Actions secrets",file=sys.stderr)
        return 2
    OUT.mkdir(parents=True,exist_ok=True)
    done=[];errors=[]
    for name,site in SITES:
        try:
            item=copy_site(name,site)
            done.append(item)
            print("OK",name,item["file_count"])
        except Exception as exc:
            errors.append({"name":name,"error":str(exc)[:160]})
            print("FAILED",name,str(exc)[:160],file=sys.stderr)
    report={"format":"CONSTRUREI_NETLIFY_STATIC_OFFSITE_V1",
      "captured_utc":datetime.now(timezone.utc).isoformat(),
      "scope":"published static assets; not functions, secrets, configs, DNS or deploy history",
      "expected_sites":7,"verified_sites":len(done),"sites":done,"errors":errors,
      "status":"PASS_STATIC_ONLY" if len(done)==7 and not errors else "PARTIAL",
      "production_modified":False}
    (OUT/"NETLIFY_STATIC_MANIFEST.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
    return 0 if len(done)==7 and not errors else 1
if __name__=="__main__":sys.exit(main())
