// Placeholder for future dynamic features
console.log("JS loaded - add search/filter functionality here");

// Example: You can later load courses from data/courses.js and render dynamically
// Load topics list
fetch('data/topics.json')
  .then(response => response.json())
  .then(topics => {
    const topicList = document.getElementById('topic-list');
    topics.forEach((topic, index) => {
      const btn = document.createElement('button');
      btn.innerText = topic.name;
      btn.className = "topic-btn";
      btn.onclick = () => loadTopic(topic);
      topicList.appendChild(btn);
    });
  });

// Function to load topic content dynamically
function loadTopic(topic) {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>${topic.name}</h2>
    <p>${topic.description}</p>
    <ul>
      ${topic.links.map(link => `<li><a href="${link.url}" target="_blank">${link.title}</a></li>`).join('')}
    </ul>
  `;
}
