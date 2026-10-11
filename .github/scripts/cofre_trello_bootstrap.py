#!/usr/bin/env python3
"""Use existing authorized Supabase credentials in memory, never return secrets."""
import json,os,runpy,urllib.request,urllib.error
PROJECT="yspuaamokjbrosytqjpg"
BRIDGE="https://"+PROJECT+".supabase.co/functions/v1/cofre-trello-export-candidate-v1"
def call(url,token=None,method="GET"):
    req=urllib.request.Request(url,headers={"Authorization":"Bearer "+token} if token else {},method=method)
    with urllib.request.urlopen(req,timeout=60) as response:return json.load(response)
def rejected(token,method,path,expected):
    try:call(BRIDGE+"?path="+path,token,method)
    except urllib.error.HTTPError as e:
        if e.code in expected:return
        raise RuntimeError("Authorization negative test failed") from None
    raise RuntimeError("Unauthorized operation was accepted")
def main():
    pat=os.environ.get("SUPABASE_ACCESS_TOKEN","")
    if not pat:raise RuntimeError("Existing Supabase Actions credential absent")
    keys=call("https://api.supabase.com/v1/projects/"+PROJECT+"/api-keys?reveal=true",pat)
    service=next((k.get("api_key") for k in keys if k.get("name")=="service_role"),None)
    anon=next((k.get("api_key") for k in keys if k.get("name")=="anon"),None)
    if not service:raise RuntimeError("Service authorization unavailable")
    rejected(None,"GET","/health",(401,403))
    if anon:rejected(anon,"GET","/health",(401,403))
    rejected(service,"POST","/health",(405,))
    rejected(service,"GET","/tokens/forbidden",(400,))
    health=call(BRIDGE+"?path=/health",service)
    if not health.get("ready"):raise RuntimeError("Bridge not ready")
    member=call(BRIDGE+"?path=/members/me&fields=username",service)
    if member.get("username")!="construrei":raise RuntimeError("Trello account mismatch; export stopped")
    print("PASS: service-only authentication, anonymous/write/path denial, expected Trello account",flush=True)
    os.environ["TRELLO_BACKUP_BRIDGE"]=BRIDGE
    os.environ["TRELLO_BACKUP_BRIDGE_TOKEN"]=service
    runpy.run_path(".github/scripts/cofre_trello_readonly.py",run_name="__main__")
if __name__=="__main__":
    try:main()
    except urllib.error.HTTPError as e:
        print("BLOCKED: upstream HTTP",e.code);raise SystemExit(1)
    except Exception as e:
        print("BLOCKED:",type(e).__name__);raise SystemExit(1)
