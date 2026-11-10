const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');

async function setup({ supported = true, audioFails = false } = {}) {
  let Controller, vibrations = 0, tones = 0;
  class Element extends EventTarget {
    constructor() { super(); this.dataset = {}; this.isConnected = true; }
    querySelector(selector) { return this.nodes[selector]; }
    closest() { return this.form; }
  }
  class Audio {
    state = 'running'; currentTime = 0;
    constructor() { if (audioFails) throw Error('Audio unavailable'); }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
    createOscillator() { return {frequency:{},connect(){},start(){tones++},stop(){},disconnect(){}}; }
    createGain() { return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}; }
  }
  const context = { HTMLElement:Element, customElements:{get(){},define(_,type){Controller=type}}, navigator:supported?{vibrate(){vibrations++}}:{}, AudioContext:Audio, queueMicrotask, setTimeout, clearTimeout };
  vm.runInNewContext(stripTypeScriptTypes(readFileSync('src/lib/confirmation.ts','utf8')), context);
  const host = new Controller();
  host.nodes = Object.fromEntries(['confirm','label','symbol','status','error'].map(key=>['[data-'+key+']',{checked:key==='haptic',textContent:'',setAttribute(){}}]));
  host.form = new Element(); host.form.nodes = {};
  host.connectedCallback(); await Promise.resolve();
  const state = value => { const e=new Event('confirmation-state');e.detail=value;host.dispatchEvent(e); };
  return {host,state,get vibrations(){return vibrations},get tones(){return tones}};
}
test('success only after processing; repeated success produces no duplicate signals',async()=>{
  const s=await setup();
  s.state('success');assert.equal(s.vibrations,0);
  s.state('processing');assert.equal(s.host.nodes['[data-confirm]'].disabled,true);
  s.state('success');assert.equal(s.tones,3);assert.equal(s.vibrations,1);
  s.state('success');assert.equal(s.vibrations,1);s.host.disconnectedCallback();
});
test('press sounds automatically; error allows retry without success signals',async()=>{
  const s=await setup();s.state('processing');assert.equal(s.tones,1);s.state('error');assert.equal(s.tones,1);assert.equal(s.vibrations,0);assert.equal(s.host.nodes['[data-confirm]'].disabled,false);
  s.state('processing');s.state('success');assert.equal(s.vibrations,1);assert.equal(s.tones,4);s.host.disconnectedCallback();
});
test('unsupported vibration and broken audio do not prevent visual success',async()=>{
  const s=await setup({supported:false,audioFails:true});
  s.state('processing');s.state('success');assert.equal(s.host.dataset.state,'success');assert.match(s.host.nodes['[data-status]'].textContent,/correctamente/);s.host.disconnectedCallback();
});
test('demo prevents default, locks rapid submissions, resets and simulates error without signals',async()=>{
  const s=await setup();s.host.disconnectedCallback();s.host.dataset.demo='true';s.host.connectedCallback();await Promise.resolve();
  const submit=()=>s.host.form.dispatchEvent(new Event('submit',{cancelable:true}));
  assert.equal(submit(),false);submit();await new Promise(r=>setTimeout(r,700));assert.equal(s.vibrations,1);
  s.host.form.dispatchEvent(new Event('reset'));assert.equal(s.host.dataset.state,'idle');
  s.host.form.nodes['[data-demo-error]']={checked:true};submit();await new Promise(r=>setTimeout(r,700));assert.equal(s.host.dataset.state,'error');assert.equal(s.vibrations,1);s.host.disconnectedCallback();
});
