#!/usr/bin/env python3
"""Read-only Netlify historical deploy metadata coverage probe.

Never fetches credentials, site env, functions, build logs, source code, or
individual private deployment URLs. Never issues POST/PUT/DELETE. Public CI
logs contain only named projects, counts and state categories.
"""
import json
import os
import urllib.request
import urllib.error
from urllib.parse import urlencode
from cofre_netlify_inventory_offsite import SITES

API="https://api.netlify.com/api/v1"
ALLOWED_STATES={"ready","old","error","building","enqueued","new",
                "uploading","uploaded","preparing","prepared","processed",
                "processing","retrying","pending_review","accepted","rejected"}
MAX_PAGES=5

def main():
    token=os.environ.get("NETLIFY_AUTH_TOKEN")
    if not token:
        raise RuntimeError("BLOCKED: existing Netlify token is absent")
    total=0; candidates=0
    for name, site in SITES:
        records=[]; states={}
        for page in range(1,MAX_PAGES+1):
            path="/sites/"+site+"/deploys?"+urlencode({"page":page,"per_page":100})
            request=urllib.request.Request(API+path,headers={
                "Authorization":"Bearer "+token,
                "Accept":"application/json",
                "User-Agent":"CR-Cofre-Zero-historical-metadata-readonly/1"
            },method="GET")
            try:
                with urllib.request.urlopen(request,timeout=30) as res:
                    payload=json.load(res)
            except urllib.error.HTTPError:
                raise RuntimeError("BLOCKED: Netlify historical deploy metadata inaccessible")
            if not isinstance(payload,list):
                raise RuntimeError("BLOCKED: historical deploy API response is not a list")
            for dep in payload:
                if not isinstance(dep,dict) or not isinstance(dep.get("id"),str):
                    raise RuntimeError("BLOCKED: incomplete deployment identity")
                state=dep.get("state")
                if not isinstance(state,str):
                    raise RuntimeError("BLOCKED: historical deploy state absent")
                states[state]=states.get(state,0)+1
                records.append((dep["id"],state))
            if len(payload)<100:
                break
            if page==MAX_PAGES:
                raise RuntimeError("BLOCKED: Netlify historical deploy pagination incomplete")
        ids=[x[0] for x in records]
        if len(ids)!=len(set(ids)):
            raise RuntimeError("BLOCKED: duplicate deployments")
        recoverable=sum(state in ("ready","old") for _,state in records)
        total+=len(records);candidates+=recoverable
        print("NETLIFY_HISTORY",name,"deploys",len(records),
              "archived_ready_or_old",recoverable,"states",json.dumps(states,sort_keys=True))
    assert len(SITES)==7
    print("PASS: seven Netlify sites inspected for historical metadata via GET only")
    print("RESULT: known historical deploy records",total,"ready_or_old",candidates)
    print("LIMIT: discovery is not a binary deployment restore; no files downloaded or sites modified")
if __name__=="__main__":
    main()
