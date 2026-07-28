const menuButton = document.querySelector('.menu-button');
const primaryNav = document.querySelector('#primary-nav');
const weatherDisplay = document.querySelector('#weather-display');
const forecastGrid = document.querySelector('#forecast-grid');
const weatherNote = document.querySelector('#weather-note');
const spotlightGrid = document.querySelector('#spotlight-grid');

document.querySelector('#currentyear').textContent = new Date().getFullYear();
document.querySelector('#lastModified').textContent = document.lastModified;

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(timestamp * 1000));
}

function membershipLabel(level) {
  return level === 3 ? 'Gold Member' : level === 2 ? 'Silver Member' : 'Member';
}

function sampleWeatherData() {
  const now = Math.floor(Date.now() / 1000);
  return {
    current: {
      temp: 28,
      weather: [{ description: 'Partly cloudy', icon: '03d' }]
    },
    daily: [
      { dt: now + 86400, temp: { day: 29 }, weather: [{ icon: '01d' }] },
      { dt: now + 172800, temp: { day: 31 }, weather: [{ icon: '02d' }] },
      { dt: now + 259200, temp: { day: 27 }, weather: [{ icon: '04d' }] }
    ]
  };
}

function renderWeather(data, note = '') {
  const current = data.current;
  const description = current.weather[0].description;
  const icon = current.weather[0].icon;
  weatherDisplay.innerHTML = `
    <div class="weather-current">
      <div class="details">
        <span>Current temperature</span>
        <span class="temp">${Math.round(current.temp)}°C</span>
        <span>${description}</span>
      </div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description} weather icon">
    </div>
  `;

  forecastGrid.innerHTML = data.daily.slice(0, 3).map((day) => `
    <article class="forecast-card">
      <strong>${formatDate(day.dt)}</strong>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Forecast icon">
      <span>${Math.round(day.temp.day)}°C</span>
    </article>
  `).join('');

  weatherNote.textContent = note;
}

async function loadWeather() {
  const apiKey = 'YOUR_API_KEY_HERE';
  const hasKey = apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  if (!hasKey) {
    renderWeather(sampleWeatherData(), 'Add an OpenWeatherMap API key to chamber/scripts/home.js for live weather updates.');
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=2.2497&lon=32.8998&units=metric&exclude=minutely,hourly,alerts&appid=${apiKey}`);
    if (!response.ok) throw new Error('Weather request failed');
    const weatherData = await response.json();
    renderWeather(weatherData, 'Live weather powered by OpenWeatherMap.');
  } catch (error) {
    console.error(error);
    renderWeather(sampleWeatherData(), 'Live weather is unavailable. Showing sample data until the API returns successfully.');
  }
}

function shuffleArray(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

async function loadSpotlights() {
  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error('Member data failed to load');
    const members = await response.json();
    const featured = members.filter((member) => member.membershipLevel >= 2);
    if (!featured.length) {
      spotlightGrid.innerHTML = '<p>No spotlight members are available at this time.</p>';
      return;
    }

    const selected = shuffleArray(featured).slice(0, Math.min(3, featured.length));
    spotlightGrid.innerHTML = selected.map((member) => `
      <article class="spotlight-card">
        <header>
          <h3>${member.name}</h3>
          <span class="spotlight-level">${membershipLabel(member.membershipLevel)}</span>
        </header>
        <div class="spotlight-body">
          <div class="spotlight-logo">
            <img src="images/businesses/${member.image}" alt="${member.name} logo">
            <div>
              <p>${member.category}</p>
              <p>${member.address}</p>
            </div>
          </div>
          <p>Phone: <a href="tel:${member.phone.replace(/\s+/g, '')}">${member.phone}</a></p>
          <p><a href="${member.website}" target="_blank" rel="noopener noreferrer">Visit website</a></p>
        </div>
      </article>
    `).join('');
  } catch (error) {
    console.error(error);
    spotlightGrid.innerHTML = '<p>Spotlight members could not be loaded at this time.</p>';
  }
}

loadWeather();
loadSpotlights();
