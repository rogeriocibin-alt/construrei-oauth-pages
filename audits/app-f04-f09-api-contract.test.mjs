import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const actions=['ai-assist','flow-advance','flow-save','flow-state'];
for(let i=4;i<=9;i++){
 const code='f'+String(i).padStart(2,'0');
 test(code+' calls the actual Edge ?api= contract without touching router ?mode=',()=>{
  const path=new URL('../production/flow-canonical-20261001/'+code+'/index.html',import.meta.url);
  const html=readFileSync(path,'utf8');
  const matches=[...html.matchAll(/API\s*\+\s*["']\?api=([a-z-]+)["']/g)].map(m=>m[1]).sort();
  assert.deepEqual(matches,actions);
  assert.doesNotMatch(html,/API\s*\+\s*["']\?mode=/);
  assert.match(html,/ROUTER\s*\+\s*["']\?mode=/);
  assert.match(html,/cr-flow-runtime-v2/);
 });
}
