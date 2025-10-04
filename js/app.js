fetch('data/topics.json')
  .then(response => response.json())
  .then(topics => {
    const topicList = document.getElementById('topic-list');
    topicList.innerHTML = ""; // clear "Loading..."

    topics.forEach((topic, index) => {
      const btn = document.createElement('button');
      btn.innerText = topic.name;
      btn.className = "topic-btn";
      btn.onclick = () => loadTopic(topic);
      topicList.appendChild(btn);
    });

    // auto-load first topic
    if (topics.length > 0) {
      loadTopic(topics[0]);
    }
  });

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
