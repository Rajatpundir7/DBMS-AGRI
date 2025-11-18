import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiCloud, FiThermometer, FiDroplet, FiWind } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/weather/${city}`);
      if (response.data.success) {
        setWeather(response.data);
      } else {
        toast.error(response.data.error || 'City not found');
        setWeather(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Weather Information</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get current weather conditions for your city
        </p>
      </motion.div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 glass">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter city name (e.g., Agra, Delhi)"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <FiCloud />
            <span>{loading ? 'Loading...' : 'Get Weather'}</span>
          </button>
        </form>
      </div>

      {/* Weather Display */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg glass"
        >
          <h2 className="text-2xl font-bold mb-6 dark:text-white">{weather.location}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full">
                <FiThermometer className="text-3xl text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                <p className="text-2xl font-bold dark:text-white">{weather.temperature}°C</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                <FiCloud className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                <p className="text-2xl font-bold dark:text-white capitalize">{weather.condition}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <FiDroplet className="text-3xl text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                <p className="text-2xl font-bold dark:text-white">{weather.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
                <FiWind className="text-3xl text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                <p className="text-2xl font-bold dark:text-white">{weather.windSpeed} m/s</p>
              </div>
            </div>
          </div>

          {weather.icon && (
            <div className="mt-6 text-center">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.condition}
                className="mx-auto"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Weather;

