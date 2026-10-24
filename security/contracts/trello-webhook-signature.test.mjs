import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyTrelloWebhookSignature as verify } from './trello-webhook-signature.mjs';

// Synthetic-only callback URL and secret; no live endpoints or credentials.
const url = 'https://invalid.example.test/trello-hooks?tenant=fictional';
const secret = 'SYNTHETIC_APP_SECRET_NEVER_DEPLOY';
const text = new TextEncoder();
const body = text.encode('{"action":{"type":"updateCard"},"desc":"ação ç 🚀"}');
const sign = (payload = body, callback = url, key = secret) =>
  createHmac('sha1', key).update(Buffer.from(payload)).update(callback).digest('base64');
const request = (overrides = {}) => ({rawBody:body,receivedSignature:sign(),callbackURL:url,appSecret:secret,...overrides});

test('accepts genuine HMAC-SHA1 signature and original UTF-8 request bytes',async()=>{
  assert.equal(await verify(request()),true);
});
test('rejects changed payload, including whitespace or UTF-8 character edits',async()=>{
  assert.equal(await verify(request({rawBody:text.encode('{"action":{"type":"updateCard"}}')})),false);
  assert.equal(await verify(request({rawBody:text.encode(new TextDecoder().decode(body)+' ')})),false);
});
test('requires exact callback URL registered with Trello',async()=>{
  assert.equal(await verify(request({callbackURL:url+'&changed=1'})),false);
});
test('rejects wrong key, empty key and altered signatures',async()=>{
  assert.equal(await verify(request({appSecret:'different-secret'})),false);
  assert.equal(await verify(request({appSecret:''})),false);
  assert.equal(await verify(request({receivedSignature:sign().slice(0,20)})),false);
  assert.equal(await verify(request({receivedSignature:'!!!!!'})),false);
  assert.equal(await verify(request({receivedSignature:null})),false);
});
test('rejects invalid request shapes without reading or writing anything',async()=>{
  assert.equal(await verify(request({rawBody:'untrusted-string'})),false);
  assert.equal(await verify(request({callbackURL:'http://invalid.example.test'})),false);
  assert.equal(await verify(request({callbackURL:''})),false);
  assert.equal(await verify(request({rawBody:null})),false);
});
test('does not canonicalize JSON or normalize the raw body',async()=>{
  const other=text.encode('{"desc":"ação ç 🚀","action":{"type":"updateCard"}}');
  assert.equal(await verify(request({rawBody:other,receivedSignature:sign(other)})),true);
  assert.equal(await verify(request({rawBody:other})),false);
});
