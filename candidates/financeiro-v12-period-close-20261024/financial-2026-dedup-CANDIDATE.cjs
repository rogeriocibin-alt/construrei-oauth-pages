'use strict';
/**
 * CONSTRU-REI | candidate-only, read-only duplicate registry classifier.
 * Input: Supabase historical *text snapshot* rows joined from source + extract.
 * Not financial truth, not authorization to update Trello, Cora or acertos.
 */
const norm = x => String(x ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const code = x => {
  const m=norm(x).match(/^0*(\d+)\s*-\s*(\d{2})$/);
  return m ? String(Number(m[1]))+'-'+m[2] : '';
};
const cents = v => v===null||v===undefined ? null : (typeof v==='number' ? v : Number(v));
const keys = ['closed_cents','cost_cents','declared_profit_cents','received_claim_cents'];
const sameAmounts = (a,b) => keys.every(k=>cents(a[k])===cents(b[k]));
const compatiblePartial = (part,full) => keys.every(k=>cents(part[k])===null||cents(part[k])===cents(full[k]));
const balanced = a => a.validation_state==='BALANCED';
const active = a => a.card_state==='OPEN';
const archived = a => a.card_state==='ARCHIVED';
const isTest = a => code(a.work_code)==='9999-26' &&
  /(?:\bteste\b|\bcr-qa\b|homologa[cç][aã]o)/i.test(norm(a.card_title));
const exactCopy = (a,b) => norm(a.card_title)===norm(b.card_title) &&
  norm(a.raw_description).length>0 &&
  norm(a.raw_description)===norm(b.raw_description) && sameAmounts(a,b);
const isProvisional = a => archived(a) && a.validation_state==='INCOMPLETE' &&
  (/gabrielly\s+criar\s+card/i.test(norm(a.card_title)) ||
   /^(?:EM ANDAMENTO|AG\. ACERTO)$/.test(norm(a.source_list)));
function classifyDuplicateGroups(rows) {
  if(!Array.isArray(rows)) throw Error('ROWS_REQUIRED');
  const groups=new Map(), seen=new Set();
  for(const row of rows) {
    if(!row||typeof row!=='object'||!row.source_card_id) throw Error('SOURCE_ID_REQUIRED');
    const id=String(row.source_card_id);
    if(seen.has(id)) throw Error('REPEATED_SOURCE_CARD_ID');
    seen.add(id);
    const c=code(row.work_code);
    if(!c) continue;
    if(!groups.has(c)) groups.set(c,[]);
    groups.get(c).push(row);
  }
  const decisions=[];
  for(const [work_code, cards] of groups) {
    if(cards.length<2) continue;
    const ids=cards.map(x=>String(x.source_card_id)).sort();
    const result={work_code,kind:'REVIEW_REQUIRED',keep:[],exclude:[],review:ids,
      excluded_duplicate_gross_cents:0,reason:'AMBIGUOUS_REPEAT'};
    if(cards.length===2 && cards.every(isTest)) {
      result.kind='TEST_ONLY_EXCLUDED';result.exclude=ids;result.review=[];result.reason='EXPLICIT_QA_CARDS';
    } else if(cards.length===2) {
      const a=cards.find(active), b=cards.find(archived);
      if(a&&b&&balanced(a)&&balanced(b)&&exactCopy(a,b)) {
        result.kind='EXACT_ARCHIVED_COPY';result.keep=[String(a.source_card_id)];
        result.exclude=[String(b.source_card_id)];result.review=[];
        result.excluded_duplicate_gross_cents=cents(b.closed_cents)||0;
        result.reason='SAME_TEXT_AND_MONEY_ARCHIVED_MIRROR';
      } else if(a&&b&&balanced(a)&&isProvisional(b)&&compatiblePartial(b,a)) {
        result.kind='PROVISIONAL_ARCHIVED_MIRROR';result.keep=[String(a.source_card_id)];
        result.exclude=[String(b.source_card_id)];result.review=[];
        result.reason='INCOMPLETE_ARCHIVED_SOURCE_ALREADY_IN_ACTIVE_CARD';
      } else if(cards.every(balanced) && cards.every(active) &&
        cards.some(x=>new RegExp('aditivo\\s+do\\s+0*'+work_code.replace('-','\\s*-\\s*'),'i').test(norm(x.card_title)))) {
        result.kind='REVIEW_DISTINCT_ADDITIVE';result.reason='LEGITIMATE_POSSIBLE_ADDENDUM_NOT_SAFE_TO_COLLAPSE';
      }
    }
    decisions.push(result);
  }
  decisions.sort((a,b)=>a.work_code.localeCompare(b.work_code,'pt-BR',{numeric:true}));
  const totals={group_count:decisions.length,
    exact_pairs:decisions.filter(x=>x.kind==='EXACT_ARCHIVED_COPY').length,
    provisional_pairs:decisions.filter(x=>x.kind==='PROVISIONAL_ARCHIVED_MIRROR').length,
    test_only:decisions.filter(x=>x.kind==='TEST_ONLY_EXCLUDED').length,
    review_groups:decisions.filter(x=>x.review.length>0).length,
    potential_duplicate_gross_cents:decisions.reduce((n,x)=>n+x.excluded_duplicate_gross_cents,0)};
  return {totals,decisions,source:'TEXT_SNAPSHOT_NOT_BANK',safe_for_live_write:false};
}
module.exports={classifyDuplicateGroups,normalizeWorkCode:code};
