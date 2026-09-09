// ===== WEATHER APP WITH ANIMATIONS =====

const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const submitBtn = document.querySelector('button[type="submit"]');
const apiKey = "e2dea4acd9bd40c621954659c32daf5f";

// ===== ANIMATION CONTROLLER =====
const animationController = {
    // Show loading state
    showLoading() {
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Loading...';
        submitBtn.disabled = true;
        
        // Add pulse to card
        card.classList.add('loading-pulse');
    },

    // Hide loading state
    hideLoading() {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Search';
        submitBtn.disabled = false;
        card.classList.remove('loading-pulse');
    },

    // Trigger card update animation
    updateCard() {
        card.classList.add('update');
        setTimeout(() => {
            card.classList.remove('update');
        }, 500);
    },

    // Show error with animation
    showError(message) {
        card.textContent = "";
        card.style.display = "flex";
        
        const errorDisplay = document.createElement("p");
        errorDisplay.textContent = message;
        errorDisplay.classList.add("errorDisplay");
        
        card.appendChild(errorDisplay);
        
        // Trigger shake animation
        errorDisplay.style.animation = 'none';
        errorDisplay.offsetHeight; // Trigger reflow
        errorDisplay.style.animation = 'shake 0.6s ease-out, textReveal 0.8s ease-out 0.3s both';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            if (errorDisplay.parentNode) {
                errorDisplay.style.opacity = '0';
                errorDisplay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (errorDisplay.parentNode) {
                        errorDisplay.remove();
                        card.style.display = 'none';
                    }
                }, 500);
            }
        }, 5000);
    },

    // Animate weather elements with stagger
    animateWeatherElements() {
        const elements = card.querySelectorAll('.cityDisplay, .weatherEmoji, .tempDisplay, .descDisplay, .humidityDisplay');
        
        // Reset and re-animate with stagger
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            
            const delay = 0.2 + (index * 0.15);
            el.style.animation = `fadeUp 0.6s ease-out ${delay}s forwards`;
        });
    },

    // Bounce the emoji
    bounceEmoji() {
        const emoji = document.querySelector('.weatherEmoji');
        if (emoji) {
            emoji.style.animation = 'none';
            emoji.offsetHeight;
            emoji.style.animation = 'emojiFloat 0.6s ease-in-out 2';
        }
    },

    // Highlight temperature change
    highlightTemp() {
        const temp = document.querySelector('.tempDisplay');
        if (temp) {
            temp.classList.add('temp-glow');
            setTimeout(() => {
                temp.classList.remove('temp-glow');
            }, 800);
        }
    }
};

// ===== WEATHER FORM HANDLER =====
weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
        animationController.showError("Please enter a city name");
        return;
    }

    // Show loading animation
    animationController.showLoading();

    try {
        const weatherData = await getWeatherData(city);
        
        // Hide loading before displaying
        animationController.hideLoading();
        
        // Display weather with animations
        displayWeatherInfo(weatherData);
        
        // Trigger animations after display
        setTimeout(() => {
            animationController.animateWeatherElements();
            animationController.bounceEmoji();
            animationController.highlightTemp();
        }, 100);

    } catch (error) {
        console.error(error);
        animationController.hideLoading();
        animationController.showError(error.message || "Something went wrong");
    }
});

// ===== API CALL =====
async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);

    console.log("Response status:", response.status);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Invalid API key. Please check your API key.");
        }
        if (response.status === 404) {
            throw new Error("City not found. Please check the spelling.");
        }
        if (response.status === 429) {
            throw new Error("Too many requests. Please try again later.");
        }
        throw new Error("Unable to fetch weather data. Please try again.");
    }

    const data = await response.json();
    console.log("Weather Data:", data);
    return data;
}

// ===== DISPLAY WEATHER INFO =====
function displayWeatherInfo(data) {
    const { 
        name: city,
        main: { temp, humidity },
        weather: [{ description, id }]
    } = data;

    // Clear card and show
    card.textContent = "";
    card.style.display = "flex";
    card.style.opacity = "1";

    // Update weather background
    updateWeatherBackground(description);

    // Create elements
    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    // Set content
    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp * (9 / 5) + 32).toFixed(1)}°F`;
    humidityDisplay.textContent = `${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    // Add classes
    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    // Add to card
    card.appendChild(cityDisplay);
    card.appendChild(weatherEmoji);
    card.appendChild(tempDisplay);
    card.appendChild(descDisplay);
    card.appendChild(humidityDisplay);
    
    // Add weather details container
    const detailsContainer = createWeatherDetails(data);
    card.appendChild(detailsContainer);
}

// ===== CREATE WEATHER DETAILS =====
function createWeatherDetails(data) {
    const { wind, visibility, main: { pressure } } = data;
    
    const container = document.createElement("div");
    container.classList.add("weatherDetails");
    
    const details = [
        { label: "Wind Speed", value: `${wind?.speed || 0} m/s` },
        { label: "Pressure", value: `${pressure || 0} hPa` },
        { label: "Visibility", value: `${(visibility || 0) / 1000} km` }
    ];
    
    details.forEach(detail => {
        const div = document.createElement("div");
        div.classList.add("detail");
        
        const label = document.createElement("span");
        label.classList.add("label");
        label.textContent = detail.label;
        
        const value = document.createElement("span");
        value.classList.add("value");
        value.textContent = detail.value;
        
        div.appendChild(label);
        div.appendChild(value);
        container.appendChild(div);
    });
    
    return container;
}

// ===== UPDATE WEATHER BACKGROUND =====
function updateWeatherBackground(description) {
    const weatherMap = {
        'clear sky': 'clear',
        'sunny': 'clear',
        'few clouds': 'clouds',
        'scattered clouds': 'clouds',
        'broken clouds': 'clouds',
        'overcast clouds': 'clouds',
        'mist': 'clouds',
        'fog': 'clouds',
        'rain': 'rain',
        'light rain': 'rain',
        'moderate rain': 'rain',
        'heavy rain': 'rain',
        'shower rain': 'rain',
        'thunderstorm': 'thunderstorm',
        'snow': 'snow',
        'light snow': 'snow',
        'heavy snow': 'snow'
    };

    const weatherType = weatherMap[description] || 'clear';
    card.setAttribute('data-weather', weatherType);
}

// ===== GET WEATHER EMOJI =====
function getWeatherEmoji(weatherId) {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300):
            return "⛈️";
        case (weatherId >= 300 && weatherId < 400):
            return "🌦️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧️";
        case (weatherId >= 600 && weatherId < 700):
            return "❄️";
        case (weatherId >= 700 && weatherId < 800):
            return "💨";
        case (weatherId === 800):
            return "☀️";
        case (weatherId >= 801 && weatherId < 810):
            return "☁️";
        default:
            return "❓";
    }
}

// ===== INPUT ANIMATIONS =====
cityInput.addEventListener('focus', function() {
    this.style.transform = 'scale(1.02)';
    this.style.borderColor = 'rgba(100, 200, 255, 0.6)';
    this.style.boxShadow = '0 8px 40px rgba(100, 200, 255, 0.15)';
});

cityInput.addEventListener('blur', function() {
    this.style.transform = 'scale(1)';
    this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Press 'Escape' to clear error
    if (e.key === 'Escape') {
        const error = document.querySelector('.errorDisplay');
        if (error) {
            error.style.opacity = '0';
            error.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (error.parentNode) {
                    error.remove();
                    card.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Press 'Enter' to search (already handled by form)
    // Press 'Ctrl+Enter' to clear input
    if (e.key === 'Enter' && e.ctrlKey) {
        cityInput.value = '';
        cityInput.focus();
    }
});

// ===== DEMO: LOAD EXAMPLE CITY ON START =====
// Uncomment to load a default city
/*
window.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'London';
    weatherForm.dispatchEvent(new Event('submit'));
});
*/

// ===== EXPOSE CONTROLS TO CONSOLE FOR TESTING =====
console.log('Weather App Controls:');
console.log('  - animationController.bounceEmoji()');
console.log('  - animationController.highlightTemp()');
console.log('  - cityInput.value = "Tokyo"; weatherForm.dispatchEvent(new Event("submit"))');