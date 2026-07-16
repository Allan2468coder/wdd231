const directory = document.querySelector('#member-directory');
const gridButton = document.querySelector('#grid-view');
const listButton = document.querySelector('#list-view');

function setView(view) {
  const isGrid = view === 'grid';
  directory.classList.toggle('member-grid', isGrid);
  directory.classList.toggle('member-list', !isGrid);
  gridButton.classList.toggle('is-active', isGrid);
  listButton.classList.toggle('is-active', !isGrid);
  gridButton.setAttribute('aria-pressed', String(isGrid));
  listButton.setAttribute('aria-pressed', String(!isGrid));
}

function membershipName(level) {
  return ['Member', 'Silver Member', 'Gold Member'][level - 1] ?? 'Member';
}

function displayMembers(members) {
  directory.innerHTML = members.map((member) => `
    <article class="member-card">
      <div class="member-card__head">
        <img src="images/businesses/${member.image}" alt="${member.name} logo" width="150" height="70">
        <h2>${member.name}</h2>
        <span class="member-card__level">${membershipName(member.membershipLevel)}</span>
      </div>
      <div class="member-card__body">
        <p>${member.address}</p>
        <p>${member.phone}</p>
        <p><a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit website</a></p>
      </div>
    </article>`).join('');
}

async function getMembers() {
  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`Directory data failed: ${response.status}`);
    displayMembers(await response.json());
  } catch (error) {
    console.error(error);
    directory.innerHTML = '<p>We could not load the directory. Please try again shortly.</p>';
  }
}

gridButton.addEventListener('click', () => setView('grid'));
listButton.addEventListener('click', () => setView('list'));
document.querySelector('#currentyear').textContent = new Date().getFullYear();
document.querySelector('#lastModified').textContent = document.lastModified;
getMembers();
