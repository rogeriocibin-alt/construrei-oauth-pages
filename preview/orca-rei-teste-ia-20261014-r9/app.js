const endpoint='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-orca-rei-test-bench-20261014';async function send(action){
 const label=document.getElementById('label'),out=document.getElementById('out');
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
  if(data.ok&&mode==='budget'){loadPriceItems();applyPriceItems();await orcaMarketPrices()}
 }catch(e){label.textContent='Falha de geração';out.textContent=String(e.message||e)}
}
fetch(endpoint+'?status=1').then(r=>r.json()).then(x=>{document.getElementById('ai').disabled=!x.model_available;document.getElementById('status').textContent=x.model_available?'Groq 120B • Gemini '+(x.gemini_configured?'com chave detectada':'sem chave detectada')+' • Teto interno 1000/dia (cotas reais dependem dos provedores)':'A formatação pode ser testada; IA real exige chave Groq no backend.'})
function pdfEsc(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pdfVal(id){return(document.getElementById(id).value||'').trim()}
function savePdfLogo(el){var f=el.files&&el.files[0];if(!f)return;var rd=new FileReader();rd.onload=function(){try{localStorage.setItem("cr_pdf_logo_710",String(rd.result));alert("Logomarca salva neste navegador.")}catch(e){alert("Imagem grande demais; reduza o arquivo.")}};rd.readAsDataURL(f)}
async function exportPdf(){
var txt=document.getElementById('out').textContent||'';
if(orcaMarketBusy&&document.getElementById('mode').value==='budget'){alert('Aguarde os preços terminarem de ser sugeridos.');return}
if(document.getElementById('mode').value==='budget'&&crPriceItems.some(i=>i.siteReviewRequired)&&!window.confirm('ATENÇÃO: Trabalho em cobertura ou esquadrias externas. Custos de acesso e segurança ainda podem NÃO ESTAR INCLUÍDOS. Emitir apenas orçamento preliminar?'))return
if(txt.length<30||txt.indexOf('Provedores indisponíveis')===0){alert('Gere primeiro um orçamento ou parecer válido.');return}
if(document.getElementById('mode').value==='budget'){if(/A DEFINIR/.test(txt)&&!window.confirm('Há campos A DEFINIR. Este orçamento será PRELIMINAR. Continuar a emissão?'))return;if(orcaMarketProposals>0&&!window.confirm('Alguns preços foram sugeridos automaticamente pelo mercado/IA e exigem sua conferência. Você validou os valores e o escopo antes de emitir?'))return;}
var isReport=document.getElementById('mode').value==='report';var logo=CR_LOGO_DATA;
var isPreliminary=!isReport&&(crPriceItems.some(i=>i.assumedQty||i.priceReference)||orcaMarketProposals>0||/A DEFINIR/i.test(txt));
var title=isReport?'PARECER TÉCNICO':(isPreliminary?'ORÇAMENTO PRELIMINAR':'ORÇAMENTO');
var subject=pdfVal('pdftitle')||orcaInferSubject(document.getElementById('src').value);
var num=pdfVal('pdfnumber')||'A DEFINIR';
var fields=[['CLIENTE / ORIGEM',pdfVal('pdfclient')||'Não informado'],['ENDEREÇO',pdfVal('pdfaddress')||'Não informado'],['DATA',new Date().toLocaleDateString('pt-BR')],['RESPONSÁVEL',pdfVal('pdfperson')||'CONSTRU-REI']];
var raw=txt.replace(/\r/g,'').split('\n').map(function(x){return x.trim()}).filter(Boolean);
var sections=[],cur=null;
var headings=/^(SITUAÇÃO RELATADA|OBJETIVO E ESCOPO.*|VERIFICAÇÕES REALIZADAS|ANÁLISE TÉCNICA.*|HIPÓTESE TÉCNICA|RECOMENDAÇÕES.*|INFORMAÇÕES A CONFIRMAR|CONSIDERAÇÕES DE SEGURANÇA|CONCLUSÃO|SERVIÇOS.*|MATERIAIS|RESUMO|OBSERVAÇÕES TÉCNICAS|OBSERVAÇÕES)\s*:?\s*$/i;
raw.forEach(function(line){if(headings.test(line)){cur={heading:line,text:[]};sections.push(cur)}else{if(!cur){cur={heading:isReport?'OBJETIVO E ESCOPO':'DESCRIÇÃO',text:[]};sections.push(cur)}cur.text.push(line)}});
if(isReport)sections=sections.filter(function(section){return !(section.heading.toUpperCase().startsWith('OBJETIVO E ESCOPO')&&section.text.length===1&&/^PARECER TÉCNICO ANALÍTICO[.]?$/i.test(section.text[0]))});
var body=sections.map(function(s,i){return '<section><h2>'+(i+1)+'. '+pdfEsc(s.heading)+'</h2>'+s.text.map(function(t){var cls=/^TOTAL|^QTD\./.test(t)?'money':/^\d+\.\s+[A-ZÁ-Ú]/.test(t)?'service':'';return '<p class="'+cls+'">'+pdfEsc(t)+'</p>'}).join('')+'</section>'}).join('');
if(!isReport)body=orcaBudgetPdfBody(txt);
var files=Array.from(document.getElementById('pdffiles').files||[]).slice(0,6);
if(isReport&&files.length===0&&!window.confirm('PARECER SEM FOTOS: o documento sairá sem registros fotográficos. Deseja continuar mesmo assim?'))return;
if(files.length&&files.some(function(_,i){return !String(orcaPhotoCaptions[i]||'').trim()})){alert('Fotos sem legenda. Gere as legendas pela IA ou escreva uma legenda antes de imprimir.');return}
var images=await Promise.all(files.map(function(f){return new Promise(function(resolve){var rd=new FileReader();rd.onload=function(){resolve({src:rd.result,name:f.name})};rd.onerror=function(){resolve(null)};rd.readAsDataURL(f)})}));
images=images.filter(Boolean);
if(images.length!==files.length){alert('Falha ao carregar uma das fotografias. Corrija o anexo e tente novamente.');return}
if(images.length){body+='<section><h2>'+(sections.length+1)+'. REGISTROS FOTOGRÁFICOS</h2><div class="photos">'+images.map(function(p,i){return '<figure><img src="'+p.src+'"><figcaption>'+(i+1)+'. '+pdfEsc((orcaPhotoCaptions[i]||'Legenda pendente de revisão'))+'</figcaption></figure>'}).join('')+'</div><p class="note">Legendas descrevem apenas elementos visíveis. Fotografias não comprovam a causa da infiltração nem constituem autorização de serviços adicionais. Confirmar correspondência com a vistoria.</p></section>'}
var cs='@page{size:A4;margin:14mm 13mm 17mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#17344b;margin:0}header{position:relative;margin:0 0 10mm;display:flex;border-top:4px solid #ddb327;height:28mm;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}header .logo{width:30%;display:flex;justify-content:center;align-items:center;font-size:20px;color:#073b64;font-weight:bold}header .blue{width:70%;background:#07385f;color:white;padding:10px 16px}header h1{font-size:19px;margin:0}header b{color:#d5ae27;font-size:15px}header small{display:block;margin-top:5px}.info{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:15px}.info div{background:#eff6fa;border:1px solid #cedde7;border-radius:4px;padding:8px;overflow-wrap:anywhere}.info strong{color:#08527a;display:block;font-size:8px;margin-bottom:5px}h2{break-after:avoid;color:white;background:#073d68;padding:6px 10px;font-size:11px;border-radius:3px;margin:16px 0 8px}p{font-size:10.5px;line-height:1.45;margin:5px 8px;white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3;break-inside:avoid}section{break-inside:auto}section h2{break-after:avoid;page-break-after:avoid}p.service{font-weight:bold;color:#0a3b64}p.money{background:#f0f6fa;padding:6px;font-weight:700}.photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.photos figure{border:1px solid #d0dfe9;background:#f3f8fb;padding:6px;margin:0;break-inside:avoid;page-break-inside:avoid;min-width:0}.photos img{width:100%;height:125px;object-fit:contain;background:#e7edf3;display:block}.photos figcaption{font-size:9px;line-height:1.35;margin-top:5px;overflow-wrap:anywhere}.note{font-size:9px;color:#567}.footer{position:static;bottom:auto;left:auto;right:auto;background:linear-gradient(to right,#07385f 78%,#d8ab1a 78%);min-height:13mm;display:flex;align-items:center;justify-content:space-around;color:white;font-size:8px;padding:3mm 2mm;gap:5px;break-inside:avoid;margin-top:10mm}.footer strong{color:#07385f}header .blue,.footer,h2,.info div,p.money{print-color-adjust:exact;-webkit-print-color-adjust:exact}.quote-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:9px;margin:8px 0 13px}.quote-table th{padding:7px 3px;background:#073d68;color:white;text-align:left}.quote-table td{padding:7px 3px;border-bottom:1px solid #d6e3ed;vertical-align:top;overflow-wrap:anywhere}.quote-table th:nth-child(1){width:45%}.quote-table th:nth-child(2){width:11%}.quote-table th:nth-child(3){width:9%}.quote-table th:nth-child(4){width:17%}.quote-table th:nth-child(5){width:18%}.quote-table td:not(:first-child){text-align:right}.quote-table strong{font-size:9px;color:#07385f}.quote-table small{display:block;font-size:8px;color:#506478;line-height:1.3;margin-top:4px}.total-table{border-collapse:collapse;width:65%;margin:6px 0 6px auto;font-size:11px}.total-table td{padding:6px;border-bottom:1px solid #d1e0e8}.total-table td:last-child{text-align:right;font-weight:bold}.total-emphasis{background:#eaf1f6;color:#07385f}.proposal-notes{background:#fff8e8;padding:9px;margin:12px 0;font-size:9px;color:#78501a}@media screen and (max-width:640px){body{width:100%;overflow-wrap:anywhere}.info{grid-template-columns:repeat(2,minmax(0,1fr))}.photos{grid-template-columns:repeat(2,minmax(0,1fr))}.quote-table{font-size:8px}.quote-table td,.quote-table th{padding:5px 2px}}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.noprint{display:none}.footer,.photos figure,.quote-table tr,.total-table tr{break-inside:avoid;page-break-inside:avoid}h2{break-after:avoid;page-break-after:avoid}}';
var meta='<div class="info">'+fields.map(function(p){return '<div><strong>'+pdfEsc(p[0])+'</strong>'+pdfEsc(p[1])+'</div>'}).join('')+'</div>';
var html='<html lang="pt-BR"><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta charset="utf-8"><title>'+pdfEsc(title+' '+num)+'</title><style>'+cs+'</style></head><body><div class="noprint">Clique em Imprimir PDF e escolha Salvar como PDF. No navegador desative Cabeçalhos e rodapés e ative Gráficos de fundo. <button onclick="window.print()">Imprimir PDF</button></div><header><div class="logo">'+(logo?'<img alt="CONSTRU-REI" src="'+logo+'" style="max-width:92%;max-height:22mm;object-fit:contain">':'CONSTRU-REI')+'</div><div class="blue"><h1>'+title+'</h1><b>Nº '+pdfEsc(num)+'</b><small>'+pdfEsc(subject)+'</small></div></header>'+meta+(isPreliminary?'<p class="proposal-notes"><strong>ORÇAMENTO PRELIMINAR — NÃO APROVADO.</strong> Quantidades e preços de referência exigem conferência. Trabalho em altura, equipamentos de acesso, segurança, mobilização e eventuais reparos adicionais podem NÃO ESTAR INCLUÍDOS no total.</p>':'')+body+'<div class="footer"><span>(41) 98778-6277</span><span>construrei@construrei.com.br</span><span>Curitiba/PR • Região Metropolitana</span><strong>CONSTRU-REI</strong></div></body></html>';
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
function loadPriceItems(){
 if(document.getElementById('mode').value!=='budget'){alert('O motor de precificação é exclusivo do orçamento.');return}
 var lines=(document.getElementById('out').textContent||'').split(/\r?\n/),section='',items=[];
 for(var i=0;i<lines.length;i++){var t=lines[i].trim();
 if(/^SERVIÇOS\s*(\(|$)/i.test(t)){section='SERVIÇOS';continue}
 if(/^MATERIAIS\s*$/i.test(t)){section='MATERIAIS';continue}
 if(/^(RESUMO|OBSERVAÇÕES)/i.test(t)){section='';continue}
 if(section&&/^\d+\.\s+\S/.test(t)){
 var qidx=-1;for(var j=i+1;j<Math.min(i+5,lines.length);j++){if(/^QTD\.\s*:/i.test(lines[j].trim())){qidx=j;break}if(/^\d+\.\s+/.test(lines[j].trim()))break}
 if(qidx>=0){var prev=lines[qidx]||'',qty=prev.match(/QTD\.\s*:\s*(\d+(?:[,\.]\d+)?)/i),unit=prev.match(/VR\.\s*UNIT\.\s*:\s*R\$\s*([\d.,]+)/i);
 items.push({name:t,section:section,line:qidx,qty:qty?qty[1]:'',unit:unit?unit[1]:'',originalProvided:!!unit,measure:(prev.match(/UN\.:\s*([^|\s]+)/i)||[])[1]||'UN'})}
 }}
 var sourcePrices=crExtractSourcePrices();items.forEach(function(it,i){if(it.qty&&it.unit)return;var matching=sourcePrices.find(function(p){var words=it.name.toLowerCase().replace(/^\d+\.\s*/, '').split(/\s+/).filter(function(w){return w.length>=5});return words.some(function(w){return p.text.indexOf(w)>=0})});if(!matching&&sourcePrices.length===items.length)matching=sourcePrices[i];if(matching){if(!it.qty)it.qty=matching.q;if(!it.unit){it.unit=matching.v;it.originalProvided=true}}});
 items.forEach(function(it){if(!it.unit){var ref=orcaMatchHistorical(it.name,it.section);if(ref){it.unit=String(ref.value).replace('.',',');it.priceReference=ref}}});
 items.forEach(function(it){if(!it.qty&&['UN','UND','CJ','PC','PEÇA'].includes(String(it.measure||'').toUpperCase())){it.qty='1';it.assumedQty=true}});crPriceItems=items;
 var box=document.getElementById('priceRows');box.replaceChildren();
 items.forEach(function(item,i){var row=document.createElement('div');row.className='crprice-row';row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr) 75px 106px;gap:6px;padding:7px 0;border-bottom:1px solid #dae4ed;align-items:center';
 var name=document.createElement('span');name.className='crprice-name';name.textContent=item.section+' • '+item.name;name.style.fontSize='12px';row.appendChild(name);
 var qty=document.createElement('input');qty.placeholder='Qtd.';qty.value=item.qty;qty.setAttribute('aria-label','Quantidade '+item.name);qty.id='crq'+i;qty.addEventListener('change',()=>{item.assumedQty=false;row.querySelector('.orca-quantity-warning')?.remove();applyPriceItems()});row.appendChild(qty);
 var unit=document.createElement('input');unit.placeholder='R$ unit.';unit.value=item.unit;unit.setAttribute('aria-label','Preço unitário '+item.name);unit.id='crv'+i;unit.addEventListener('change',()=>{item.originalProvided=true;applyPriceItems()});row.appendChild(unit);if(item.assumedQty){var prelim=document.createElement('small');prelim.style.cssText='grid-column:1/-1;color:#94611d';prelim.className='orca-quantity-warning';prelim.textContent='Qtd. inicial 1 UN/CJ — PRELIMINAR; confirmar antes de aprovar';row.appendChild(prelim)}if(item.priceReference){var origin=document.createElement('small');origin.textContent='Sugestão: orçamento '+item.priceReference.document+' ('+(item.priceReference.date||'12/08/2026')+'). Referência documental; confirmar escopo e preço final. Não é SINAPI vigente.';origin.style.gridColumn='1/-1';origin.style.color='#64748b';row.appendChild(origin)}box.appendChild(row)});
 document.getElementById('priceStatus').textContent=items.length+' itens identificados. Valores explícitos no relato são recuperados quando identificáveis; quantidades UN/CJ iniciadas em 1 de forma provisória; revise antes de enviar.';
}
function applyPriceItems(){
 if(!crPriceItems.length){loadPriceItems();if(!crPriceItems.length)return}
 var out=document.getElementById('out'),lines=out.textContent.split(/\r?\n/),sums={'SERVIÇOS':0,'MATERIAIS':0},valid={'SERVIÇOS':true,'MATERIAIS':true};
 crPriceItems.forEach(function(item,i){var q=crNumber(document.getElementById('crq'+i).value),v=crNumber(document.getElementById('crv'+i).value),ok=Number.isFinite(q)&&Number.isFinite(v);
 if(!ok)valid[item.section]=false;else sums[item.section]+=Math.round(q*v*100)/100;
 lines[item.line]='QTD.: '+(Number.isFinite(q)?String(q).replace('.',','):'A DEFINIR')+' | UN.: '+(item.measure||'UN')+' | VR. UNIT.: '+(Number.isFinite(v)?crMoney(v):'A DEFINIR')+' | VR. TOTAL: '+(ok?crMoney(Math.round(q*v*100)/100):'A DEFINIR')});
 lines=lines.map(function(line){if(/^TOTAL SERVIÇOS:/i.test(line))return 'TOTAL SERVIÇOS: '+(valid['SERVIÇOS']?crMoney(sums['SERVIÇOS']):'A DEFINIR');if(/^TOTAL MATERIAIS:/i.test(line))return 'TOTAL MATERIAIS: '+(valid['MATERIAIS']?crMoney(sums['MATERIAIS']):'A DEFINIR');if(/^TOTAL GERAL:/i.test(line))return 'TOTAL GERAL: '+(valid['SERVIÇOS']&&valid['MATERIAIS']?crMoney(sums['SERVIÇOS']+sums['MATERIAIS']):'A DEFINIR');return line});
 out.textContent=lines.join('\n');document.getElementById('priceStatus').textContent='Composição recalculada: as quantidades unitárias 1 são provisórias. Preços sugeridos por IA exigem conferência.';
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
 files.forEach((_,i)=>{let label=document.createElement('label');label.textContent='Foto '+(i+1)+' — legenda técnica (editável)';label.style.display='block';let field=document.createElement('textarea');field.value=orcaPhotoCaptions[i];field.placeholder='Descreva apenas o que é observável na imagem';field.style.minHeight='65px';field.addEventListener('input',()=>orcaPhotoCaptions[i]=field.value);label.appendChild(field);target.appendChild(label)});
}
function orcaPhotoReset(){orcaPhotoBatch++;orcaPhotoCaptions=[];document.getElementById('orcaPhotoCaptions').replaceChildren();const files=document.getElementById('pdffiles').files||[];document.getElementById('orcaPhotoStatus').textContent=files.length?'Fotografias recebidas; análise automática iniciada...':'Nenhuma fotografia anexada.';if(files.length)orcaGenerateCaptions()}
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

let orcaMarketProposals=0;
let orcaMarketBusy=false;
async function orcaMarketPrices(){
 const status=document.getElementById('priceStatus'),button=document.getElementById('marketRun'),proof=document.getElementById('marketProof');
 if(orcaMarketBusy)return;
 if(document.getElementById('mode').value!=='budget'){status.textContent='Preços apenas para orçamento.';return}
 if(!crPriceItems.length){loadPriceItems();if(!crPriceItems.length){status.textContent='Gere o orçamento para identificar itens.';return}}
 const batch=crPriceItems.slice(0,12).map((it,i)=>({id:'item-'+i,name:it.name.replace(/^\d+\.\s*/,''),section:it.section,unit:it.measure||'UN',qty:crNumber(document.getElementById('crq'+i)?.value)||1}));
 if(batch.every((_,i)=>crPriceItems[i].originalProvided&&Number.isFinite(crNumber(document.getElementById('crv'+i)?.value)))){applyPriceItems();status.textContent='Preços informados preservados e totais calculados.';return}
 orcaMarketBusy=true;button.disabled=true;orcaMarketProposals=0;status.textContent='Consultando preços de mercado, histórico e estimativas...';proof.replaceChildren();
 try{
  const res=await fetch('https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-orca-rei-context-prices-r9-20261014',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:batch,context:document.getElementById('src').value.slice(0,2300),photo_captions:(orcaPhotoCaptions||[]).map(v=>String(v).slice(0,180))})});
  const data=await res.json().catch(()=>({error:'Resposta inválida'}));if(!res.ok||!data.ok)throw Error(data.error||'Backend não disponível');
  let published=0,estimated=0,preserved=0,missing=0;
  (data.items||[]).forEach((ref,i)=>{
   if(i>=batch.length||ref.id!=='item-'+i)return;
   const item=crPriceItems[i],field=document.getElementById('crv'+i);if(!field||!item)return;item.siteReviewRequired=!!ref.site_review_required;
   const row=field.closest('.crprice-row')||field.parentElement,old=row?.querySelector('.crprice-proof');if(old)old.remove();
   const value=Number(ref.price),valid=Number.isFinite(value)&&value>0;
   if(valid&&['preco_publicado','estimativa_revisar'].includes(ref.status)){
    if(!item.originalProvided){
     field.value=String(value).replace('.',',');item.unit=field.value;item.priceReference={document:ref.source_title||'Estimativa',date:ref.source_date||'',source_url:ref.source_url||'',kind:ref.source_kind||'',site_review_required:!!ref.site_review_required};
     if(ref.status==='preco_publicado')published++;else estimated++;
    }else preserved++;
   }else missing++;
   const wrap=document.createElement('div');wrap.className='crprice-proof';wrap.style.cssText='grid-column:1/-1;background:#f3f7fb;border-left:3px solid #cc9c27;padding:9px;margin:4px 0;border-radius:5px;font-size:12px;line-height:1.45;color:#25465a';
   const head=document.createElement('strong');head.textContent=valid?(ref.status==='preco_publicado'?'PREÇO PUBLICADO: ':'ESTIMATIVA PRELIMINAR: ')+crMoney(value)+' / '+ref.unit:'Sem preço confiável para este item.';wrap.appendChild(head);
   if(ref.source_title){const src=document.createElement('div');src.textContent='Referência: '+ref.source_title+(ref.source_date?' • '+ref.source_date:'');wrap.appendChild(src)}
   if(ref.note){const note=document.createElement('div');note.textContent=ref.note;wrap.appendChild(note)}if(ref.site_review_required){const caution=document.createElement('strong');caution.style.cssText='display:block;color:#8a4c10;margin-top:4px';caution.textContent='ATENÇÃO: ACESSO / TRABALHO EM ALTURA A CONFIRMAR — sugestão não inclui necessariamente os custos de segurança e mobilização.';wrap.appendChild(caution)}
   if(ref.source_url){const link=document.createElement('a');link.href=ref.source_url;link.textContent='Abrir referência';link.target='_blank';link.rel='noopener noreferrer';wrap.appendChild(link)}
   row?.appendChild(wrap);
  });
  orcaMarketProposals=published+estimated;applyPriceItems();
  const totals=document.createElement('strong');totals.textContent=published+' preços públicos; '+estimated+' estimativas; '+preserved+' valores do usuário preservados; '+missing+' sem preço.';proof.appendChild(totals);
  const meta=document.createElement('p');meta.textContent='Origem: '+(data.provider||'referências locais')+'. '+(data.ai_called?'IA adicional consultada.':'Sem nova chamada de IA.')+(data.quota_reason?' IA no limite, referências locais continuam ativas.':'');proof.appendChild(meta);
  status.textContent='Sugestões aplicadas. Confira acesso, quantidade, escopo e margem antes de aprovar.';
 }catch(err){status.textContent='Erro ao consultar sugestões: '+String(err.message||err)+'. Os preços informados foram preservados.';applyPriceItems()}
 finally{orcaMarketBusy=false;button.disabled=false}
}

function orcaInferSubject(src){
 const n=String(src||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const win=/(janela|esquadria|vedacao|selagem)/.test(n),calha=/(calha|condutor)/.test(n);
 if(win&&calha)return 'VEDAÇÃO DE ESQUADRIAS • LIMPEZA DE CALHAS';
 if(win)return 'MANUTENÇÃO DE ESQUADRIAS';
 if(calha)return 'MANUTENÇÃO DE CALHAS E COBERTURAS';
 if(/pintur/.test(n))return 'SERVIÇOS DE PINTURA';
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
 parts.push('<section><h2>RESUMO DO ORÇAMENTO</h2><table class="total-table"><tr><td>SERVIÇOS</td><td>'+(complete.SERVIÇOS?crMoney(totals.SERVIÇOS):'A DEFINIR')+
 '</td></tr><tr><td>MATERIAIS</td><td>'+(complete.MATERIAIS?crMoney(totals.MATERIAIS):'A DEFINIR')+
 '</td></tr><tr class="total-emphasis"><td>TOTAL GERAL</td><td>'+(ok?crMoney(totals.SERVIÇOS+totals.MATERIAIS):'A DEFINIR')+'</td></tr></table></section>');
 if(crPriceItems.some(x=>x.assumedQty)||orcaMarketProposals||!ok)parts.push('<div class="proposal-notes">* Quantidades de 1 UN/CJ foram sugeridas provisoriamente. Orçamento preliminar: conferir quantidades, preços de materiais, execução, acesso e custos indiretos antes da aprovação final.</div>');
 const obs=lines.findIndex(t=>/^OBSERVAÇÕES TÉCNICAS\s*:?\s*$/i.test(t.trim()));
 if(obs>=0){const notes=lines.slice(obs+1).filter(x=>x.trim()).slice(0,18);if(notes.length)parts.push('<section><h2>OBSERVAÇÕES TÉCNICAS</h2>'+notes.map(t=>'<p>'+pdfEsc(t)+'</p>').join('')+'</section>')}
 return parts.join('');
}
