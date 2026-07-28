const params = new URLSearchParams(window.location.search);
const dataMap = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'mobile', label: 'Mobile Phone' },
  { key: 'business', label: 'Business Name' },
  { key: 'timestamp', label: 'Submitted On' }
];
const detailsContainer = document.querySelector('#detail-list');

if (detailsContainer) {
  const items = dataMap.map(({ key, label }) => {
    const value = params.get(key) || 'Not provided';
    return `
      <div class="detail-item">
        <span>${label}</span>
        <p>${value}</p>
      </div>
    `;
  }).join('');
  detailsContainer.innerHTML = items;
}
