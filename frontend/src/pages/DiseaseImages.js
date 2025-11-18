import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiSearch, FiImage, FiDownload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DiseaseImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({ crop: '', disease: '' });
  const [selectedCrop, setSelectedCrop] = useState('');

  const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Tomato'];
  const diseases = ['Blast', 'Brown Spot', 'Leaf Blight', 'Rust', 'Powdery Mildew'];

  const handleSearch = async () => {
    if (!searchParams.crop || !searchParams.disease) {
      alert('Please select both crop and disease');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/disease-images/search', {
        params: {
          crop: searchParams.crop,
          disease: searchParams.disease,
          limit: 10
        }
      });
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching disease images:', error);
      alert('Error fetching disease images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelect = async (crop) => {
    setSelectedCrop(crop);
    setLoading(true);
    try {
      const response = await api.get(`/disease-images/crop/${crop}`, {
        params: { limit: 20 }
      });
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching crop images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Disease Image Gallery</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse disease images for different crops using AI-powered search
        </p>
      </motion.div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 glass">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Search Disease Images</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Crop
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchParams.crop}
              onChange={(e) => setSearchParams({ ...searchParams, crop: e.target.value })}
            >
              <option value="">Choose crop...</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Disease
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchParams.disease}
              onChange={(e) => setSearchParams({ ...searchParams, disease: e.target.value })}
            >
              <option value="">Choose disease...</option>
              {diseases.map(disease => (
                <option key={disease} value={disease}>{disease}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FiSearch />
              <span>{loading ? 'Searching...' : 'Search Images'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crop Quick Select */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Quick Browse by Crop</h3>
        <div className="flex flex-wrap gap-2">
          {crops.map(crop => (
            <button
              key={crop}
              onClick={() => handleCropSelect(crop)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCrop === crop
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-12 dark:text-white">Loading images...</div>
      ) : images.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden glass"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={image.url}
                  alt={image.description || `${image.crop} ${image.diseaseName}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
                {image.source === 'rag' && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    AI
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm mb-1 dark:text-white">
                  {image.crop} - {image.diseaseName}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {image.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 dark:text-white">
          <FiImage className="mx-auto text-6xl text-gray-400 mb-4" />
          <p>No images found. Try searching for a specific crop and disease.</p>
        </div>
      )}
    </div>
  );
};

export default DiseaseImages;

