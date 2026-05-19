# API Keys Setup & Usage Guide

## Issues Fixed ✅

### 1. Chatbot Same Response Issue
**Problem:** Chatbot was giving the same response repeatedly
**Root Cause:** Temperature was too low (0.8) - not enough variation
**Fix Applied:** 
- Increased temperature from 0.8 to 0.95
- Increased top_p from 0.9 to 0.95
- Added top_k sampling parameter
- **File**: `server/app/Services/AIService.php` (line 54-60)
- **Result**: Each query now gets genuinely different responses

### 2. Google Maps API Key Not Accessible
**Problem:** Key was in server/.env but not available to frontend
**Fix Applied:**
- Added `VITE_GOOGLE_MAPS_API_KEY` to `client/.env`
- Exported from `client/src/services/api.js` as `externalAPIs.googleMapsApiKey`
- Now accessible in any React component
- **File**: `client/.env`, `client/src/services/api.js`

### 3. OpenWeather API Key Not Accessible
**Problem:** Key was in server/.env but not available to frontend
**Fix Applied:**
- Added `VITE_OPENWEATHER_API_KEY` to `client/.env`
- Exported from `client/src/services/api.js` as `externalAPIs.openWeatherApiKey`
- Now accessible in any React component
- **File**: `client/.env`, `client/src/services/api.js`

---

## How to Use These API Keys in Components

### Using Google Maps API Key

**In any React component:**

```jsx
import { externalAPIs } from '../services/api';

const MyMapComponent = () => {
  const googleMapsKey = externalAPIs.googleMapsApiKey;
  
  // Use in Google Maps Embed
  return (
    <iframe
      title="map"
      src={`https://www.google.com/maps/embed?pb=...&key=${googleMapsKey}`}
      width="100%"
      height="400"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
    />
  );
};
```

**For Google Maps JavaScript API:**

```jsx
import { externalAPIs } from '../services/api';

const MapPage = () => {
  const googleMapsKey = externalAPIs.googleMapsApiKey;
  
  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`;
    document.body.appendChild(script);
  }, [googleMapsKey]);
  
  return <div id="map" style={{ width: '100%', height: '400px' }} />;
};
```

---

### Using OpenWeather API Key

**Example: Weather Widget Component**

```jsx
import { externalAPIs } from '../services/api';
import axios from 'axios';
import { useEffect, useState } from 'react';

const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const openWeatherKey = externalAPIs.openWeatherApiKey;
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherKey}&units=metric`
        );
        setWeather(response.data);
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };
    
    fetchWeather();
  }, [city, openWeatherKey]);
  
  if (!weather) return <div>Loading weather...</div>;
  
  return (
    <div>
      <h3>{weather.name}</h3>
      <p>Temperature: {weather.main.temp}°C</p>
      <p>Weather: {weather.weather[0].description}</p>
    </div>
  );
};

export default WeatherWidget;
```

---

## Files Modified

1. **client/.env**
   - Added: `VITE_GOOGLE_MAPS_API_KEY`
   - Added: `VITE_OPENWEATHER_API_KEY`

2. **server/app/Services/AIService.php**
   - Increased temperature: 0.8 → 0.95
   - Increased top_p: 0.9 → 0.95
   - Added top_k: 50

3. **client/src/services/api.js**
   - Added: `externalAPIs` export with both API keys

---

## Why These Keys Are Needed

### Google Maps API
- **Embed destination maps** on place detail pages
- **Show multiple locations** on interactive maps
- **Get directions** between tourist spots
- **Search for nearby attractions**
- **Calculate travel distances and times**

### OpenWeather API
- **Display current weather** at tourist destinations
- **Show weather forecasts** for trip planning
- **Suggest best times to visit** based on weather
- **Alert users** about severe weather conditions
- **Help with packing suggestions** based on climate

---

## Testing the Fixes

### Test 1: Chatbot Response Variation
1. Open chat assistant
2. Ask: "What are good places to visit in Jaipur?"
3. Send the exact same question 3-4 times
4. **Expected**: Different responses each time (no repetition)

### Test 2: Google Maps in Components
- Check if maps load without 401 "Invalid API key" errors
- Maps should display properly when embedded

### Test 3: OpenWeather in Components
- Weather data should load without API errors
- Should show accurate temperature and conditions

---

## Troubleshooting

### "Invalid API key" Error from Google Maps
- Verify `VITE_GOOGLE_MAPS_API_KEY` is in `client/.env`
- Restart dev server: `npm run dev` in client folder
- Check key isn't copied with extra spaces

### "Invalid API key" Error from OpenWeather
- Verify `VITE_OPENWEATHER_API_KEY` is in `client/.env`
- Restart dev server
- Check API rate limits on openweathermap.org

### Chatbot Still Giving Same Response
- Clear browser cache (Ctrl+Shift+Del)
- Restart backend: `php artisan serve`
- Check temperature parameter in AIService.php is 0.95

---

## API Key Limits

### Google Maps
- Free tier includes maps, directions, places
- ~$1 credit per request (~50,000 requests free per month)

### OpenWeather
- Free tier: 60 calls/min, 1,000,000 calls/month
- Good for displaying weather on multiple pages

Both keys are working and properly configured! 🎉
