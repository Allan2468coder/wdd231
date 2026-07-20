/* ─── Chamber Home Page ────────────────────────────────────────────── */
/* Weather: Lira City, Uganda coordinates (lat=2.2474, lon=32.9010)    */
/* Uses Open-Meteo (current weather + daily forecast; no API key required) */
/* Spotlights: random gold/silver members from members.json            */
/* ──────────────────────────────────────────────────────────────────── */

const LAT = '2.2474';
const LON = '32.9010';
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=4`;

/* ─── Weather ─────────────────────────────────────────────────────── */

async function getWeather() {
  try {
    const response = await fetch(WEATHER_URL);
    if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);

    const weather = await response.json();
    displayOpenMeteoCurrentWeather(weather.current);
    displayOpenMeteoForecast(weather.daily);
  } catch (error) {
    console.error('Weather fetch failed:', error);
    document.querySelector('#weather-display').innerHTML =
      '<p class="weather-error">Weather data is currently unavailable. Please check back later.</p>';
  }
}

function weatherDetails(code) {
  if (code === 0) return { label: 'Clear sky', icon: '☀️' };
  if (code <= 2) return { label: 'Partly cloudy', icon: '🌤️' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '❄️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌧️' };
  return { label: 'Thunderstorm', icon: '⛈️' };
}

function displayOpenMeteoCurrentWeather(data) {
  const { label, icon } = weatherDetails(data.weather_code);
  const weatherIcon = document.querySelector('#weather-icon');

  weatherIcon.textContent = icon;
  weatherIcon.setAttribute('aria-label', label);
  document.querySelector('#weather-temp').textContent = `${Math.round(data.temperature_2m)}\u00B0C`;
  document.querySelector('#weather-desc').textContent = label;
  document.querySelector('#weather-humidity').textContent = `Humidity: ${data.relative_humidity_2m}%`;
}

function displayOpenMeteoForecast(data) {
  const cards = document.querySelectorAll('.forecast-card');

  data.time.slice(1, 4).forEach((date, index) => {
    const card = cards[index];
    const { label, icon } = weatherDetails(data.weather_code[index + 1]);
    const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
    const forecastIcon = card.querySelector('.forecast-icon');

    card.querySelector('.forecast-day').textContent = dayName;
    forecastIcon.textContent = icon;
    forecastIcon.setAttribute('aria-label', label);
    card.querySelector('.forecast-temp').textContent = `${Math.round(data.temperature_2m_max[index + 1])}\u00B0C`;
  });
}

function displayCurrentWeather(data) {
  const temp = Math.round(data.main.temp);
  const desc = data.weather[0].description;
  const icon = data.weather[0].icon;
  const humidity = data.main.humidity;

  document.querySelector('#weather-icon').src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.querySelector('#weather-icon').alt = desc;
  document.querySelector('#weather-temp').textContent = `${temp}°C`;
  document.querySelector('#weather-desc').textContent =
    desc.charAt(0).toUpperCase() + desc.slice(1);
  document.querySelector('#weather-humidity').textContent = `Humidity: ${humidity}%`;
}

function displayForecast(data) {
  // Get one reading per day (midday approx) for next 3 days
  const dailyForecasts = [];
  const seenDates = new Set();

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!seenDates.has(date)) {
      seenDates.add(date);
      dailyForecasts.push(item);
    }
    if (dailyForecasts.length === 4) break; // today + 3 more
  }

  // Skip today's forecast (index 0), show next 3 days (index 1-3)
  const cards = document.querySelectorAll('.forecast-card');
  const forecastDays = dailyForecasts.slice(1, 4);

  forecastDays.forEach((day, i) => {
    if (i >= cards.length) return;
    const card = cards[i];
    const dateObj = new Date(day.dt_txt + ' UTC');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0].icon;

    card.querySelector('.forecast-day').textContent = dayName;
    card.querySelector('img').src =
      `https://openweathermap.org/img/wn/${icon}.png`;
    card.querySelector('img').alt = day.weather[0].description;
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

