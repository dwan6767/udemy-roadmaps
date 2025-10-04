// main.js — fetch topics and render single-page collapsible UI

const topicsUrl = 'data/topics.json';
const topicListEl = document.getElementById('topic-list');
const topicsContainer = document.getElementById('topics-container');
const searchInput = document.getElementById('topic-search');

let topicsData = [];

// Fetch topics.json and render
fetch(topicsUrl)
  .then(r => {
    if (!r.ok) throw new Error('Topics file not found');
    return r.json();
  })
  .then(json => {
    topicsData = json;
    renderTopicButtons(topicsData);
    renderAllTopicBlocks(topicsData);
  })
  .catch(err => {
    console.error('Failed to load topics.json:', err);
    topicListEl.innerHTML = '<p class="muted">Could not load topics. Make sure data/topics.json exists.</p>';
  });

function renderTopicButtons(topics) {
  topicListEl.innerHTML = ''; // clear
  topics.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.innerHTML = `<span>${t.name}</span><small class="small">${t.description.substring(0,60)}${t.description.length>60?"…":""}</small>`;
    btn.addEventListener('click', () => focusTopicBlock(t.id));
    topicListEl.appendChild(btn);
  });
}

// Render all topic blocks vertically. Each block is collapsible.
function renderAllTopicBlocks(topics) {
  topicsContainer.innerHTML = '';
  topics.forEach(t => {
    const block = document.createElement('div');
    block.className = 'topic-block';
    block.id = `topic-${t.id}`;

    const header = document.createElement('div');
    header.className = 'topic-header';
    header.innerHTML = `
      <div class="topic-title">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2v6" stroke="#00eaff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22v-6" stroke="#8e2de2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="7" stroke="rgba(255,255,255,0.06)"/></svg>
        <div>
          <h3>${t.name}</h3>
          <div class="topic-desc">${t.description}</div>
        </div>
      </div>
      <div class="topic-actions">
        <button class="toggle-btn">Open</button>
      </div>
    `;

    const listWrap = document.createElement('div');
    listWrap.className = 'course-list';
    listWrap.innerHTML = t.links.map(l => `
      <div class="course-card">
        <div class="course-meta">
          <h4>${escapeHtml(l.title)}</h4>
          <p>${escapeHtml(l.url)}</p>
        </div>
        <div class="course-cta">
          <a href="${escapeAttr(l.url)}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      </div>
    `).join('');

    header.addEventListener('click', () => toggleList(listWrap, header));
    block.appendChild(header);
    block.appendChild(listWrap);
    topicsContainer.appendChild(block);
  });
}

// toggle helper
function toggleList(listEl, headerEl){
  const open = listEl.classList.toggle('open');
  const btn = headerEl.querySelector('.toggle-btn');
  btn.textContent = open ? 'Close' : 'Open';
  // smooth scroll into view when opening
  if(open) listEl.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// focus a topic by opening its block and scrolling
function focusTopicBlock(id){
  const el = document.getElementById(`topic-${id}`);
  if(!el) return;
  const list = el.querySelector('.course-list');
  // close other open lists
  document.querySelectorAll('.course-list.open').forEach(x => {
    if(x !== list) {
      x.classList.remove('open');
      const b = x.previousElementSibling.querySelector('.toggle-btn');
      if(b) b.textContent = 'Open';
    }
  });
  // open clicked
  list.classList.add('open');
  const btn = el.querySelector('.toggle-btn');
  if(btn) btn.textContent = 'Close';
  el.scrollIntoView({behavior:'smooth', block:'center'});
}

// simple search
if(searchInput){
  searchInput.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = topicsData.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    renderTopicButtons(filtered);
    renderAllTopicBlocks(filtered);
  });
}

// small helpers to avoid XSS if fields are user-editable in future
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[s]);
}
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'%22'); }
