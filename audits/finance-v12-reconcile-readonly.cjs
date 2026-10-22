"use strict";
/* Auditoria Cora x Trello estritamente SOMENTE LEITURA, sem escrita contábil. */
const LINE=/^\s*(?:[•*+-]\s*)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*[-–—]\s*(?:R\$\s*)?([\d.]+,\d{2})(?=\s|$)/i;
const CASE=/(?<!\d)(\d{2,5}-(?:24|25|26))(?!\d)/;
function parseLine(line,defaultYear){
 const m=String(line||"").match(LINE);if(!m)return null;
 let y=m[3]?Number(m[3]):Number(defaultYear);if(y<100)y+=2000;
 const mo=Number(m[2]),day=Number(m[1]),v=new Date(Date.UTC(y,mo-1,day));
 if(v.getUTCFullYear()!==y||v.getUTCMonth()+1!==mo||v.getUTCDate()!==day)return null;
 const cents=Math.round(Number(m[4].replace(/\./g,"").replace(",","."))*100);
 if(!Number.isSafeInteger(cents)||cents<=0)return null;
 return {day:String(y)+"-"+String(mo).padStart(2,"0")+"-"+String(day).padStart(2,"0"),cents};
}
function key(c,d,a,direction){return [c,d,String(a),direction].join("|")}
function reconcile(bank,cards,year){
 if(!Array.isArray(bank)||!Array.isArray(cards))throw Error("Arrays required");
 const ids=new Set(),byKey=new Map();
 for(const b of bank){
  if(!b.sourceId||ids.has(b.sourceId))throw Error("Repeated bank id");
  ids.add(b.sourceId);
  if(!Array.isArray(b.caseCodes)||b.caseCodes.length!==1||b.direction!=="debit"||!Number.isSafeInteger(b.cents))continue;
  const k=key(b.caseCodes[0],b.day,b.cents,b.direction);
  byKey.set(k,[...(byKey.get(k)||[]),b]);
 }
 const cardIds=new Set(),rows=[],uses=new Map();
 for(const c of cards){
  if(!c.id||cardIds.has(c.id))throw Error("Repeated card id");
  cardIds.add(c.id);
  const no=String(c.name||"").match(CASE)?.[1];
  if(!no)continue;
  for(const [i,line] of String(c.desc||"").split(/\r?\n/).entries()){
   const p=parseLine(line,year);if(!p)continue;
   const options=byKey.get(key(no,p.day,p.cents,"debit"))||[];
   const entry={cardId:c.id,caseNo:no,line:i,bankId:null,status:"SEM_VINCULO"};
   if(options.length>1)entry.status="BANCO_AMBIGUO";
   if(options.length===1){
    entry.bankId=options[0].sourceId;
    entry.verified=options[0].receiptVerified===true&&line.includes(entry.bankId);
    entry.status="EVIDENCIA_BILATERAL_COMPATIVEL";
    uses.set(entry.bankId,[...(uses.get(entry.bankId)||[]),c.id+":"+i]);
   }
   rows.push(entry);
  }
 }
 for(const row of rows){
  if(row.bankId&&(uses.get(row.bankId)||[]).length>1)row.status="DUPLICIDADE_PARA_REVISAO";
  else if(row.bankId&&row.verified===true)row.status="CONFIRMADO_COM_EVIDENCIA";
 }
 const counts={};for(const x of rows)counts[x.status]=(counts[x.status]||0)+1;
 return {rows,counts,bankIds:ids.size,cardIds:cardIds.size,
  uniqueMatchedBank:uses.size,reusedBank:[...uses.values()].filter(a=>a.length>1).length};
}
module.exports={parseLine,reconcile};
