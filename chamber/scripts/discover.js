async function fetchDiscover() {
  try {
    const res = await fetch('data/discover.json');
    if (!res.ok) throw new Error('Failed to load data');
    const items = await res.json();
    renderCards(items);
    setVisitMessage();
  } catch (err) {
    console.error(err);
    document.getElementById('cards').innerHTML = '<p>Discover data failed to load.</p>';
  }
}

function renderCards(items){
  const container = document.getElementById('cards');
  const html = items.slice(0,8).map((it, idx) => `
    <article class="card" role="listitem">
      <img src="${it.image}" alt="${it.alt}" loading="lazy" width="600" height="400">
      <div class="card-body">
        <h3>${it.title}</h3>
        <p>${it.address}</p>
        <p>${it.description}</p>
        <a class="learn" href="#" aria-label="Learn more about ${it.title}">Learn More</a>
      </div>
    </article>
  `).join('');
  container.innerHTML = html;
}

function setVisitMessage(){
  const key = 'lira_last_visit';
  const now = new Date();
  const prev = localStorage.getItem(key);
  const el = document.getElementById('visit-message');
  if (prev){
    const d = new Date(prev);
    el.textContent = `Welcome back — your last visit was ${d.toLocaleString()}.`;
  } else {
    el.textContent = 'Welcome — this is your first visit!';
  }
  localStorage.setItem(key, now.toISOString());
}

// Initialize
fetchDiscover();
