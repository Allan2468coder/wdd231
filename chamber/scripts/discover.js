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
        <h2>${it.title}</h2>
        <address>${it.address}</address>
        <p>${it.description}</p>
        <a class="learn" href="#" aria-label="Learn more about ${it.title}">Learn More</a>
      </div>
    </article>
  `).join('');
  container.innerHTML = html;
}

function setVisitMessage(){
  const key = 'lira_last_visit';
  const now = Date.now();
  const prev = localStorage.getItem(key);
  const el = document.getElementById('visit-message');
  if (!prev) {
    el.textContent = 'Welcome! Let us know if you have any questions.';
  } else {
    const diff = now - Number(prev);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) {
      el.textContent = 'Back so soon! Awesome!';
    } else if (days === 1) {
      el.textContent = 'You last visited 1 day ago.';
    } else {
      el.textContent = `You last visited ${days} days ago.`;
    }
  }
  localStorage.setItem(key, String(now));
}

fetchDiscover();

