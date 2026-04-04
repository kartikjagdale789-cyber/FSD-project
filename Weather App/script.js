// API Configuration
const API_KEY = '1538083c7a594585d868901660476403'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const unitToggle = document.getElementById('unit-toggle');
const themeToggle = document.getElementById('theme-toggle');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const cityName = document.getElementById('city-name');
const temp = document.getElementById('temp');
const unitDisplay = document.getElementById('unit-display');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const weatherIcon = document.getElementById('weather-icon');

// State Variables
let isCelsius = true;
let isDark = false;

// Initialize App
function init() {
    loadFromLocalStorage();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeather(city);
            }
        }
    });

    locationBtn.addEventListener('click', getWeatherByLocation);
    unitToggle.addEventListener('click', toggleUnit);
    themeToggle.addEventListener('click', toggleTheme);
}

// Toggle Temperature Unit
function toggleUnit() {
    isCelsius = !isCelsius;
    unitToggle.textContent = isCelsius ? '°C' : '°F';
    unitDisplay.textContent = isCelsius ? '°C' : '°F';

    // Update displayed temperature if weather is shown
    if (!weatherCard.classList.contains('hidden')) {
        const currentTemp = parseFloat(temp.textContent);
        const convertedTemp = convertTemp(currentTemp, isCelsius);
        temp.textContent = Math.round(convertedTemp);
    }
}

// Toggle Theme
function toggleTheme() {
    isDark = !isDark;
    document.body.classList.toggle('dark', isDark);
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Get Weather by City Name
async function getWeather(city) {
    try {
        showLoading();
        hideError();

        const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(response.status === 404 ? 'City not found' : 'Failed to fetch weather data');
        }

        const data = await response.json();
        displayWeather(data);
        saveToLocalStorage(city);
        setBackground(data.weather[0].main);

    } catch (error) {
        displayError(error.message);
    } finally {
        hideLoading();
    }
}

// Get Weather by Current Location
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        displayError('Geolocation is not supported by this browser');
        return;
    }

    showLoading();
    hideError();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const url = `${API_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Failed to fetch weather data for your location');
                }

                const data = await response.json();
                displayWeather(data);
                cityInput.value = data.name; // Update input with city name
                saveToLocalStorage(data.name);
                setBackground(data.weather[0].main);

            } catch (error) {
                displayError(error.message);
            } finally {
                hideLoading();
            }
        },
        (error) => {
            hideLoading();
            displayError('Unable to retrieve your location');
        }
    );
}

// Display Weather Data
function displayWeather(data) {
    cityName.textContent = data.name;
    const temperature = isCelsius ? data.main.temp : convertTemp(data.main.temp, false);
    temp.textContent = Math.round(temperature);
    unitDisplay.textContent = isCelsius ? '°C' : '°F';
    condition.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} km/h`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    weatherCard.classList.remove('hidden');
}

// Display Error
function displayError(message) {
    document.getElementById('error-message').textContent = message;
    errorDiv.classList.remove('hidden');
    weatherCard.classList.add('hidden');
}

// Show Loading
function showLoading() {
    loading.classList.remove('hidden');
    weatherCard.classList.add('hidden');
    errorDiv.classList.add('hidden');
}

// Hide Loading
function hideLoading() {
    loading.classList.add('hidden');
}

// Hide Error
function hideError() {
    errorDiv.classList.add('hidden');
}

// Save to Local Storage
function saveToLocalStorage(city) {
    localStorage.setItem('lastCity', city);
}

// Load from Local Storage
function loadFromLocalStorage() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
    }
}

// Set Background Based on Weather
function setBackground(weatherMain) {
    const body = document.body;
    body.classList.remove('rainy', 'cloudy', 'sunny', 'snowy');

    switch (weatherMain.toLowerCase()) {
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
            body.classList.add('rainy');
            break;
        case 'clouds':
            body.classList.add('cloudy');
            break;
        case 'clear':
            body.classList.add('sunny');
            break;
        case 'snow':
            body.classList.add('snowy');
            break;
        default:
            // Keep default gradient
            break;
    }
}

// Convert Temperature
function convertTemp(temp, toCelsius) {
    if (toCelsius) {
        return (temp - 32) * 5 / 9;
    } else {
        return (temp * 9 / 5) + 32;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);