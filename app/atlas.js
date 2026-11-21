// Leonida Platinum Atlas — tracker logic.
// One module, no dependencies, no network beyond the atlas's own data file.
// State shape in localStorage: { earned: [trophy numbers], shield: bool }

const STORE_KEY = 'leonida-platinum-atlas/state/v2';

const STAGES = [
  { name: 'Stage 1 — The Story Spine', families: ['story'],
    note: 'Play the campaign straight through: the opening mission, four chapters, the named set-piece jobs and the finale. Twelve trophies live here, including the gold for the final mission, and finishing the story unlocks the calm free-roam the rest of the hunt needs.' },
  { name: 'Stage 2 — Friends, Strangers & Odd Jobs', families: ['side-quest'],
    note: 'Close out the named strands — Andy, Kenton, Billy, Randy, Tyrone and Bret — and keep going until eight stranger strands are complete. That sweep banks the Strangers & Freaks silver on top of each contact\u2019s own trophy.' },
  { name: 'Stage 3 — Skill, Speed & Spectacle', families: ['mastery', 'contest', 'stunt', 'combat'],
    note: 'The performance block: gold medals across all 42 shooting-range challenges, drone-race wins at 14 locations, 20 race wins, Cal\u2019s fishing challenge, 50 challenges and 250 stunts. Short, repeatable sessions clear this faster than one long grind.' },
  { name: 'Stage 4 — Paper Trails & Postcards', families: ['collectible', 'exploration', 'activity'],
    note: 'Coverage work: three full card sets, WAiNK It at 100 locations, all 52 areas explored, 18 meditation spots, 100 vehicles discovered, plus the one-off activity samples — arcade, bowling and the Scooter Bros registrations.' },
  { name: 'Stage 5 — Crime Pays (Eventually)', families: ['crime', 'duo', 'money', 'oddity'],
    note: 'The underworld ledger: five bank vaults, an armored truck, one illegal operation per gang, the partner wanted-level feats, $250,000 laundered, $100,000 spent and all eight garages bought. The oddity trophies ride along here — check the Missables watch before starting, not after.' },
  { name: 'Stage 6 — The Long Road & The Legend', families: ['completion', 'capstone'],
    note: 'Whatever the percentage counter still wants, finished methodically family by family, until A Long Road reports 100 percent. The platinum, Vice Got a Price!, follows on its own once the other 54 are earned.' },
];

const $ = (id) => document.getElementById(id);
const els = {
  list: $('cardList'), miss: $('missList'), stages: $('stageList'),
  search: $('searchBox'), kind: $('kindFilter'), grade: $('gradeFilter'), state: $('stateFilter'),
  showing: $('showingLine'), empty: $('emptyLine'),
  dialCount: $('dialCount'), dialPct: $('dialPct'), bar: $('barFill'), tiers: $('tierCounts'),
  shield: $('spoilerToggle'),
};

let atlas = null;
let store = loadStore();

function loadStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) return { earned: new Set(raw.earned), shield: !!raw.shield };
  } catch { /* a corrupt save falls back to a fresh one */ }
  return { earned: new Set(), shield: false };
}
function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...store.earned], shield: store.shield }));
}

const KIND_LABEL = {
  'capstone': 'Capstone', 'story': 'Story', 'side-quest': 'Side strand', 'mastery': 'Mastery',
  'contest': 'Contest', 'stunt': 'Stunts', 'combat': 'Combat', 'collectible': 'Collectible',
  'exploration': 'Exploration', 'activity': 'Activity', 'crime': 'Crime', 'duo': 'Partner',
  'money': 'Money', 'oddity': 'Oddity', 'completion': 'Completion',
};

function trophyCard(t, { forMissables = false } = {}) {
  const li = document.createElement('li');
  const done = store.earned.has(t.n);
  li.className = `card tier-${t.tier}` + (done ? ' isDone' : '');
  const shielded = store.shield && t.story && !done;
  if (shielded) li.classList.add('shielded');

  const head = document.createElement('div');
  head.className = 'cardHead';
  const num = document.createElement('span');
  num.className = 'num'; num.textContent = `#${String(t.n).padStart(2, '0')}`;
  const title = document.createElement('h3');
  title.textContent = t.title;
  if (shielded) title.classList.add('shieldTarget');
  const tier = document.createElement('span');
  tier.className = 'pill'; tier.textContent = t.tier;
  const kind = document.createElement('span');
  kind.className = 'pill'; kind.textContent = KIND_LABEL[t.family] ?? t.family;
  head.append(num, title, tier, kind);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'pill miss'; m.textContent = 'Missable — save first';
    head.append(m);
  }
  li.append(head);

  const blurb = document.createElement('p');
  blurb.className = 'blurb';
  blurb.textContent = `\u201C${t.blurb}\u201D`;
  if (shielded) blurb.classList.add('shieldTarget');
  li.append(blurb);

  const walk = document.createElement('p');
  walk.className = 'walk'; walk.textContent = t.walkthrough;
  li.append(walk);

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `When: ${t.phase}`;
  li.append(meta);

  if (shielded) {
    const note = document.createElement('p');
    note.className = 'shieldNote';
    note.textContent = 'Spoiler shield is hiding this story trophy\u2019s name and description until you earn it.';
    li.append(note);
  }

  const label = document.createElement('label');
  label.className = 'check';
  const box = document.createElement('input');
  box.type = 'checkbox'; box.checked = done;
  box.setAttribute('aria-label', `Mark ${t.title} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) store.earned.add(t.n); else store.earned.delete(t.n);
    persist(); renderAll();
  });
  const txt = document.createElement('span');
  txt.textContent = done ? 'Earned — nice work, legend.' : 'I have earned this trophy';
  label.append(box, txt);
  li.append(label);
  return li;
}

function passesFilters(t) {
  const q = els.search.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.title} ${t.blurb} ${t.walkthrough} ${t.phase} ${KIND_LABEL[t.family] ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (els.kind.value !== 'any' && t.family !== els.kind.value) return false;
  if (els.grade.value !== 'any' && t.tier !== els.grade.value) return false;
  if (els.state.value === 'done' && !store.earned.has(t.n)) return false;
  if (els.state.value === 'todo' && store.earned.has(t.n)) return false;
  return true;
}

function renderProgress() {
  const total = atlas.entries.length;
  const got = store.earned.size;
  els.dialCount.textContent = `${got} / ${total}`;
  els.dialPct.textContent = `${Math.round((got / total) * 100)}%`;
  els.bar.style.width = `${(got / total) * 100}%`;
  els.tiers.replaceChildren();
  for (const tier of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = atlas.entries.filter((t) => t.tier === tier);
    const have = all.filter((t) => store.earned.has(t.n)).length;
    const li = document.createElement('li');
    li.textContent = `${tier[0].toUpperCase()}${tier.slice(1)}`;
    const span = document.createElement('span');
    span.textContent = `${have} / ${all.length}`;
    li.append(span);
    els.tiers.append(li);
  }
}

function renderAtlas() {
  const visible = atlas.entries.filter(passesFilters);
  els.list.replaceChildren(...visible.map((t) => trophyCard(t)));
  els.showing.textContent = `Showing ${visible.length} of ${atlas.entries.length} trophies · ${store.earned.size} earned so far`;
  els.empty.hidden = visible.length !== 0;
}

function renderRoadmap() {
  els.stages.replaceChildren();
  for (const stage of STAGES) {
    const members = atlas.entries.filter((t) => stage.families.includes(t.family));
    const have = members.filter((t) => store.earned.has(t.n)).length;
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `${stage.name} — ${have}/${members.length}`;
    const p = document.createElement('p');
    p.textContent = stage.note;
    const names = document.createElement('p');
    names.textContent = `Covers: ${members.map((t) => t.title).join(' · ')}`;
    const barOuter = document.createElement('div');
    barOuter.className = 'stageBar';
    const barInner = document.createElement('div');
    barInner.style.width = `${members.length ? (have / members.length) * 100 : 0}%`;
    barOuter.append(barInner);
    li.append(h, p, names, barOuter);
    els.stages.append(li);
  }
}

function renderMissables() {
  const flagged = atlas.entries.filter((t) => t.missable);
  els.miss.replaceChildren(...flagged.map((t) => trophyCard(t, { forMissables: true })));
}

function renderAll() { renderProgress(); renderAtlas(); renderRoadmap(); renderMissables(); }

function showView(name) {
  for (const v of ['atlas', 'roadmap', 'missables']) {
    $(`view-${v}`).hidden = v !== name;
  }
  document.querySelectorAll('.viewBtn').forEach((b) => b.classList.toggle('isOn', b.dataset.view === name));
}

function wire() {
  const kinds = [...new Set(atlas.entries.map((t) => t.family))].sort();
  els.kind.replaceChildren();
  const any = document.createElement('option');
  any.value = 'any'; any.textContent = 'Any kind';
  els.kind.append(any);
  for (const k of kinds) {
    const o = document.createElement('option');
    o.value = k; o.textContent = KIND_LABEL[k] ?? k;
    els.kind.append(o);
  }
  for (const id of ['search', 'kind', 'grade', 'state']) {
    els[id].addEventListener('input', renderAtlas);
    els[id].addEventListener('change', renderAtlas);
  }
  els.shield.checked = store.shield;
  els.shield.addEventListener('change', () => { store.shield = els.shield.checked; persist(); renderAll(); });
  document.querySelectorAll('.viewBtn').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

  $('exportBtn').addEventListener('click', () => {
    const payload = JSON.stringify({ atlas: 'leonida-platinum-atlas', version: 2, earned: [...store.earned].sort((a, b) => a - b) }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    a.download = 'leonida-atlas-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importFile').addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const nums = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(nums)) throw new Error('no earned list');
      store.earned = new Set(nums.filter((n) => atlas.entries.some((t) => t.n === n)));
      persist(); renderAll();
    } catch { alert('That file does not look like an atlas progress export. Nothing was changed.'); }
    ev.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Clear every tick in this atlas? This cannot be undone.')) return;
    store.earned = new Set(); persist(); renderAll();
  });

  const wanted = new URLSearchParams(location.search).get('view');
  if (['roadmap', 'missables'].includes(wanted)) showView(wanted);
  if (new URLSearchParams(location.search).get('shield') === '1') {
    store.shield = true; els.shield.checked = true; persist();
  }
}

async function boot() {
  const res = await fetch('data/trophies.json');
  atlas = await res.json();
  wire();
  renderAll();
}
boot();
