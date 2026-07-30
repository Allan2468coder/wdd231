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

const WMO_CODES = {
  0:  { description: 'Clear sky',             icon: '01d' },
  1:  { description: 'Mainly clear',          icon: '02d' },
  2:  { description: 'Partly cloudy',         icon: '03d' },
  3:  { description: 'Overcast',              icon: '04d' },
  45: { description: 'Foggy',                 icon: '50d' },
  48: { description: 'Depositing rime fog',   icon: '50d' },
  51: { description: 'Light drizzle',         icon: '09d' },
  53: { description: 'Moderate drizzle',      icon: '09d' },
  55: { description: 'Dense drizzle',         icon: '09d' },
  56: { description: 'Light freezing drizzle',icon: '09d' },
  57: { description: 'Dense freezing drizzle',icon: '09d' },
  61: { description: 'Slight rain',           icon: '10d' },
  63: { description: 'Moderate rain',         icon: '10d' },
  65: { description: 'Heavy rain',            icon: '10d' },
  66: { description: 'Light freezing rain',   icon: '10d' },
  67: { description: 'Heavy freezing rain',   icon: '10d' },
  71: { description: 'Slight snow',           icon: '13d' },
  73: { description: 'Moderate snow',         icon: '13d' },
  75: { description: 'Heavy snow',            icon: '13d' },
  77: { description: 'Snow grains',           icon: '13d' },
  80: { description: 'Slight rain showers',   icon: '09d' },
  81: { description: 'Moderate rain showers', icon: '09d' },
  82: { description: 'Violent rain showers',  icon: '09d' },
  85: { description: 'Slight snow showers',   icon: '13d' },
  86: { description: 'Heavy snow showers',    icon: '13d' },
  95: { description: 'Thunderstorm',          icon: '11d' },
  96: { description: 'Thunderstorm with slight hail', icon: '11d' },
  99: { description: 'Thunderstorm with heavy hail',   icon: '11d' }
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { description: 'Unknown', icon: '01d' };
}

function formatDateFromString(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr + 'T12:00:00'));
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
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=2.2497&longitude=32.8998&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=4'
    );
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();

    const currentWeather = data.current_weather;
    const currentInfo = getWeatherInfo(currentWeather.weathercode);

    const weatherData = {
      current: {
        temp: currentWeather.temperature,
        weather: [{ description: currentInfo.description, icon: currentInfo.icon }]
      },
      daily: data.daily.time.map((dateStr, i) => {
        const dayInfo = getWeatherInfo(data.daily.weathercode[i]);
        return {
          dt: new Date(dateStr + 'T12:00:00').getTime() / 1000,
          temp: { day: data.daily.temperature_2m_max[i] },
          weather: [{ icon: dayInfo.icon }]
        };
      }).slice(0, 3)
    };

    renderWeather(weatherData, 'Live weather powered by Open-Meteo (free API).');
  } catch (error) {
    console.error(error);
    renderWeather(sampleWeatherData(), 'Live weather is currently unavailable. Showing sample data.');
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
