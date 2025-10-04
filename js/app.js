// main.js — simplified for always-open course lists + fade-in animation
const topicsUrl = './data/topics.json';
const topicsContainer = document.getElementById('topics-container');

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

  populatePreviews(topicsData);

  // Fade-in animations
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

function populatePreviews(topics){
  document.querySelectorAll('.topic-block').forEach(block=>{
    const tid = block.dataset.topic;
    const listEl = block.querySelector('.course-list');
    listEl.innerHTML = ''; // clear

    const topic = topics.find(x => x.id === tid);
    if(topic && topic.links && topic.links.length){
      topic.links.forEach(link => {
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

    // Make course list visible by default
    listEl.classList.add('open');
  });
}

// small XSS-safe helpers
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'%22'); }

document.addEventListener('DOMContentLoaded', init);
