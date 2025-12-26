# Weather App

A weather dashboard that uses the OpenWeatherMap API to provide real-time weather data and 5-day forecasts.


## Features

- **Dynamic Weather Search** Fetch current weather data for any city globally using the OpenWeatherMap API.
- **Geolocation Support** Automatically detects the user's current location to provide local weather updates.
- **Comprehensive Data** Displays temperature, "Feels Like" conditions, humidity, and wind speed.
- **5-Day Forecast** A dedicated section that loops through API data to show the weather outlook for the coming week.


## How to Run

- Open `index.html` directly in your browser, or
- From the main hub (`index.html` in the root), click the **Weather App** button.


## Keyboard Shortcuts

| Key   |                                                     Action    |
|------ |                                ------------------------------ |
| Enter |     Triggers the weather search when the input field is active|


## Technical Implementation

Atmospheric Effects
The app uses a custom particle system to simulate weather conditions:

- **Rain** Uses @keyframes rainFall and createRainSplashes() to provide an immersive experience.
- **Sun** Features a glowing radial gradient sun with a pulse animation in the sunny theme.
- **Clouds** Implements a float animation that moves clouds horizontally across the viewport at random durations.

## Files

- `index.html`- Contains the search bar, current weather card, and the forecast grid.
- `style.css`- Defines the color palette.
- `script.js`- Manages the `fetch` requests to the weather API, DOM manipulation, and geolocation logic.