const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');

// Get weather data for a city
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const weatherData = await weatherService.getWeatherData(city);
    
    if (weatherData.success) {
      res.json(weatherData);
    } else {
      res.status(404).json(weatherData);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching weather data', 
      error: error.message 
    });
  }
});

module.exports = router;

