#!/usr/bin/env python3
"""Cofre Zero: CAS semanal de texto Trello; nenhuma credencial nova ou anexos binários.
O manifesto é o ponto completo de recuperação e referencia objetos imutáveis.
Executar apenas no workflow Trello preexistente, ref main, via OIDC original.
"""
import argparse, base64, gzip, hashlib, io, json, os, re, subprocess, tempfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT="construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_CAS/TRELLO_TEXT"
OBJECTS=ROOT+"/OBJECTS"
MANIFESTS=ROOT+"/MANIFESTS"
EXPECTED=("rogeriocibin-alt/construrei-oauth-pages/"
          ".github/workflows/cofre-zero-trello-offsite.yml@refs/heads/main")
GIB=1024**3

def encoded(obj):
    payload=(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(",",":"))+"\n").encode()
    buffer=io.BytesIO()
    with gzip.GzipFile(fileobj=buffer,mode="wb",filename="",mtime=0,compresslevel=6) as f:
        f.write(payload)
    return buffer.getvalue()

def materialize(boards):
    data=defaultdict(list); seen=set(); counts=defaultdict(int)
    for b in boards:
        ident=b["board"].get("id")
        if not isinstance(ident,str) or not re.fullmatch("[0-9a-f]{24}",ident) or ident in seen:
            raise ValueError("Quadro Trello repetido/inválido")
        seen.add(ident)
        for kind,source in (("board",[b["board"]]),("card",b["cards"]),
                            ("list",b["lists"]),("label",b["labels"]),
                            ("custom_field",b["custom_fields"]),("action",b["actions"])):
            itemids=set()
            for row in source:
                rid=row.get("id") if isinstance(row,dict) else None
                if not isinstance(rid,str) or not re.fullmatch("[0-9a-f]{24}",rid) or rid in itemids:
                    raise ValueError("ID ausente/repetido no backup")
                itemids.add(rid)
                bucket = (str(row.get("date",""))[:7] if kind=="action" else
                          rid[:5] if kind=="card" else "all")
                if kind=="action" and not re.fullmatch(r"\d{4}-\d\d",bucket):
                    raise ValueError("Ação sem data válida")
                data[(ident,kind,bucket)].append(row)
                counts[kind]+=1
    if len(seen)<13 or counts["card"]<1500:
        raise ValueError("Cobertura Trello inferior ao histórico homologado")
    parts={"/".join(k):encoded(sorted(v,key=lambda x:x["id"])) for k,v in data.items()}
    return parts,len(seen),dict(counts)

def run(*args, binary=False):
    p=subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=240)
    return p.stdout if binary else p.stdout.decode()

def get_source():
    if os.getenv("GITHUB_WORKFLOW_REF")!=EXPECTED or os.getenv("GITHUB_REF")!="refs/heads/main":
        raise RuntimeError("Workflow OIDC diferente do homologado")
    if os.getenv("GITHUB_EVENT_NAME") not in ("schedule","workflow_dispatch"):
        raise RuntimeError("Evento não autorizado")
    import cofre_trello_bootstrap as auth
    token=auth.id_token()
    payload=json.loads(base64.urlsafe_b64decode(token.split(".")[1]+"==="))
    if not all(auth.check_oidc_claims(payload).values()):
        raise RuntimeError("Credencial OIDC não autorizada")
    info=auth.call("/health",token)
    if not info.get("ready") or info.get("mode")!="OIDC_READ_ONLY":
        raise RuntimeError("Ponte Trello homologada indisponível")
    os.environ["TRELLO_BACKUP_BRIDGE"]=auth.BRIDGE
    import cofre_trello_readonly as client
    boards=client.request("/members/me/boards",{"filter":"all","fields":"all"})
    if not isinstance(boards,list) or len(boards)<13:
        raise RuntimeError("Inventário Trello incompleto")
    result=[]
    for board in boards:
        bid=board["id"]
        cards=client.request("/boards/"+bid+"/cards",{"filter":"all","attachments":"true",
            "checklists":"all","customFieldItems":"true"})
        lists=client.request("/boards/"+bid+"/lists",{"filter":"all"})
        labels=client.request("/boards/"+bid+"/labels",{"limit":1000})
        fields=client.request("/boards/"+bid+"/customFields")
        actions=client.actions(bid)
        if any(not isinstance(q,list) for q in (cards,lists,labels,fields,actions)) or len(labels)>=1000:
            raise RuntimeError("Resposta Trello incompleta")
        result.append({"board":board,"cards":cards,"lists":lists,"labels":labels,
                       "custom_fields":fields,"actions":actions})
    return result

def previous_objects():
    try:
        values=json.loads(run("rclone","lsjson",OBJECTS,"--recursive","--files-only"))
    except subprocess.CalledProcessError:
        # A raiz precisa estar autenticada. Uma falha geral de Drive impede o backup.
        run("rclone","lsd","construrei-drive:")
        return {}
    output={}
    for obj in values:
        name=obj.get("Path","")
        if not re.fullmatch("[a-f0-9]{64}.json.gz",name):
            raise RuntimeError("Objeto estranho no histórico imutável Trello")
        output[name]=obj["Size"]
    return output

def write_delta(parts,board_count,counts,dry_run):
    prior=previous_objects()
    refs={}; missing={}
    for name,blob in sorted(parts.items()):
        digest=hashlib.sha256(blob).hexdigest()
        key=digest+".json.gz"
        if key in prior and prior[key]!=len(blob):
            raise RuntimeError("Colisão de objeto CAS")
        refs[name]={"object":key,"sha256":digest,"bytes":len(blob)}
        if key not in prior: missing[key]=blob
    needed=sum(len(x) for x in missing.values())
    quota=json.loads(run("rclone","about","construrei-drive:","--json"))
    free=quota.get("free")
    if not isinstance(free,int) or free<needed+GIB or sum(prior.values())+needed>10*GIB:
        raise RuntimeError("Limite de armazenamento e reserva de segurança")
    report={"boards":board_count,"counts":counts,"shards":len(refs),
            "new_shards":len(missing),"new_bytes":needed,
            "reuse_existing":len(refs)-len(missing),"binary_attachments":0,
            "production_mutated":False,"dry_run":dry_run}
    if dry_run:return report
    runid=os.getenv("GITHUB_RUN_ID","")
    if not runid.isdecimal():raise RuntimeError("GitHub Run ID ausente")
    name=datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")+"-"+runid+".json"
    manifest={"format":"CONSTRUREI_TRELLO_TEXT_CAS_V1","captured_at":datetime.now(timezone.utc).isoformat(),
              "board_count":board_count,"counts":counts,"shards":refs,"complete":True,
              "source":"Trello via OIDC read-only","binary_attachments":False}
    with tempfile.TemporaryDirectory() as directory:
        directory=Path(directory)
        for key,blob in missing.items():
            f=directory/key
            f.write_bytes(blob)
            run("rclone","copyto",str(f),OBJECTS+"/"+key,"--immutable")
            # Readback byte-for-byte de cada objeto novo antes do manifesto.
            if hashlib.sha256(run("rclone","cat",OBJECTS+"/"+key,binary=True)).hexdigest()!=key[:64]:
                raise RuntimeError("Readback de dado financeiro falhou")
        manifest_path=directory/name
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,sort_keys=True)+"\n")
        run("rclone","copyto",str(manifest_path),MANIFESTS+"/"+name,"--immutable")
        if run("rclone","cat",MANIFESTS+"/"+name,binary=True)!=manifest_path.read_bytes():
            raise RuntimeError("Manifesto financeiro inválido")
    report["manifest"]=name
    return report

def selftest():
    def entity(i,**fields):return {"id":f"{i:024x}",**fields}
    data=[{"board":entity(j+1),"cards":[entity(j+100,desc="custo 100")],
           "lists":[entity(j+300)],"labels":[],"custom_fields":[],
           "actions":[entity(j+500,date="2026-10-17T10:00:00Z")]} for j in range(13)]
    p,n,c=materialize(data)
    assert n==13 and c["card"]==13
    assert p==materialize(data)[0]
    data[0]["cards"][0]["desc"]="custo 200"
    q=materialize(data)[0]
    assert len([k for k in p if p[k]!=q[k]])==1
    assert gzip.decompress(q[next(k for k in p if p[k]!=q[k])])
    try:materialize(data[:12])
    except ValueError:pass
    else:raise AssertionError("Cobertura incompleta aceita")
    return {"status":"PASS","deterministic":True,"single_shard_delta":True}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--selftest",action="store_true")
    parser.add_argument("--dry-run",action="store_true")
    arg=parser.parse_args()
    if arg.selftest:print(json.dumps(selftest()));return
    groups,boards,counts=materialize(get_source())
    print(json.dumps(write_delta(groups,boards,counts,arg.dry_run)))

if __name__=="__main__":main()
