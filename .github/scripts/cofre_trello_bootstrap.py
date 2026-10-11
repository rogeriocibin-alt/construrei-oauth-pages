#!/usr/bin/env python3
"""Use GitHub Actions ephemeral OIDC: no management PAT and no Trello token on runner."""
import json,os,runpy,urllib.request,urllib.error,urllib.parse

BRIDGE="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cofre-trello-oidc-readonly-v1"
AUD="construrei-cofre-trello-readonly-v1"

def id_token(audience=AUD):
    base=os.environ.get("ACTIONS_ID_TOKEN_REQUEST_URL","")
    bearer=os.environ.get("ACTIONS_ID_TOKEN_REQUEST_TOKEN","")
    if not base or not bearer:
        raise RuntimeError("GitHub Actions OIDC runtime environment missing")
    separator="&" if "?" in base else "?"
    url=base+separator+"audience="+urllib.parse.quote(audience,safe="")
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+bearer},method="GET")
    with urllib.request.urlopen(req,timeout=25) as r:
        token=json.load(r).get("value","")
        if not token:raise RuntimeError("GitHub did not issue an OIDC token")
        return token

def call(path,token=None,method="GET"):
    url=BRIDGE+"?path="+urllib.parse.quote(path,safe="/")
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token} if token else {},method=method)
    with urllib.request.urlopen(req,timeout=30) as r:
        return json.load(r)

def rejected(token,method,path,statuses):
    try:call(path,token,method)
    except urllib.error.HTTPError as e:
        if e.code in statuses:return
        raise RuntimeError("Authorization negative test failed with unexpected status") from None
    raise RuntimeError("Access-control negative test unexpectedly accepted")

def main():
    print("CHECK: temporary GitHub OIDC / Supabase read-only bridge",flush=True)
    token=id_token()
    rejected(None,"GET","/health",(401,403))
    rejected(id_token("construrei-wrong-audience-negative-test"),"GET","/health",(401,403))
    rejected(token,"POST","/health",(405,))
    rejected(token,"GET","/not-allowed",(400,))
    health=call("/health",token)
    if not health.get("ready") or health.get("mode")!="OIDC_READ_ONLY":
        raise RuntimeError("OIDC bridge is not ready")
    member=call("/members/me&fields=username",token) if False else None
    # Query parameters must be passed separately, keeping path allowlist strict.
    url=BRIDGE+"?path=/members/me&fields=username"
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token},method="GET")
    with urllib.request.urlopen(req,timeout=35) as r:member=json.load(r)
    if member.get("username")!="construrei":
        raise RuntimeError("Trello account mismatch; export stopped")
    print("PASS: signature, audience, repository, exact workflow, denied requests, Trello account",flush=True)
    os.environ["TRELLO_BACKUP_BRIDGE"]=BRIDGE
    os.environ.pop("TRELLO_BACKUP_BRIDGE_TOKEN",None)
    runpy.run_path(".github/scripts/cofre_trello_readonly.py",run_name="__main__")

if __name__=="__main__":
    try:main()
    except urllib.error.HTTPError as e:
        print("BLOCKED: remote authorization/API status",e.code,flush=True);raise SystemExit(1)
    except Exception as e:
        print("BLOCKED:",type(e).__name__,str(e)[:160],flush=True);raise SystemExit(1)
