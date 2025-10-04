// main.js — hybrid AJAX preview + static fallback + fade-in animations
const topicsUrl = './data/topics.json';
const topicListEl = document.getElementById('topic-list');
const topicsContainer = document.getElementById('topics-container');
const searchInput = document.getElementById('topic-search');

let topicsData = [];

// Fallback sample data
const sampleFallback = [
  { id:'analog', name:'Analog Electronics', description:'Op-amps, filters, design.', links:[
    {title:'Analog Circuit (Udemy)', url:'#'},
    {title:'Op-Amp Basics (PDF)', url:'#'}
  ]},
  { id:'microcontrollers', name:'Microcontrollers', description:'Arduino, ESP32 projects', links:[
    {title:'ESP32 course', url:'#'}
  ]},
  { id:'basics', name:'Electronics Fundamentals', description:'Ohm law, transistors', links:[
    {title:'Basics course', url:'#'}
  ]}
];

async function init(){
  try {
    const r = await fetch(topicsUrl);
    if(!r.ok) throw new Error('topics.json not available');
    topicsData = await r.json();
  } catch (err) {
    console.warn('Could not fetch topics.json — using fallback. Error:', err);
    topicsData = sampleFallback;
  }

  renderTopicButtons(topicsData);
  populatePreviews(topicsData);
  setupSearch();
  setupToggleHeaders();
  setupFadeInAnimations();
}

// Render sidebar / top buttons
function renderTopicButtons(topics){
  if(!topicListEl) return;
  topicListEl.innerHTML = '';
  topics.forEach(t=>{
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.innerHTML = `<span>${t.name}</span><small class="small">${t.description.substring(0,60)}${t.description.length>60?"…":""}</small>`;
    btn.addEventListener('click', ()=> focusTopicBlock(t.id));
    topicListEl.appendChild(btn);
  });
}

// Populate previews into topic blocks
function populatePreviews(topics){
  document.querySelectorAll('.topic-block').forEach(block=>{
    const tid = block.dataset.topic;
    const listEl = block.querySelector('.course-list');
    listEl.innerHTML = '';
    const topic = topics.find(x => x.id === tid);
    if(topic && topic.links && topic.links.length){
      topic.links.slice(0,3).forEach(link => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
          <div class="course-meta">
            <h4>${escapeHtml(link.title)}</h4>
            <p class="muted">${escapeHtml(link.url)}</p>
          </div>
          <div class="course-cta">
            <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">Open</a>
          </div>
        `;
        listEl.appendChild(card);
      });
    } else {
      listEl.innerHTML = `<div class="course-card"><div class="course-meta"><h4>No preview available</h4><p class="muted">Open the full page for the complete list.</p></div></div>`;
    }
  });
}

// Setup toggle for topic blocks
function setupToggleHeaders(){
  document.querySelectorAll('.topic-header').forEach(header=>{
    header.addEventListener('click', ()=>{
      const block = header.closest('.topic-block');
      const list = block.querySelector('.course-list');
      const btn = header.querySelector('.toggle-btn');
      const open = list.classList.toggle('open');
      if(btn) btn.textContent = open ? 'Close' : 'Open';
      if(open) list.scrollIntoView({behavior:'smooth', block:'nearest'});
    });
  });
}

// Focus a topic block from sidebar buttons
function focusTopicBlock(id){
  const el = document.querySelector(`.topic-block[data-topic="${id}"]`);
  if(!el) return;
  document.querySelectorAll('.course-list.open').forEach(x=>{
    if(!el.contains(x)) {
      x.classList.remove('open');
      const b = x.previousElementSibling.querySelector('.toggle-btn');
      if(b) b.textContent = 'Open';
    }
  });
  const list = el.querySelector('.course-list');
  list.classList.add('open');
  const btn = el.querySelector('.toggle-btn');
  if(btn) btn.textContent = 'Close';
  el.scrollIntoView({behavior:'smooth', block:'center'});
}

// Setup search filter
function setupSearch(){
  if(!searchInput) return;
  searchInput.addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = topicsData.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    renderTopicButtons(filtered);
    document.querySelectorAll('.topic-block').forEach(block=>{
      const tid = block.dataset.topic;
      block.style.display = filtered.find(x => x.id === tid) ? '' : 'none';
    });
  });
}

// Fade-in animation
function setupFadeInAnimations(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.1});

  document.querySelectorAll('.topic-block, .course-card').forEach(el => observer.observe(el));
}

// XSS-safe helpers
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'%22'); }

document.addEventListener('DOMContentLoaded', init);
