// Isolated regression tests. Does not connect to Supabase or mutate production.
import assert from "node:assert/strict";
import test from "node:test";
const re=/\b(ap(?:to)?\.?|apartamento|bloco|bl\.?|torre|sobrado|casa|fundos|unidade|sala|loja|conjunto)\b\s*(?:n[ºo.]?\s*)?([A-Za-z0-9À-ÿ-]{1,24})\b/gi;
function extract(input){return [...String(input).matchAll(re)].filter(m=>/\d/.test(m[2])||(/^(bloco|bl\.?|torre)$/i.test(m[1])&&/^[a-z]$/i.test(m[2]))).map(m=>m[0]);}
function normalize(input){return String(input).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\bapartamento\b|\bapto?\.?\b/g,"ap").replace(/\bbloco\b|\bbl\.?\b/g,"bloco").replace(/\s+/g," ").trim();}
function pending(raw,address){const line=String(raw).split(/\r?\n/).find(x=>/ENDERE[CÇ]O\s*:/i.test(x))||"";return extract(line).some(x=>!extract(address).some(y=>normalize(x)===normalize(y)));}
test("main service address with Ap 101 Bl 02 passes",()=>assert.equal(pending("ENDEREÇO: Rua X, 500 Ap 101 Bl 02\nOutra casa 03", "Rua X, 500 Ap 101 Bl 02"),false));
test("wrong apartment remains pending",()=>assert.equal(pending("ENDEREÇO: Rua X, 500 Ap 101", "Rua X, 500 Ap 202"),true));
test("missing apartment remains pending",()=>assert.equal(pending("ENDEREÇO: Rua X, 500 Ap 101", "Rua X, 500"),true));
test("normal words do not become phantom units",()=>assert.deepEqual(extract("apresentada aplicável casa de máquinas"),[]));
test("abbreviated block is recognized",()=>assert.deepEqual(extract("Ap 101 Bl 02"),["Ap 101","Bl 02"]));
test("other property mentions are not mistaken for destination",()=>assert.equal(pending("ENDEREÇO: Rua X, 500 Ap 101\nOutra casa 03", "Rua X, 500 Ap 101"),false));
