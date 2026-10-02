// Get HTML elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const errorMessage = document.getElementById("errorMessage");
const loadingMessage = document.getElementById("loadingMessage");


// Fetch weather when the Search button is clicked
searchBtn.addEventListener("click", getWeather);


// Also allow the user to press Enter
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});


// Main weather function
async function getWeather() {

    const city = cityInput.value.trim();

    // Check if the input is empty
    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    // Clear previous messages
    errorMessage.textContent = "";
    loadingMessage.textContent = "Loading weather data...";

    try {

        // --------------------------------
        // STEP 1: Find the city coordinates
        // --------------------------------

        const geocodingURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const locationResponse = await fetch(geocodingURL);

        if (!locationResponse.ok) {
            throw new Error("Unable to connect to the location service.");
        }

        const locationData = await locationResponse.json();

        // Check whether the city was found
        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found. Please enter a valid city name.");
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const foundCity = location.name;
        const country = location.country;


        // --------------------------------
        // STEP 2: Get weather information
        // --------------------------------

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather information.");
        }

        const weatherData = await weatherResponse.json();


        // --------------------------------
        // STEP 3: Extract weather data
        // --------------------------------

        const currentWeather = weatherData.current;

        const currentTemperature = currentWeather.temperature_2m;
        const currentHumidity = currentWeather.relative_humidity_2m;
        const currentWindSpeed = currentWeather.wind_speed_10m;


        // --------------------------------
        // STEP 4: Display the information
        // --------------------------------

        cityName.textContent = `${foundCity}, ${country}`;

        temperature.textContent = currentTemperature;
        humidity.textContent = currentHumidity;
        windSpeed.textContent = currentWindSpeed;


        // Clear loading message
        loadingMessage.textContent = "";

    } catch (error) {

        console.error("Weather error:", error);

        loadingMessage.textContent = "";

        showError(error.message);
    }
}


// Display an error message
function showError(message) {

    errorMessage.textContent = `❌ ${message}`;

    // Reset weather information
    cityName.textContent = "City Name";
    temperature.textContent = "--";
    humidity.textContent = "--";
    windSpeed.textContent = "--";
}