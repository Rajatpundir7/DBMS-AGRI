const axios = require('axios');

// Weather API Service using OpenWeatherMap
class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || 'c3cfb0e15ee0c4eb0bc9913e3cbfaa94';
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  }

  async getWeatherData(city) {
    try {
      if (!this.apiKey) {
        throw new Error('Weather API key not configured');
      }

      const params = {
        q: city,
        appid: this.apiKey,
        units: 'metric'
      };

      const response = await axios.get(this.apiUrl, { params });
      
      if (response.data.cod === 404) {
        throw new Error(`City '${city}' not found`);
      }

      const data = response.data;
      
      return {
        success: true,
        location: `${data.name}, ${data.sys.country}`,
        condition: data.weather[0].description,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Weather API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new WeatherService();

