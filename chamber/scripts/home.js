/* ─── Chamber Home Page ────────────────────────────────────────────── */
/* Weather: Lira City, Uganda coordinates (lat=2.2474, lon=32.9010)    */
/* Uses Open-Meteo (current weather + daily forecast; no API key required) */
/* Spotlights: random gold/silver members from members.json            */
/* ──────────────────────────────────────────────────────────────────── */

const LAT = '2.2474';
const LON = '32.9010';
const WEATHER_API_KEY = 'demo';
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${WEATHER_API_KEY}`;

/* ─── Weather ─────────────────────────────────────────────────────── */

async function getWeather() {
  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(WEATHER_URL),
      fetch(FORECAST_URL)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error(`Weather API responded with ${currentResponse.status} / ${forecastResponse.status}`);
    }

    const currentWeather = await currentResponse.json();
    const forecastWeather = await forecastResponse.json();

    displayCurrentWeather(currentWeather);
    displayForecast(forecastWeather);
  } catch (error) {
    console.error('Weather fetch failed:', error);
    document.querySelector('#weather-display').innerHTML =
      '<p class="weather-error">Weather data is currently unavailable. Please check back later.</p>';
  }
}

function weatherIcon(main) {
  if (main === 'Clear') return '☀️';
  if (main === 'Clouds') return '☁️';
  if (main === 'Rain' || main === 'Drizzle') return '🌧️';
  if (main === 'Snow') return '❄️';
  if (main === 'Thunderstorm') return '⛈️';
  if (main === 'Mist' || main === 'Fog') return '🌫️';
  return '🌤️';
}

function displayCurrentWeather(data) {
  const weather = data.weather[0];
  const temp = Math.round(data.main.temp);
  const humidity = data.main.humidity;
  const description = weather.description.charAt(0).toUpperCase() + weather.description.slice(1);
  const icon = weatherIcon(weather.main);

  const weatherIcon = document.querySelector('#weather-icon');
  weatherIcon.textContent = icon;
  weatherIcon.setAttribute('aria-label', description);
  document.querySelector('#weather-temp').textContent = `${temp}°C`;
  document.querySelector('#weather-desc').textContent = description;
  document.querySelector('#weather-humidity').textContent = `Humidity: ${humidity}%`;
}

function displayForecast(data) {
  const dailyForecasts = [];
  const seenDates = new Set();

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!seenDates.has(date)) {
      seenDates.add(date);
      dailyForecasts.push(item);
    }
    if (dailyForecasts.length === 4) break;
  }

  const cards = document.querySelectorAll('.forecast-card');
  const forecastDays = dailyForecasts.slice(1, 4);

  forecastDays.forEach((day, i) => {
    if (!cards[i]) return;
    const card = cards[i];
    const dateObj = new Date(day.dt_txt.replace(' ', 'T'));
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const temp = Math.round(day.main.temp);
    const icon = weatherIcon(day.weather[0].main);
    const forecastIcon = card.querySelector('.forecast-icon');

    card.querySelector('.forecast-day').textContent = dayName;
    forecastIcon.textContent = icon;
    forecastIcon.setAttribute('aria-label', day.weather[0].description);
    card.querySelector('.forecast-temp').textContent = `${temp}°C`;
  });
}

/* ─── Spotlights ──────────────────────────────────────────────────── */

function getRandomSpotlights(members, count) {
  const goldSilver = members.filter(
    (m) => m.membershipLevel === 2 || m.membershipLevel === 3
  );
  const shuffled = [...goldSilver].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function membershipName(level) {
  return ['Member', 'Silver Member', 'Gold Member'][level - 1] ?? 'Member';
}

function displaySpotlights(members) {
  const container = document.querySelector('#spotlights-grid');
  const spotlights = getRandomSpotlights(members, 3);

  container.innerHTML = spotlights
    .map(
      (m) => `
    <article class="spotlight-card">
      <div class="spotlight-head">
        <img src="images/businesses/${m.image}" alt="${m.name} logo" width="150" height="70" loading="lazy">
      </div>
      <div class="spotlight-body">
        <h3>${m.name}</h3>
        <span class="spotlight-level">${membershipName(m.membershipLevel)}</span>
        <p class="spotlight-address">${m.address}</p>
        <p class="spotlight-phone">${m.phone}</p>
        <p class="spotlight-website"><a href="${m.website}" target="_blank" rel="noopener noreferrer">Visit website</a></p>
      </div>
    </article>`
    )
    .join('');
}

async function getSpotlights() {
  try {
    const response = await fetch('data/members.json');
    if (!response.ok) throw new Error(`Members data failed: ${response.status}`);
    displaySpotlights(await response.json());
  } catch (error) {
    console.error(error);
    document.querySelector('#spotlights-grid').innerHTML =
      '<p>Spotlight data could not be loaded. Please try again later.</p>';
  }
}

/* ─── Footer Dates ────────────────────────────────────────────────── */

function setFooterDates() {
  const yearSpan = document.querySelector('#currentyear');
  const modSpan = document.querySelector('#lastModified');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  if (modSpan) modSpan.textContent = document.lastModified;
}

/* ─── Init ────────────────────────────────────────────────────────── */

getWeather();
getSpotlights();
setFooterDates();

