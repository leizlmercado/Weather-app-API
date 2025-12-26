function getWeather() {
    const city = document.getElementById("city").value;
    const resultDiv = document.getElementById("result");
    const forecastDiv = document.getElementById("forecast");
    const apiKey = "9f10ab0999caa101db4c5618fe7748c8";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    
    // Show loading state
    resultDiv.className = "result loading";
    resultDiv.innerHTML = "Loading weather data...";
    forecastDiv.style.display = "none";
    
    // Fetch current weather
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const temp = Math.round(data.main.temp);
                const description = data.weather[0].description;
                const weatherMain = data.weather[0].main.toLowerCase();
                const feelsLike = Math.round(data.main.feels_like);
                const humidity = data.main.humidity;
                const windSpeed = Math.round(data.wind.speed * 3.6);
                
                // Update background and clouds based on weather
                updateWeatherBackground(weatherMain, description, temp);
                
                // Get weather icon emoji
                const weatherIcon = getWeatherIcon(weatherMain, description);
                
                // Display weather information with prominent temperature, humidity, and icon
                resultDiv.className = "result success";
                resultDiv.innerHTML = `
                    <div class="city-header">
                        <span class="city-name">${data.name}</span>
                        <span class="city-country">${data.sys.country}</span>
                    </div>
                    <div class="main-weather-display">
                        <div class="main-weather-icon">${weatherIcon}</div>
                        <div class="main-temp">${temp}°C</div>
                        <div class="main-humidity">💧 ${humidity}%</div>
                    </div>
                    <div class="weather-items">
                        <div class="weather-item">
                            <div class="weather-icon">🌡️</div>
                            <span class="weather-label">Temperature</span>
                            <span class="weather-value">${temp}°C</span>
                        </div>
                        <div class="weather-item">
                            <div class="weather-icon">${weatherIcon}</div>
                            <span class="weather-label">Weather</span>
                            <span class="weather-value">${description}</span>
                        </div>
                        <div class="weather-item">
                            <div class="weather-icon">💧</div>
                            <span class="weather-label">Humidity</span>
                            <span class="weather-value">${humidity}%</span>
                        </div>
                        <div class="weather-item">
                            <div class="weather-icon">🤔</div>
                            <span class="weather-label">Feels Like</span>
                            <span class="weather-value">${feelsLike}°C</span>
                        </div>
                        <div class="weather-item">
                            <div class="weather-icon">💨</div>
                            <span class="weather-label">Wind Speed</span>
                            <span class="weather-value">${windSpeed} km/h</span>
                        </div>
                    </div>
                `;
                
                // Save to search history
                saveToSearchHistory(city, data.name, data.sys.country, temp, weatherIcon);
                
                // Fetch 5-day forecast
                return fetch(forecastUrl);
            } else {
                throw new Error(data.message || "City not found");
            }
        })
        .then(response => {
            if (response) {
                return response.json();
            }
        })
        .then(forecastData => {
            if (forecastData && forecastData.cod === "200") {
                displayForecast(forecastData);
            }
        })
        .catch(error => {
            resultDiv.className = "result error";
            resultDiv.innerText = error.message || "City not found. Please try again.";
            forecastDiv.style.display = "none";
            // Reset to default background on error
            document.body.className = "default";
            clearClouds();
            clearRain();
        });
}

function displayForecast(data) {
    const forecastDiv = document.getElementById("forecast");
    const forecastList = data.list;
    
    // Group forecasts by day and get one per day for 5 days
    const dailyForecasts = [];
    const seenDates = new Set();
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        // Get forecast for noon (12:00) or closest to it
        if (!seenDates.has(dateKey) && date.getHours() >= 12 && date.getHours() <= 15) {
            dailyForecasts.push(item);
            seenDates.add(dateKey);
        }
    });
    
    // Take first 5 days
    const fiveDayForecast = dailyForecasts.slice(0, 5);
    
    if (fiveDayForecast.length > 0) {
        forecastDiv.style.display = "block";
        forecastDiv.innerHTML = `
            <h2 class="forecast-title">📅 5-Day Forecast</h2>
            <div class="forecast-items">
                ${fiveDayForecast.map(item => {
                    const date = new Date(item.dt * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    const temp = Math.round(item.main.temp);
                    const humidity = item.main.humidity;
                    const weatherIcon = getWeatherIcon(item.weather[0].main.toLowerCase(), item.weather[0].description);
                    
                    return `
                        <div class="forecast-item">
                            <div class="forecast-date">
                                <div class="forecast-day">${dayName}</div>
                                <div class="forecast-date-num">${dayNum} ${month}</div>
                            </div>
                            <div class="forecast-icon">${weatherIcon}</div>
                            <div class="forecast-temp">${temp}°C</div>
                            <div class="forecast-humidity">💧 ${humidity}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}

function updateWeatherBackground(weatherMain, description, temp) {
    const body = document.body;
    const cloudContainer = document.getElementById("cloudContainer");
    
    // Clear existing clouds and rain
    clearClouds();
    clearRain();
    
    // Remove all weather classes
    body.classList.remove("sunny", "rainy", "cloudy", "default");
    
    // Determine weather type
    const isRainy = weatherMain.includes("rain") || weatherMain.includes("drizzle") || 
                    description.includes("rain") || description.includes("drizzle");
    const isCloudy = weatherMain.includes("cloud") || description.includes("cloud");
    const isSunny = weatherMain.includes("clear") || (temp > 20 && !isRainy && !isCloudy);
    
    if (isRainy) {
        body.classList.add("rainy");
        createClouds(8, "rainy"); // More clouds for rainy weather
        createRain();
    } else if (isCloudy) {
        body.classList.add("cloudy");
        createClouds(6, "cloudy"); // Moderate clouds for cloudy weather
    } else if (isSunny) {
        body.classList.add("sunny");
        createClouds(3, "sunny"); // Few clouds for sunny weather
    } else {
        body.classList.add("default");
        createClouds(4, "default");
    }
}

function createClouds(count, type) {
    const cloudContainer = document.getElementById("cloudContainer");
    const sizes = ["small", "medium", "large"];
    
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement("div");
        cloud.className = `cloud ${sizes[Math.floor(Math.random() * sizes.length)]}`;
        
        // Random starting position
        const startY = Math.random() * 40 + 10; // 10% to 50% from top
        const delay = Math.random() * 5; // Random delay
        const duration = 20 + Math.random() * 15; // 20-35 seconds
        
        cloud.style.top = `${startY}%`;
        cloud.style.left = `${-200}px`;
        cloud.style.animationDelay = `${delay}s`;
        cloud.style.animationDuration = `${duration}s`;
        
        cloudContainer.appendChild(cloud);
    }
}

function createRain() {
    const rainContainer = document.getElementById("rainContainer");
    const dropCount = 200; // Increased number of rain drops for better effect
    
    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement("div");
        
        // Random speed class for variety
        const speedClasses = ["fast", "medium", "slow"];
        const speedClass = speedClasses[Math.floor(Math.random() * speedClasses.length)];
        drop.className = `rain-drop ${speedClass}`;
        
        // Random horizontal position
        const left = Math.random() * 100;
        // Random delay for staggered effect
        const delay = Math.random() * 3;
        // Random starting position
        const startY = Math.random() * -200;
        
        drop.style.left = `${left}%`;
        drop.style.animationDelay = `${delay}s`;
        drop.style.top = `${startY}px`;
        
        rainContainer.appendChild(drop);
    }
    
    // Create rain splashes at bottom periodically
    createRainSplashes();
}

function createRainSplashes() {
    const rainContainer = document.getElementById("rainContainer");
    
    setInterval(() => {
        if (document.body.classList.contains("rainy")) {
            // Create 3-5 splashes randomly at the bottom
            const splashCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < splashCount; i++) {
                const splash = document.createElement("div");
                splash.className = "rain-splash";
                splash.style.left = `${Math.random() * 100}%`;
                splash.style.bottom = "0";
                splash.style.animationDelay = `${Math.random() * 0.2}s`;
                
                rainContainer.appendChild(splash);
                
                // Remove splash after animation
                setTimeout(() => {
                    if (splash.parentNode) {
                        splash.parentNode.removeChild(splash);
                    }
                }, 300);
            }
        }
    }, 200);
}

function clearClouds() {
    const cloudContainer = document.getElementById("cloudContainer");
    cloudContainer.innerHTML = "";
}

function clearRain() {
    const rainContainer = document.getElementById("rainContainer");
    rainContainer.innerHTML = "";
}

function getWeatherIcon(weatherMain, description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('clear') || desc.includes('sun')) {
        return '☀️';
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
        return '🌧️';
    } else if (desc.includes('thunderstorm')) {
        return '⛈️';
    } else if (desc.includes('snow')) {
        return '❄️';
    } else if (desc.includes('cloud')) {
        return '☁️';
    } else if (desc.includes('mist') || desc.includes('fog')) {
        return '🌫️';
    } else if (desc.includes('wind')) {
        return '💨';
    } else {
        return '🌤️';
    }
}

// Allow Enter key to search
document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
    }
});

// Search History Functions
function saveToSearchHistory(searchQuery, cityName, country, temp, icon) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
    
    // Remove if already exists (to avoid duplicates)
    history = history.filter(item => item.cityName.toLowerCase() !== cityName.toLowerCase());
    
    // Add new search to beginning
    history.unshift({
        searchQuery: searchQuery,
        cityName: cityName,
        country: country,
        temp: temp,
        icon: icon,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 5 searches
    history = history.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    
    // Update display
    displaySearchHistory();
}

function displaySearchHistory() {
    const historyDiv = document.getElementById("searchHistory");
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
    
    if (history.length === 0) {
        historyDiv.innerHTML = '<div class="no-history">No search history yet. Start searching for cities!</div>';
        return;
    }
    
    historyDiv.innerHTML = history.map((item, index) => {
        const date = new Date(item.timestamp);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="history-item" onclick="searchFromHistory('${item.searchQuery}')">
                <div class="history-icon">${item.icon}</div>
                <div class="history-info">
                    <div class="history-city">${item.cityName}</div>
                    <div class="history-details">
                        <span class="history-temp">${item.temp}°C</span>
                        <span class="history-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="history-arrow">→</div>
            </div>
        `;
    }).join('');
}

function searchFromHistory(cityName) {
    document.getElementById("city").value = cityName;
    getWeather();
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Initialize with default state
window.addEventListener('load', () => {
    document.body.className = "default";
    createClouds(4, "default");
    displaySearchHistory();
});

