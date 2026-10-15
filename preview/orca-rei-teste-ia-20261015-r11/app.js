function orcaSetMode(){const report=document.getElementById('mode').value==='report';document.getElementById('pricesPanel').style.display=report?'none':'';document.getElementById('orcaPhotoPanel').style.display=(report||document.getElementById('orcaIncludeBudgetPhotos').checked)?'':'none';document.getElementById('orcaBudgetPhotoOpt').style.display=report?'none':'';document.getElementById('orcaIncludeBudgetPhotos').checked=report?false:document.getElementById('orcaIncludeBudgetPhotos').checked;}
document.addEventListener('DOMContentLoaded',orcaSetMode);
const endpoint='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-orca-rei-test-bench-20261014';async function send(action){
 const label=document.getElementById('label'),out=document.getElementById('out');
 if(orcaMarketBusy){label.textContent='Precificação em andamento. Confira os resultados antes de gerar outra vez.';return;}
 const mode=document.getElementById('mode').value,provider=document.getElementById('provider').value;
 const raw=document.getElementById('src').value.trim();
 if(!raw){label.textContent='Escreva os serviços e as informações da obra antes de gerar.';return}
 label.textContent='Preparando documentação...';
 try{
  const files=[...document.getElementById('pdffiles').files||[]];
  if(mode==='report'&&files.length&&files.some((_,i)=>!String(orcaPhotoCaptions[i]||'').trim())){
    label.textContent='Obtendo legendas visuais antes de gerar o parecer...';
    await orcaGenerateCaptions();
    if(files.some((_,i)=>!String(orcaPhotoCaptions[i]||'').trim())){label.textContent='Análise visual pendente. Revise ou preencha as legendas e gere novamente.';return}
  }
  // Imagens não comprovam causalidade nem autorizam itens de serviço.
  let source=raw.slice(0,3400);
  if(mode==='report'&&files.length){
    source+='\n\nOBSERVAÇÕES VISUAIS INFORMADAS EM FOTOS (NÃO SIGNIFICAM SERVIÇOS AUTORIZADOS, REPAROS EXECUTADOS OU CAUSAS COMPROVADAS):\n';
    source+=orcaPhotoCaptions.map((v,i)=>'Foto '+(i+1)+': '+String(v||'').slice(0,190)).join('\n');
    source+='\nDistinguir relato da vistoria, registro visual e hipótese. Pintura visível não integra automaticamente o escopo contratado.';
  }
  label.textContent='Gerando com '+(provider==='auto'?'IA disponível':provider)+'...';
  let response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,source:source.slice(0,4950),mode,provider})});
  const data=await response.json();
  label.textContent=data.ok?'Resposta real: '+data.provider:data.error?'Falha na geração':'Formatação local (sem IA)';
  out.textContent=data.output||(data.error==='cooldown'||data.error==='Limite de consumo: cooldown'?'Aguarde um minuto para tentar novamente.':data.error)||'Sem resultado';
  if(data.ok&&mode==='budget'){crPriceItems=[];loadPriceItems();if(!crPriceItems.length){document.getElementById('priceStatus').textContent='Falha na extração dos itens comerciais. Confira se o texto gerado tem SERVIÇOS/MATERIAIS e linhas QTD. Não houve precificação.';return;}applyPriceItems(false);await orcaMarketPrices()}
 }catch(e){label.textContent='Falha de geração';out.textContent=String(e.message||e)}
}
fetch(endpoint+'?status=1').then(r=>r.json()).then(x=>{document.getElementById('ai').disabled=!x.model_available;document.getElementById('status').textContent=x.model_available?'Groq 120B • Gemini '+(x.gemini_configured?'com chave detectada':'sem chave detectada')+' • Teto interno 1000/dia (cotas reais dependem dos provedores)':'A formatação pode ser testada; IA real exige chave Groq no backend.'})
function pdfEsc(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pdfVal(id){return(document.getElementById(id).value||'').trim()}
function savePdfLogo(el){var f=el.files&&el.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{localStorage.setItem("cr_pdf_logo_710",String(rd.result));alert("Logomarca salva neste navegador.")}catch(e){alert("Imagem grande demais; reduza o arquivo.")}};rd.readAsDataURL(f)}
async function exportPdf(){
var txt=document.getElementById('out').textContent||'';
if(orcaMarketBusy&&document.getElementById('mode').value==='budget'){alert('Aguarde os preços terminarem de ser sugeridos.');return}
if(document.getElementById('mode').value==='budget'&&crPriceItems.some(i=>i.siteReviewRequired)&&!window.confirm('ATENÇÃO: há serviços com acesso ou segurança a confirmar; emitir somente orçamento preliminar?'))return
if(txt.length<30||txt.indexOf('Provedores indisponíveis')===0){alert('Gere primeiro um orçamento ou parecer válido.');return}
if(document.getElementById('mode').value==='budget'){
 if(!crPriceItems.length)loadPriceItems();
 if(!crPriceItems.length){document.getElementById('priceStatus').textContent='Não foram encontrados itens comerciais estruturados. Verifique a geração do orçamento antes de imprimir.';return;}
 const invalid=crPriceItems.filter((item,i)=>!Number.isFinite(crNumber(document.getElementById('crq'+i)?.value))||crNumber(document.getElementById('crq'+i)?.value)<=0||!Number.isFinite(crNumber(document.getElementById('crv'+i)?.value)));
 if(invalid.length&&!document.getElementById('orcaAllowDraft').checked){document.getElementById('priceStatus').textContent=invalid.length+' item(ns) sem quantidade/preço válido. O PDF comercial foi bloqueado. A IA será consultada novamente; caso permaneçam pendências, ative o rascunho explicitamente ou revise valores.';document.getElementById('pricesPanel').scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(invalid.length&&!window.confirm('RASCUNHO SEM PREÇOS: '+invalid.length+' item(ns) sem valor. Não constitui proposta comercial. Deseja imprimir esse rascunho?'))return;
 if(orcaMarketProposals>0&&!window.confirm('Há estimativas automáticas preliminares. Confirma que revisou preços, materiais, escopo e acesso antes de imprimir?'))return;
}
var isReport=document.getElementById('mode').value==='report';var logo=CR_LOGO_DATA;
var isPreliminary=!isReport&&(crPriceItems.some(i=>i.assumedQty||i.priceReference)||orcaMarketProposals>0||/A DEFINIR/i.test(txt));
var title=isReport?'PARECER TÉCNICO':(isPreliminary?'ORÇAMENTO PRELIMINAR':'ORÇAMENTO');if(!isReport&&document.getElementById('orcaAllowDraft').checked&&/A DEFINIR/i.test(txt))title='RASCUNHO NÃO PRECIFICADO';
var subject=pdfVal('pdftitle');if(!subject||/^(servi[çc]o|vistoria\s*\/\s*servi[çc]o)$/i.test(subject))subject=orcaInferSubject(document.getElementById('src').value);
var num=pdfVal('pdfnumber')||'A DEFINIR';
var fields=[['CLIENTE / ORIGEM',pdfVal('pdfclient')||'Não informado'],['ENDEREÇO',pdfVal('pdfaddress')||'Não informado'],['DATA',new Date().toLocaleDateString('pt-BR')],['RESPONSÁVEL',pdfVal('pdfperson')||'CONSTRU-REI']];
var raw=txt.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(function(x){return x&&!/^PARECER T[ÉE]CNICO ANAL[ÍI]TICO[.]?$/i.test(x)});
var sections=[],cur=null;
var headings=/^(?:\d+[.)]\s*)?(SITUA[ÇC][ÃA]O RELATADA|OBJETIVO E ESCOPO.*|VERIFICA[ÇC][ÕO]ES REALIZADAS|AN[ÁA]LISE T[ÉE]CNICA.*|HIP[ÓO]TESE T[ÉE]CNICA|RECOMENDA[ÇC][ÕO]ES.*|INFORMA[ÇC][ÕO]ES A CONFIRMAR|CONSIDERA[ÇC][ÕO]ES DE SEGURAN[ÇC]A|CONCLUS[ÃA]O|SERVI[ÇC]OS.*|MATERIAIS|RESUMO|OBSERVA[ÇC][ÕO]ES T[ÉE]CNICAS|OBSERVA[ÇC][ÕO]ES)\s*:?\s*$/i;
raw.forEach(function(line){if(headings.test(line)){cur={heading:line,text:[]};sections.push(cur)}else{if(!cur){cur={heading:isReport?'OBJETIVO E ESCOPO':'DESCRIÇÃO',text:[]};sections.push(cur)}cur.text.push(line)}});
if(isReport)sections=sections.filter(function(section){return !(section.heading.toUpperCase().startsWith('OBJETIVO E ESCOPO')&&section.text.length===1&&/^PARECER TÉCNICO ANALÍTICO[.]?$/i.test(section.text[0]))});
var body=sections.map(function(s,i){return '<section><h2>'+(i+1)+'. '+pdfEsc(s.heading)+'</h2>'+s.text.map(function(t){var cls=/^TOTAL|^QTD\./.test(t)?'money':/^\d+\.\s+[A-ZÁ-Ú]/.test(t)?'service':'';return '<p class="'+cls+'">'+pdfEsc(t)+'</p>'}).join('')+'</section>'}).join('');
if(!isReport)body=orcaBudgetPdfBody(txt);
var files=(isReport||document.getElementById('orcaIncludeBudgetPhotos').checked)?Array.from(document.getElementById('pdffiles').files||[]).slice(0,6):[];
if(isReport&&files.length===0&&!window.confirm('PARECER SEM FOTOS: o documento sairá sem registros fotográficos. Deseja continuar mesmo assim?'))return;
if(files.length&&files.some(function(_,i){return !String(orcaPhotoCaptions[i]||'').trim()})){alert('Fotos sem legenda. Gere as legendas pela IA ou escreva uma legenda antes de imprimir.');return}
var images=await Promise.all(files.map(function(f){return new Promise(function(resolve){var rd=new FileReader();rd.onload=function(){resolve({src:rd.result,name:f.name})};rd.onerror=function(){resolve(null)};rd.readAsDataURL(f)})}));
images=images.filter(Boolean);
if(images.length!==files.length){alert('Falha ao carregar uma das fotografias. Corrija o anexo e tente novamente.');return}
if(images.length){body+='<section><h2>'+(sections.length+1)+'. REGISTROS FOTOGRÁFICOS</h2><div class="photos">'+images.map(function(p,i){return '<figure><img src="'+p.src+'"><figcaption>'+(i+1)+'. '+pdfEsc((orcaPhotoCaptions[i]||'Legenda pendente de revisão'))+'</figcaption></figure>'}).join('')+'</div><p class="note">Legendas descrevem apenas elementos visíveis. Fotografias não comprovam a causa da infiltração nem constituem autorização de serviços adicionais. Confirmar correspondência com a vistoria.</p></section>'}
if(isReport&&images.length){
 const photoTxt=orcaPhotoCaptions.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const scopeTxt=String(document.getElementById('src').value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/(pintura|pintando|pincel|tinta|pintor)/.test(photoTxt)&&!/pintur/.test(scopeTxt)){
   body+='<p class="proposal-notes"><strong>NOTA SOBRE AS FOTOS:</strong> Parte dos registros mostra atividades de pintura/acabamento. Esses registros não demonstram que pintura foi contratada ou integra o escopo deste parecer.</p>';
 }
}
var cs='@page{size:A4;margin:14mm 13mm 17mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#17344b;margin:0}header{position:relative;margin:0 0 10mm;display:flex;border-top:4px solid #ddb327;height:28mm;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}header .logo{width:30%;display:flex;justify-content:center;align-items:center;font-size:20px;color:#073b64;font-weight:bold}header .blue{width:70%;background:#07385f;color:white;padding:10px 16px}header h1{font-size:19px;margin:0}header b{color:#d5ae27;font-size:15px}header small{display:block;margin-top:5px}.info{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:15px}.info div{background:#eff6fa;border:1px solid #cedde7;border-radius:4px;padding:8px;overflow-wrap:anywhere}.info strong{color:#08527a;display:block;font-size:8px;margin-bottom:5px}h2{break-after:avoid;color:white;background:#073d68;padding:6px 10px;font-size:11px;border-radius:3px;margin:16px 0 8px}p{font-size:10.5px;line-height:1.45;margin:5px 8px;white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3;break-inside:avoid}section{break-inside:auto}section h2{break-after:avoid;page-break-after:avoid}p.service{font-weight:bold;color:#0a3b64}p.money{background:#f0f6fa;padding:6px;font-weight:700}.photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.photos figure{border:1px solid #d0dfe9;background:#f3f8fb;padding:6px;margin:0;break-inside:avoid;page-break-inside:avoid;min-width:0}.photos img{width:100%;height:125px;object-fit:contain;background:#e7edf3;display:block}.photos figcaption{font-size:9px;line-height:1.35;margin-top:5px;overflow-wrap:anywhere}.note{font-size:9px;color:#567}.footer{position:static;bottom:auto;left:auto;right:auto;background:linear-gradient(to right,#07385f 78%,#d8ab1a 78%);min-height:13mm;display:flex;align-items:center;justify-content:space-around;color:white;font-size:8px;padding:3mm 2mm;gap:5px;break-inside:avoid;margin-top:10mm}.footer strong{color:#07385f}header .blue,.footer,h2,.info div,p.money{print-color-adjust:exact;-webkit-print-color-adjust:exact}.quote-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:9px;margin:8px 0 13px}.quote-table th{padding:7px 3px;background:#073d68;color:white;text-align:left}.quote-table td{padding:7px 3px;border-bottom:1px solid #d6e3ed;vertical-align:top;overflow-wrap:anywhere}.quote-table th:nth-child(1){width:45%}.quote-table th:nth-child(2){width:11%}.quote-table th:nth-child(3){width:9%}.quote-table th:nth-child(4){width:17%}.quote-table th:nth-child(5){width:18%}.quote-table td:not(:first-child){text-align:right}.quote-table strong{font-size:9px;color:#07385f}.quote-table small{display:block;font-size:8px;color:#506478;line-height:1.3;margin-top:4px}.total-table{border-collapse:collapse;width:65%;margin:6px 0 6px auto;font-size:11px}.total-table td{padding:6px;border-bottom:1px solid #d1e0e8}.total-table td:last-child{text-align:right;font-weight:bold}.total-emphasis{background:#eaf1f6;color:#07385f}.proposal-notes{background:#fff8e8;padding:9px;margin:12px 0;font-size:9px;color:#78501a}@media screen and (max-width:640px){body{width:100%;overflow-wrap:anywhere}.info{grid-template-columns:repeat(2,minmax(0,1fr))}.photos{grid-template-columns:repeat(2,minmax(0,1fr))}.quote-table{font-size:8px}.quote-table td,.quote-table th{padding:5px 2px}}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.noprint{display:none}.footer,.photos figure,.quote-table tr,.total-table tr{break-inside:avoid;page-break-inside:avoid}h2{break-after:avoid;page-break-after:avoid}}';
cs+='@page{size:A4;margin:12mm 12mm 23mm}body{font-size:12px;line-height:1.48}header{height:25mm;margin-bottom:7mm}header h1{font-size:20px}header small{font-size:10px}.info{margin-bottom:12px}.info div{padding:7px}.info strong{font-size:9px}h2{font-size:12.5px;padding:8px 10px;margin:11px 0 7px}p{font-size:12px;line-height:1.52;margin:6px 5px;orphans:3;widows:3}.quote-table{font-size:11px;line-height:1.35;margin:8px 0}.quote-table th{padding:8px 5px;font-size:10px}.quote-table td{padding:9px 5px}.quote-table strong{font-size:11px}.quote-table small{font-size:10px;line-height:1.4}.quote-table th:nth-child(1){width:43%}.quote-table th:nth-child(2){width:10%}.quote-table th:nth-child(3){width:8%}.quote-table th:nth-child(4){width:19%}.quote-table th:nth-child(5){width:20%}.total-table{font-size:12px}.photos{gap:12px}.photos img{height:190px;object-fit:contain}.photos figcaption{font-size:10.5px;line-height:1.4}.note{font-size:10px}.proposal-notes{font-size:10px;line-height:1.4}.footer{font-size:9px;padding:2mm 3mm}@media print{body{margin:0}.footer{position:fixed;bottom:0;left:0;right:0;margin:0;min-height:12mm}.noprint{display:none!important}thead{display:table-header-group}tr,figure{break-inside:avoid!important;page-break-inside:avoid!important}h2{break-after:avoid!important}section{break-inside:auto}.photos figure{break-inside:avoid!important}}';
var meta='<div class="info">'+fields.map(function(p){return '<div><strong>'+pdfEsc(p[0])+'</strong>'+pdfEsc(p[1])+'</div>'}).join('')+'</div>';
var html='<html lang="pt-BR"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"><title>'+pdfEsc(title+' '+num)+'</title><style>'+cs+'</style></head><body><div class="noprint">Clique em Imprimir PDF e escolha Salvar como PDF. No navegador desative Cabeçalhos e rodapés e ative Gráficos de fundo. <button onclick="window.print()">Imprimir PDF</button></div><header><div class="logo">'+(logo?'<img alt="CONSTRU-REI" src="'+logo+'" style="max-width:92%;max-height:22mm;object-fit:contain">':'CONSTRU-REI')+'</div><div class="blue"><h1>'+title+'</h1><b>Nº '+pdfEsc(num)+'</b><small>'+pdfEsc(subject)+'</small></div></header>'+meta+(isPreliminary?'<p class="proposal-notes"><strong>ORÇAMENTO PRELIMINAR — NÃO APROVADO.</strong> Quantidades e preços de referência exigem conferência. Custos extraordinários não incluídos no escopo confirmado exigem orçamento complementar.</p>':'')+body+'<div class="footer"><span>(41) 98778-6277</span><span>construrei@construrei.com.br</span><span>Curitiba/PR • Região Metropolitana</span><strong>CONSTRU-REI</strong></div></body></html>';
var win=window.open('','_blank');if(!win){alert('Permita pop-ups para abrir o PDF.');return}win.document.open();win.document.write(html);win.document.close();win.focus();
}

var crPriceItems=[];
function crNumber(v){var s=String(v||'').trim().replace(/R\$/g,'').replace(/\s/g,'');if(!s)return NaN;if(s.indexOf(',')>=0)s=s.replace(/\./g,'').replace(',','.');var n=Number(s);return Number.isFinite(n)&&n>=0?n:NaN}
function crMoney(n){return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
function crExtractSourcePrices(){
var src=document.getElementById('src').value.replace(/\\n/g,'\n'),chunks=src.split(/\r?\n|;/),items=[];
chunks.forEach(function(x){var m=x.match(/(?:^|\s)(?:QTD\.?\s*[:=]?\s*)?(\d+(?:[,.]\d+)?)\s*(UN|UND|M2|M²|M|KG|L|CX|PC|PEÇA|PEÇAS|UNIDADES?)?\s*(?:X|×|A|@|VR\.?\s*UNIT\.?\s*[:=]?)\s*R\$\s*([\d.,]+)/i);if(m)items.push({q:m[1],v:m[3],text:x.toLowerCase()})});
return items;
}
function orcaParsePriceRow(row){
 const t=String(row||'').trim();
 const qtyMatch=t.match(/(?:^|[|/])\s*(?:QTD\.?|QUANTIDADE)\s*[:=]\s*(\d+(?:[.,]\d+)?)/i);
 const unitMatch=t.match(/(?:^|[|/])\s*(?:UN\.?|UNIDADE)\s*[:=]\s*([A-Za-zÀ-ÿ0-9²³.]+)(?=\s*(?:[|/]|$))/i);
 const priceMatch=t.match(/(?:^|[|/])\s*(?:VR\.?\s*UNIT\.?|VALOR\s*UNIT[ÁA]RIO|PRE[ÇC]O\s*UNIT[ÁA]RIO)\s*[:=]\s*(?:R\$\s*)?([\d.,]+)/i);
 let qty=qtyMatch?.[1]||'',measure=unitMatch?.[1]||'UN',unit=priceMatch?.[1]||'';
 // Variante legada: "QTD. / UN. / VR. UNIT. / VR. TOTAL: 3 / UND / A DEFINIR / A DEFINIR"
 if(!qtyMatch && /^\s*QTD\.?\s*\/\s*UN\.?\s*\//i.test(t)){
  const chunks=t.split(':');const vals=chunks.length>1?chunks.slice(1).join(':').trim().split('/').map(v=>v.trim()):[];
  if(/^\d+(?:[,.]\d+)?$/.test(vals[0]||''))qty=vals[0];
  if(/^[A-Za-zÀ-ÿ0-9²³.]+$/.test(vals[1]||''))measure=vals[1];
  const p=(vals[2]||'').replace(/^R\$\s*/,'');if(/^[\d.,]+$/.test(p))unit=p;
 }
 return {qty,measure:orcaCanonicalUnit(measure)||'UN',unit};
}
function loadPriceItems(){
 const previous=new Map((crPriceItems||[]).map((it,i)=>[it.section+'|'+it.name,{qty:document.getElementById('crq'+i)?.value,price:document.getElementById('crv'+i)?.value,originalProvided:it.originalProvided}]));
 if(document.getElementById('mode').value!=='budget'){alert('O motor de precificação é exclusivo do orçamento.');return}
 const lines=(document.getElementById('out').textContent||'').split(/\r?\n/);
 let section='',items=[];
 for(let i=0;i<lines.length;i++){
  const t=lines[i].trim();
  if(/^SERVI[ÇC]OS(?:\s*\(|\s*:|\s*$)/i.test(t)){section='SERVIÇOS';continue}
  if(/^(?:PRODUTOS\s+E\s+)?MATERIAIS\s*:?\s*$/i.test(t)){section='MATERIAIS';continue}
  if(/^(RESUMO|OBSERVA[ÇC][ÕO]ES|TOTAL\s)/i.test(t)){section='';continue}
  if(!section||!/^\d+[.)]\s+\S/.test(t))continue;
  let qidx=-1;
  for(let j=i+1;j<Math.min(i+12,lines.length);j++){
   const line=lines[j].trim();
   if(/^\d+[.)]\s+\S/.test(line)||/^(?:SERVI[ÇC]OS|MATERIAIS|PRODUTOS E MATERIAIS|RESUMO)/i.test(line))break;
   if(/^(?:QTD\.?|QUANTIDADE)\s*(?:[:=./-]|$)/i.test(line)){qidx=j;break}
  }
  if(qidx<0)continue;
  const parsed=orcaParsePriceRow(lines[qidx]);
  items.push({name:t,section,line:qidx,qty:parsed.qty,unit:'',modelPrice:parsed.unit,originalProvided:false,measure:parsed.measure});
 }
 var sourcePrices=crExtractSourcePrices();items.forEach(function(it,i){if(it.qty&&it.unit&&it.originalProvided)return;var matching=sourcePrices.find(function(p){var words=it.name.toLowerCase().replace(/^\d+\.\s*/, '').split(/\s+/).filter(function(w){return w.length>=5});return words.some(function(w){return p.text.indexOf(w)>=0})});if(!matching&&sourcePrices.length===items.length)matching=sourcePrices[i];if(matching){if(!it.qty)it.qty=matching.q;if(!it.originalProvided){it.unit=matching.v;it.originalProvided=true}}});
 items.forEach(function(it){if(!it.unit){var ref=orcaMatchHistorical(it.name,it.section);if(ref){it.unit=String(ref.value).replace('.',',');it.priceReference=ref}}});
 items.forEach(function(it){const prior=previous.get(it.section+'|'+it.name);if(prior){if(prior.qty!==undefined)it.qty=prior.qty;if(prior.price!==undefined)it.unit=prior.price;if(prior.originalProvided)it.originalProvided=true;}});
 items.forEach(function(it){if(!it.qty&&['UN','UND','CJ','PC','PEÇA'].includes(String(it.measure||'').toUpperCase())){it.qty='1';it.assumedQty=true}});crPriceItems=items;
 var box=document.getElementById('priceRows');box.replaceChildren();
 items.forEach(function(item,i){var row=document.createElement('div');row.className='crprice-row';row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) 75px 106px;gap:6px;padding:7px 0;border-bottom:1px solid #dae4ed;align-items:center';
 var name=document.createElement('span');name.className='crprice-name';name.textContent=item.section+' • '+item.name;name.style.fontSize='12px';row.appendChild(name);
 var qty=document.createElement('input');qty.placeholder='Qtd.';qty.value=item.qty;qty.setAttribute('aria-label','Quantidade '+item.name);qty.id='crq'+i;qty.addEventListener('change',()=>{item.assumedQty=false;row.querySelector('.orca-quantity-warning')?.remove();applyPriceItems()});row.appendChild(qty);
 var unit=document.createElement('input');unit.placeholder='R$ unit.';unit.value=item.unit;unit.setAttribute('aria-label','Preço unitário '+item.name);unit.id='crv'+i;unit.addEventListener('change',()=>{item.originalProvided=true;applyPriceItems()});row.appendChild(unit);if(item.assumedQty){var prelim=document.createElement('small');prelim.style.cssText='grid-column:1/-1;color:#94611d';prelim.className='orca-quantity-warning';prelim.textContent='Qtd. inicial 1 UN/CJ — PRELIMINAR; confirmar antes de aprovar';row.appendChild(prelim)}if(item.priceReference){var origin=document.createElement('small');origin.textContent='Sugestão: orçamento '+item.priceReference.document+' ('+(item.priceReference.date||'12/08/2026')+'). Referência documental; confirmar escopo e preço final. Não é SINAPI vigente.';origin.style.gridColumn='1/-1';origin.style.color='#64748b';row.appendChild(origin)}box.appendChild(row)});
 document.getElementById('priceStatus').textContent=items.length+' itens identificados. Valores explícitos no relato são recuperados quando identificáveis; quantidades UN/CJ iniciadas em 1 de forma provisória; revise antes de enviar.';
}
function applyPriceItems(showStatus=true){
 if(!crPriceItems.length){loadPriceItems();if(!crPriceItems.length)return}
 var out=document.getElementById('out'),lines=out.textContent.split(/\r?\n/),sums={'SERVIÇOS':0,'MATERIAIS':0},valid={'SERVIÇOS':true,'MATERIAIS':true};
 crPriceItems.forEach(function(item,i){var q=crNumber(document.getElementById('crq'+i).value),v=crNumber(document.getElementById('crv'+i).value),ok=Number.isFinite(q)&&q>0&&Number.isFinite(v)&&v>=0;
 if(!ok)valid[item.section]=false;else sums[item.section]+=Math.round(q*v*100)/100;
 lines[item.line]='QTD.: '+(Number.isFinite(q)?String(q).replace('.',','):'A DEFINIR')+' | UN.: '+(item.measure||'UN')+' | VR. UNIT.: '+(Number.isFinite(v)?crMoney(v):'A DEFINIR')+' | VR. TOTAL: '+(ok?crMoney(Math.round(q*v*100)/100):'A DEFINIR')});
 lines=lines.map(function(line){if(/^TOTAL SERVIÇOS:/i.test(line))return 'TOTAL SERVIÇOS: '+(valid['SERVIÇOS']?crMoney(sums['SERVIÇOS']):'A DEFINIR');if(/^TOTAL MATERIAIS:/i.test(line))return 'TOTAL MATERIAIS: '+(valid['MATERIAIS']?crMoney(sums['MATERIAIS']):'A DEFINIR');if(/^TOTAL GERAL:/i.test(line))return 'TOTAL GERAL: '+(valid['SERVIÇOS']&&valid['MATERIAIS']?crMoney(sums['SERVIÇOS']+sums['MATERIAIS']):'A DEFINIR');return line});
 out.textContent=lines.join('\n');if(showStatus)document.getElementById('priceStatus').textContent='Composição recalculada. Preços estimados ainda exigem conferência antes do envio.';
}

// CR_LOGO_DATA é carregada previamente de brand.js
// A embalagem histórica PU40 de R$126 cobre três unidades, não um único tubo.
const CR_PRICE_HISTORY=[
 {section:"SERVIÇOS",keys:["vedacao de porta externa","vedação de porta externa"],value:275,measure:"UN",document:"590-26"},
 {section:"SERVIÇOS",keys:["adequacao de calha","adequação de calha","escoamento pluvial"],value:418,measure:"UN",document:"590-26"},
 {section:"SERVIÇOS",keys:["teste e conferencia final","teste e conferência final"],value:82.50,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["selante pu40 (3 unidades)","kit com 3 tubos selante pu40","kit 3 selantes pu40"],value:126,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["cordao de polietileno","cordão de polietileno","limitador para juntas"],value:55,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["argamassa de reparo","argamassa impermeabilizante"],value:120,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["calha metalica galvanizada","calha metálica galvanizada"],value:165,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["bocal, tampas, suportes","acessorios da calha"],value:160,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["condutor pluvial"],value:110,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["curvas, conexoes e abracadeiras","curvas, conexões e abraçadeiras"],value:110,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["materiais para limpeza","materiais para preparação"],value:80,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["parafusos, buchas e fixadores"],value:65,measure:"UN",document:"590-26"},
 {section:"MATERIAIS",keys:["materiais auxiliares e consumiveis","materiais auxiliares e consumíveis"],value:79,measure:"UN",document:"590-26"},
 {section:"SERVIÇOS",keys:["ajuste e regulagem de 04 portas","ajuste e regulagem de portas"],value:195,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"SERVIÇOS",keys:["substituicao da porta de correr","substituição da porta de correr"],value:680,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"MATERIAIS",keys:["porta de correr branca completa","porta de correr completa"],value:680,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"MATERIAIS",keys:["massa para madeira"],value:32,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"MATERIAIS",keys:["lixa para madeira"],value:36,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"MATERIAIS",keys:["tinta para madeira"],value:115,measure:"UN",document:"766-26",date:"05/10/2026"},
 {section:"SERVIÇOS",keys:["revisao conjunto sanitario suite 01","revisão conjunto sanitário suíte 01","manutencao da caixa acoplada e escoamento lento"],value:390,measure:"UN",document:"627-26",date:"Proposta preliminar"},
 {section:"SERVIÇOS",keys:["regulagem mecanismo caixa acoplada","regulagem do kit da caixa acoplada"],value:180,measure:"UN",document:"627-26",date:"Proposta preliminar"},
 {section:"SERVIÇOS",keys:["refazer vedacao do box","refazer vedação do box","vedacao de box","vedação de box"],value:280,measure:"UN",document:"627-26",date:"Proposta preliminar"},
 {section:"SERVIÇOS",keys:["infraestrutura e passagem de cabos","passagem de cabos de internet"],value:350,measure:"UN",document:"627-26",date:"Proposta preliminar"},
];
function orcaNormalize(t){return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\d+\.\s*/,'').replace(/\s+/g,' ').trim()}
function orcaMatchHistorical(name,section){
 const n=orcaNormalize(name);
 return CR_PRICE_HISTORY.find(ref=>ref.section===section&&ref.keys.some(k=>n.includes(orcaNormalize(k))))||null;
}
let orcaPhotoCaptions=[],orcaPhotoBatch=0;
function orcaPhotoEditors(captions){
 const files=[...document.getElementById('pdffiles').files||[]],target=document.getElementById('orcaPhotoCaptions');
 target.replaceChildren();orcaPhotoCaptions=files.map((_,i)=>String(captions?.[i]||''));
 files.forEach((_,i)=>{let label=document.createElement('label');label.textContent='Foto '+(i+1)+' — '+files[i].name+' — legenda técnica (editável)';label.style.display='block';const preview=document.createElement('img');preview.alt='Prévia da foto '+(i+1);preview.style.cssText='display:block;width:112px;max-height:110px;object-fit:contain;margin:5px 0;border:1px solid #cad5e3;border-radius:5px';const previewUrl=URL.createObjectURL(files[i]);preview.src=previewUrl;preview.onload=()=>URL.revokeObjectURL(previewUrl);label.appendChild(preview);let field=document.createElement('textarea');field.value=orcaPhotoCaptions[i];field.placeholder='Descreva apenas o que é observável na imagem';field.style.minHeight='65px';field.addEventListener('input',()=>orcaPhotoCaptions[i]=field.value);label.appendChild(field);target.appendChild(label)});
}
function orcaPhotoReset(){orcaPhotoBatch++;orcaPhotoCaptions=[];document.getElementById('orcaPhotoCaptions').replaceChildren();const files=document.getElementById('pdffiles').files||[];document.getElementById('orcaPhotoStatus').textContent=files.length?'Fotografias recebidas; análise automática iniciada...':'Nenhuma fotografia anexada.';if(files.length&&(document.getElementById('mode').value==='report'||document.getElementById('orcaIncludeBudgetPhotos').checked))orcaGenerateCaptions()}
async function orcaToJpeg(file){
 let bmp=await createImageBitmap(file);let scale=Math.min(1,1080/Math.max(bmp.width,bmp.height));let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bmp.width*scale));canvas.height=Math.max(1,Math.round(bmp.height*scale));canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);if(bmp.close)bmp.close();
 for(let quality of [0.76,0.60,0.45]){let data=canvas.toDataURL('image/jpeg',quality).split(',')[1];if(data.length<460000)return data}
 throw Error('Uma foto ainda está muito grande após compressão.')
}
async function orcaGenerateCaptions(){
 const el=document.getElementById('orcaPhotoStatus'),batch=orcaPhotoBatch;
 const files=[...document.getElementById('pdffiles').files||[]];
 if(!files.length||files.length>6){el.textContent='Escolha entre 1 e 6 fotos.';return}
 el.textContent='Analisando '+files.length+' fotos com Gemini...';
 try{
  let images=[];for(const file of files)images.push({name:file.name,mime_type:'image/jpeg',data:await orcaToJpeg(file)});
  const resp=await fetch('https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-orca-rei-photo-vision-r6-20261014',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({images,context:document.getElementById('src').value.slice(0,1700)})});
  const data=await resp.json();if(batch!==orcaPhotoBatch)return;
  if(!resp.ok||!data.ok)throw Error(data.error||'Análise visual indisponível.');
  orcaPhotoEditors(data.captions);el.textContent=data.provider+' • '+data.captions.length+' legendas automáticas geradas. Revise antes da emissão.';
 }catch(err){if(batch!==orcaPhotoBatch)return;orcaPhotoEditors([]);el.textContent='IA visual indisponível: '+String(err.message||err)+'. Você pode preencher as legendas manualmente ou tentar novamente.'}
}

function orcaCanonicalUnit(v){const u=String(v||'UN').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[.:]$/g,'').trim().replace(/\s+/g,' ');const aliases={'UND':'UN','UNID':'UN','UNIDADE':'UN','UNIDADES':'UN','PECA':'PC','PECAS':'PC','PCA':'PC','CONJ':'CJ','CONJUNTO':'CJ','KIT':'CJ','PAR':'CJ','MT':'M','METRO':'M','METROS':'M','METRO LINEAR':'M','METROS LINEARES':'M','M2':'M²','M3':'M³','LITRO':'L','LITROS':'L','HORA':'H','HORAS':'H','HR':'H','DIARIA':'DIA','DIARIAS':'DIA'};return aliases[u]||u}
let orcaMarketProposals=0;
let orcaMarketBusy=false;
async function orcaMarketPrices(){
 const status=document.getElementById('priceStatus');
 const proof=document.getElementById('marketProof');
 const button=document.getElementById('marketRun');
 if(orcaMarketBusy){status.textContent='Consulta já em andamento.';return}
 if(document.getElementById('mode').value!=='budget'){status.textContent='Preços exclusivos do orçamento.';return}
 if(!crPriceItems.length)loadPriceItems();
 if(!crPriceItems.length){status.textContent='Nenhum item estruturado encontrado. Gere o orçamento com IA.';return}
 const sourceAtStart=document.getElementById('src').value;
 const total=crPriceItems.length;
 const stats={published:0,estimated:0,preserved:0,missing:0,failed:0,aiCalls:0};
 const errors=[],providers=new Set();
 orcaMarketBusy=true;button.disabled=true;proof.replaceChildren();
 try{
  for(let offset=0;offset<total;offset+=12){
   const subset=crPriceItems.slice(offset,offset+12);
   const batch=subset.map((it,i)=>({id:'item-'+i,name:it.name.replace(/^\d+[.)]\s*/,''),section:it.section,unit:orcaCanonicalUnit(it.measure||'UN'),qty:crNumber(document.getElementById('crq'+(offset+i))?.value)||1}));
   if(subset.every((it,i)=>it.originalProvided&&Number.isFinite(crNumber(document.getElementById('crv'+(offset+i))?.value)))){stats.preserved+=subset.length;continue}
   status.textContent='Consultando IA/referências: itens '+(offset+1)+' a '+(offset+subset.length)+' de '+total;
   try{
    const res=await fetch('https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-orca-rei-context-prices-r11-20261015',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:batch,context:sourceAtStart.slice(0,2300),photo_captions:(orcaPhotoCaptions||[]).map(x=>String(x).slice(0,180))})});
    const data=await res.json().catch(()=>({error:'Resposta inválida do servidor'}));
    if(sourceAtStart!==document.getElementById('src').value||document.getElementById('mode').value!=='budget'){stats.failed+=total-offset;errors.push('Conteúdo mudou durante a consulta; resultados antigos descartados.');break}
    if(!res.ok||!data.ok)throw Error((data.error||'Falha de servidor')+(Array.isArray(data.invalid_indices)?' • índices '+data.invalid_indices.map(i=>offset+i+1).join(','):'')+' • HTTP '+res.status);
    if(!Array.isArray(data.items)||data.items.length!==batch.length)throw Error('Retorno incompleto do servidor.');
    if(data.ai_called)stats.aiCalls++;
    if(data.provider)providers.add(data.provider);
    if(data.quota_reason)errors.push('Limite gratuito IA: '+data.quota_reason);
    if(data.ai_errors?.length)errors.push('Provedores: '+data.ai_errors.join(', '));
    data.items.forEach((ref,i)=>{
     const pos=offset+i, item=crPriceItems[pos], field=document.getElementById('crv'+pos);
     if(ref.id!=='item-'+i||!field||!item){stats.missing++;return}
     const row=field.closest('.crprice-row')||field.parentElement;
     row?.querySelector('.crprice-proof')?.remove();
     item.siteReviewRequired=!!ref.site_review_required;
     const price=typeof ref.price==='number'?ref.price:NaN;
     const valid=Number.isFinite(price)&&price>0&&['preco_publicado','estimativa_revisar'].includes(ref.status);
     const supplied=item.originalProvided&&Number.isFinite(crNumber(field.value));
     if(supplied)stats.preserved++;
     else if(valid){
      field.value=String(price).replace('.',',');item.unit=field.value;
      item.priceReference={document:ref.source_title||'IA preliminar',date:ref.source_date||'',source_url:ref.source_url||'',kind:ref.source_kind||''};
      if(ref.status==='preco_publicado')stats.published++;else stats.estimated++;
     }else stats.missing++;
     const n=document.createElement('div');n.className='crprice-proof';n.style.cssText='grid-column:1/-1;background:#f3f7fb;border-left:3px solid #d0a329;padding:8px;margin:3px 0;border-radius:5px;font-size:12px';
     const title=document.createElement('strong');title.textContent=valid?(ref.status==='preco_publicado'?'REFERÊNCIA DOCUMENTADA: ':'ESTIMATIVA A REVISAR: ')+crMoney(price)+' / '+(ref.unit||batch[i].unit):'SEM REFERÊNCIA: '+(ref.note||'Valor não estimável sem confirmação');n.appendChild(title);
     if(ref.source_title){const o=document.createElement('div');o.textContent='Origem: '+ref.source_title;n.appendChild(o)}
     if(ref.note){const o=document.createElement('div');o.textContent=ref.note;n.appendChild(o)}
     if(ref.site_review_required){const o=document.createElement('div');o.textContent='PENDENTE: conferência de acesso, segurança ou unidade';n.appendChild(o)}
     if(ref.source_url){const link=document.createElement('a');link.textContent='Ver referência';link.href=ref.source_url;link.rel='noopener noreferrer';link.target='_blank';n.appendChild(link)}
     row?.appendChild(n);
    });
    applyPriceItems(false);
   }catch(e){stats.failed+=subset.length;errors.push('Itens '+(offset+1)+'–'+(offset+subset.length)+': '+String(e.message||e))}
  }
  applyPriceItems(false);
  orcaMarketProposals=stats.published+stats.estimated;
  const info=document.createElement('strong');info.textContent=stats.published+' preços documentados; '+stats.estimated+' estimativas; '+stats.preserved+' informados; '+stats.missing+' sem valor; '+stats.failed+' não processados.';proof.appendChild(info);
  const note=document.createElement('p');note.textContent='Fontes: '+Array.from(providers).join(' / ')+'. Novas chamadas à IA: '+stats.aiCalls+'. Valores automáticos sempre exigem aprovação.';proof.appendChild(note);
  if(errors.length){const detail=document.createElement('p');detail.style.color='#9b3819';detail.textContent='ERROS E LIMITES: '+errors.join(' | ');proof.appendChild(detail)}
  const pending=stats.missing+stats.failed;
  status.textContent=pending?'PRECIFICAÇÃO PARCIAL: '+pending+' item(ns) pendentes de '+total+'; veja o diagnóstico.':'PRECIFICAÇÃO CALCULADA: '+total+' itens com valores. Confira todos antes de aprovar.';
 }finally{orcaMarketBusy=false;button.disabled=false}
}

function orcaInferSubject(src){
 const n=String(src||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const win=/(janela|esquadria|vedacao|selagem)/.test(n),calha=/(calha|condutor)/.test(n);
 if(win&&calha)return 'VEDAÇÃO DE ESQUADRIAS • LIMPEZA DE CALHAS';
 if(win)return 'MANUTENÇÃO DE ESQUADRIAS';
 if(calha)return 'MANUTENÇÃO DE CALHAS E COBERTURAS';
 if(/pintur/.test(n))return 'SERVIÇOS DE PINTURA';
 if(/vaso|bacia|sanitari|esgoto|anel de vedacao|caixa acoplada/.test(n))return 'MANUTENÇÃO HIDROSSANITÁRIA';
 if(/hidraul|vazament/.test(n))return 'SERVIÇOS HIDRÁULICOS';
 return 'MANUTENÇÃO PREDIAL • ESCOPO INFORMADO';
}
function orcaBudgetPdfBody(fullText){
 if(!crPriceItems.length)loadPriceItems();
 const lines=String(fullText).replace(/\r/g,'').split('\n');
 let totals={SERVIÇOS:0,MATERIAIS:0},complete={SERVIÇOS:true,MATERIAIS:true},parts=[];
 for(const section of ['SERVIÇOS','MATERIAIS']){
  const list=crPriceItems.map((it,i)=>({it,i})).filter(({it})=>it.section===section);
  if(!list.length)continue;
  const tableRows=list.map(({it,i})=>{
   const rawQty=document.getElementById('crq'+i)?.value||'',rawVal=document.getElementById('crv'+i)?.value||'';
   const qty=crNumber(rawQty),unit=crNumber(rawVal),valid=Number.isFinite(qty)&&qty>0&&Number.isFinite(unit)&&unit>=0;
   const sub=valid?Math.round(qty*unit*100)/100:NaN;
   if(valid)totals[section]+=sub;else complete[section]=false;
   const name=it.name.replace(/^\d+\.\s*/,'').trim();
   const idx=lines.findIndex(t=>t.trim()===it.name.trim());
   const notes=[];
   if(idx>=0){for(let j=idx+1;j<Math.min(idx+8,lines.length);j++){
    const t=lines[j].trim();
    if(/^QTD\./i.test(t)||/^\d+\.\s+[A-ZÀ-Ü]/.test(t)||/^(SERVIÇOS|MATERIAIS|RESUMO|OBSERVAÇÕES)/i.test(t))break;
    if(t)notes.push(t);
   }}
   return '<tr><td><strong>'+pdfEsc(name)+'</strong>'+(notes.length?'<small>'+pdfEsc(notes.join(' '))+'</small>':'')+'</td><td>'+
      pdfEsc(Number.isFinite(qty)&&qty>0?String(qty).replace('.',','):'A DEFINIR')+(it.assumedQty?'*':'')+
      '</td><td>'+pdfEsc(it.measure||'UN')+'</td><td>'+pdfEsc(Number.isFinite(unit)?crMoney(unit):'A DEFINIR')+
      '</td><td>'+pdfEsc(valid?crMoney(sub):'A DEFINIR')+'</td></tr>';
  }).join('');
  parts.push('<section><h2>'+(section==='SERVIÇOS'?'SERVIÇOS (MÃO DE OBRA)':'PRODUTOS E MATERIAIS')+'</h2><table class="quote-table"><thead><tr><th>DESCRIÇÃO</th><th>QTD.</th><th>UN.</th><th>VR. UNIT.</th><th>SUBTOTAL</th></tr></thead><tbody>'+tableRows+'</tbody></table></section>');
 }
 const ok=complete.SERVIÇOS&&complete.MATERIAIS;
 const accessPending=crPriceItems.some(it=>it.siteReviewRequired);
 parts.push('<section><h2>RESUMO DO ORÇAMENTO</h2><table class="total-table"><tr><td>SERVIÇOS</td><td>'+(complete.SERVIÇOS?crMoney(totals.SERVIÇOS):'A DEFINIR')+
 '</td></tr><tr><td>MATERIAIS</td><td>'+(complete.MATERIAIS?crMoney(totals.MATERIAIS):'A DEFINIR')+
 '</td></tr><tr class="total-emphasis"><td>'+(accessPending?'TOTAL BASE PARCIAL — SEM ACESSO':'TOTAL GERAL')+'</td><td>'+(ok?crMoney(totals.SERVIÇOS+totals.MATERIAIS):'A DEFINIR')+'</td></tr></table></section>');
 if(crPriceItems.some(x=>x.assumedQty)||orcaMarketProposals||!ok||accessPending)parts.push('<div class="proposal-notes">* PROPOSTA PRELIMINAR. '+(accessPending?'O total apresentado inclui SOMENTE PREÇOS-BASE; custos de acesso em altura, mobilização, proteção coletiva/individual e condições especiais NÃO FORAM COMPOSTOS. ':'')+'Quantidades e preços sujeitos a conferência técnica e aprovação comercial.</div>');
 const obs=lines.findIndex(t=>/^OBSERVAÇÕES TÉCNICAS\s*:?\s*$/i.test(t.trim()));
 if(obs>=0){const notes=lines.slice(obs+1).filter(x=>x.trim()).slice(0,18);if(notes.length)parts.push('<section><h2>OBSERVAÇÕES TÉCNICAS</h2>'+notes.map(t=>'<p>'+pdfEsc(t)+'</p>').join('')+'</section>')}
 return parts.join('');
}
