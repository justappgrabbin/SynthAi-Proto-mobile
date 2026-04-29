import { MemoryFabric } from './memory_fabric.js';
import { createState } from './syntia_state.js';
import { createGraphRuntime } from './graph_runtime.js';
import { createUIBridge } from './ui_bridge.js';
import { createCynthia } from './cynthia_core.js';
import { createIngestBridge } from './ingest_bridge.js';
import { compileIntent } from './intent_compiler.js';
import { mountSubstrate64 } from './substrate64_core.js';

const state = createState();
MemoryFabric.load();
MemoryFabric.history = MemoryFabric.history || [];

const runtime = createGraphRuntime(state);
const ui = createUIBridge(state, runtime);
const cynthia = createCynthia({ state });
const ingest = createIngestBridge(runtime, ui, state);
const substrate = mountSubstrate64(state, ui);

state.currentAddress = (gate)=>{
  const line = 1;
  const color = 1;
  const tone = 1;
  const base = 1;
  return `D${Math.ceil(gate/13)}·G${gate}·L${line}·C${color}·T${tone}·B${base}`;
};

window.SYNTIA = {
  state, runtime, ui, cynthia, ingest, substrate, MemoryFabric
};

document.addEventListener('DOMContentLoaded', ()=>{
  bindTabs();
  bindGeometry();
  bindChat();
  bindIntent();
  bindUpload();
  seed();
  ui.renderAll();
  cynthia.say('System initialized. Memory Fabric mounted. Substrate live.', ui);
});

function seed(){
  [20,10,57,34,1,8,43,23].forEach((gate, i)=>{
    runtime.spawnGraphNode(gate, i < 4 ? 'integrating' : 'active');
    runtime.activateGate(gate, [1,0.6,0.4,0.2,0.1,0.1]);
  });
  runtime.runMorphCycle();
  ui.renderAll();
}

function bindTabs(){
  document.querySelectorAll('.tabs').forEach(tabs=>{
    tabs.querySelectorAll('.tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        const pane = tab.dataset.pane;
        tabs.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
        tab.classList.add('on');
        const body = tabs.nextElementSibling;
        body.querySelectorAll('.tab-panel').forEach(panel=>{
          panel.classList.toggle('on', panel.id === pane);
        });
      });
    });
  });
}

function bindGeometry(){
  document.querySelectorAll('.geo-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.geometry = btn.dataset.geo;
      document.querySelectorAll('.geo-btn').forEach(b=>b.classList.toggle('on', b === btn));
      ui.addLog(`GEOMETRY ${state.geometry.toUpperCase()}`);
      ui.renderAll();
    });
  });
}

function bindChat(){
  const input = document.getElementById('chat-input');
  const send = document.getElementById('chat-send');

  const act = ()=>{
    const text = input.value.trim();
    if(!text) return;
    input.value = '';
    cynthia.reply(text, ui);
  };

  send.addEventListener('click', act);
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      act();
    }
  });
}

function bindIntent(){
  const box = document.getElementById('intent-box');
  const btn = document.getElementById('intent-run');

  const preview = ()=>{
    const text = box.value.trim();
    if(!text){
      document.getElementById('intent-addr').textContent = 'type above to see address...';
      document.getElementById('intent-traits').innerHTML = '';
      return;
    }

    const result = compileIntentPreview(text);
    document.getElementById('intent-addr').textContent = result.address;
    document.getElementById('intent-traits').innerHTML = Object.entries(result.traits).map(([k,v])=>{
      const on = typeof v === 'boolean' ? v : v > 0.4;
      return `<div class="trait ${on ? 'on' : 'off'}">${k}${typeof v === 'number' ? ':'+v.toFixed(2) : ''}</div>`;
    }).join('');
  };

  box.addEventListener('input', preview);

  btn.addEventListener('click', ()=>{
    const text = box.value.trim();
    if(!text) return;
    const result = compileIntent(text, runtime);
    state.address = {
      d: result.dimension,
      gate: result.gate,
      line: result.line,
      color: result.color,
      tone: result.tone,
      base: result.base,
      planet: "Sun",
      circuit: inferCircuit(result.gate),
      pressure: Number(state.structuralTension.toFixed(2))
    };
    ui.selectGate(result.gate - 1);
    ui.addMorphEvent('intensify', `Intent → ${result.address}`);
    ui.renderAll();
  });
}

function compileIntentPreview(text){
  const lower = text.toLowerCase();
  const traits = {
    build: /\b(build|system|admin|panel|router|hook|wire|deploy|structure)\b/.test(lower),
    morph: /\b(morph|transform|change|shift|mutate|evolve|reshape)\b/.test(lower),
    destroy: /\b(delete|remove|clear|destroy|dissolve|stop|end)\b/.test(lower),
    expand: /\b(expand|grow|scale|increase|extend|branch)\b/.test(lower),
    compress: /\b(compress|reduce|minimize|condense|simplify)\b/.test(lower),
    study: /\b(study|learn|read|inspect|analyze|ingest|understand)\b/.test(lower),
    browser: /\b(browser|browse|web|internet|page|site)\b/.test(lower),
    chat: /\b(chat|talk|message|speak|discuss|cynthia)\b/.test(lower),
    library: /\b(library|book|books|document|manual|archive|storage)\b/.test(lower),
    intensity: Math.min(1, Math.max(0.15, text.length / 140))
  };

  let h = 0;
  for(let i=0;i<text.length;i++) h = ((h<<5)-h+text.charCodeAt(i)) | 0;
  const gate = (Math.abs(h) % 64) + 1;
  const vector = [
    traits.build ? 1 : 0,
    traits.morph ? 1 : 0,
    traits.expand ? 1 : 0,
    traits.compress ? 1 : 0,
    traits.study ? 1 : 0,
    traits.intensity
  ];
  const line = vector.indexOf(Math.max(...vector)) + 1;
  const color = ((line-1)%6)+1;
  const tone = ((color-1)%6)+1;
  const base = ((tone-1)%5)+1;
  const dimension = Math.ceil(gate / 13);

  return {traits, address:`D${dimension}·G${gate}·L${line}·C${color}·T${tone}·B${base}`};
}

function bindUpload(){
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', ()=>fileInput.click());
  dropZone.addEventListener('dragover', (e)=>{
    e.preventDefault();
    dropZone.classList.add('drag');
  });
  dropZone.addEventListener('dragleave', ()=>{
    dropZone.classList.remove('drag');
  });
  dropZone.addEventListener('drop', async (e)=>{
    e.preventDefault();
    dropZone.classList.remove('drag');
    await ingest.ingestFiles(e.dataTransfer.files);
    ui.renderAll();
  });

  fileInput.addEventListener('change', async ()=>{
    await ingest.ingestFiles(fileInput.files);
    ui.renderAll();
  });
}

function inferCircuit(gate){
  if([20,10,57,34].includes(gate)) return 'Integration';
  if(gate % 3 === 0) return 'Collective';
  if(gate % 3 === 1) return 'Individual';
  return 'Tribal';
}
