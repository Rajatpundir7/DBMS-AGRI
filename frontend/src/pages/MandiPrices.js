import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiDollarSign, FiTrendingUp, FiImage, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const MandiPrices = () => {
  const [cropName, setCropName] = useState('');
  const [prices, setPrices] = useState(null);
  const [majorCrops, setMajorCrops] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topCrops, setTopCrops] = useState([]);
  const [docxImages, setDocxImages] = useState([]);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    fetchMajorCropPrices();
    fetchTopCrops();
    fetchDocxImages();
  }, []);

  const fetchMajorCropPrices = async () => {
    try {
      const response = await api.get('/mandi/major-crops');
      setMajorCrops(response.data);
    } catch (error) {
      console.error('Error fetching major crop prices:', error);
    }
  };

  const fetchTopCrops = async () => {
    try {
      const res = await api.get('/mandi/top-crops?limit=10&sample=40');
      if (res.data && res.data.success) {
        setTopCrops(res.data.top.map(t => ({ name: t.crop, value: Number(t.averagePrice) })));
      }
    } catch (err) {
      console.error('Top crops error', err);
    }
  };

  const fetchDocxImages = async () => {
    try {
      const res = await api.get('/docx/images');
      if (res.data && res.data.success) setDocxImages(res.data.images || []);
    } catch (err) {
      console.warn('Could not fetch docx images', err.message || err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cropName.trim()) {
      toast.error('Please enter a crop name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/mandi/crop/${cropName}`);
      setPrices(response.data);
      if (!response.data.success || response.data.records.length === 0) {
        toast.info('No price data found for this crop. Try: Tomato, Wheat, Onion, etc.');
      }
    } catch (error) {
      toast.error('Failed to fetch mandi prices');
      setPrices(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (text, target = 'hi') => {
    try {
      setTranslating(true);
      const res = await api.post('/translate', { q: text, target });
      setTranslating(false);
      return res.data.translatedText;
    } catch (err) {
      setTranslating(false);
      toast.error('Translation failed');
      return text;
    }
  };

  const getImageForCrop = (cropName) => {
    if (!docxImages || docxImages.length === 0) return null;
    const lower = cropName.toLowerCase();
    for (const url of docxImages) {
      if (url.toLowerCase().includes(lower) || url.toLowerCase().includes(lower.split(' ')[0])) return url;
    }
    return docxImages[0] || null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-gradient dark:bg-none">
          Mandi Prices (Bazaar Daam)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Get latest market prices for your crops</p>
      </motion.div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 glass">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter crop name (e.g., Tomato, Wheat, Onion)"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <FiDollarSign />
            <span>{loading ? 'Loading...' : 'Search Prices'}</span>
          </button>
        </form>
      </div>

      {/* Specific Crop Prices */}
      {prices && prices.success && prices.records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 glass"
        >
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            {cropName} Prices (Date: {prices.dateUsed || prices.date})
          </h2>
          <div className="space-y-4">
            {prices.records.slice(0, 10).map((record, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-semibold dark:text-white">{record.market}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {record.state} • {record.district}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{record.modal_price} / Quintal
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Arrival: {record.arrival_date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Major Crop Prices */}
      {majorCrops && majorCrops.success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg glass"
        >
          <div className="flex items-center space-x-2 mb-4">
            <FiTrendingUp className="text-2xl text-primary-600 dark:text-primary-400" />
            <h2 className="text-2xl font-bold dark:text-white">
              Major Crop Prices (Date: {majorCrops.date})
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {majorCrops.crops.map((crop, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:scale-102 transform transition-transform duration-300"
              >
                <p className="font-semibold dark:text-white">{crop.crop}</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  ₹{crop.averagePrice.toFixed(2)} / Quintal
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Avg. of {crop.mandiCount} mandis
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top 10 Crops Chart */}
      <motion.div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-8 glass">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Top 10 Crops by Avg Price</h2>
          <div className="flex items-center gap-2">
            <button onClick={fetchTopCrops} className="px-3 py-1 bg-primary-600 text-white rounded">Refresh</button>
          </div>
        </div>
        <div style={{ height: 320 }}>
          {topCrops && topCrops.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCrops} layout="vertical" margin={{ top: 20, right: 20, left: 40, bottom: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Bar dataKey="value" fill="#f97316">
                  {topCrops.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={['#f97316', '#fb7185', '#60a5fa', '#34d399', '#f59e0b'][idx % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-500">No data available for top crops.</div>
          )}
        </div>
      </motion.div>

      {/* If specific crop prices show, include image on right and extra effects */}
      {prices && prices.success && prices.records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 glass"
        >
          <div className="flex gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                {cropName} Prices (Date: {prices.dateUsed || prices.date})
              </h2>
              <div className="space-y-4">
                {prices.records.slice(0, 10).map((record, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold dark:text-white">{record.market}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {record.state} • {record.district}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                          ₹{record.modal_price} / Quintal
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Arrival: {record.arrival_date}
                        </p>
                      </div>
                      <div className="w-20 h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                        {getImageForCrop(cropName) ? (
                          <img src={getImageForCrop(cropName)} alt={cropName} className="object-cover w-full h-full hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <FiImage className="text-3xl text-gray-400" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="w-64">
              <div className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg sticky top-28">
                <h3 className="font-semibold mb-2 dark:text-white">Quick Actions</h3>
                <button onClick={async () => { const t = await handleTranslate(cropName, 'hi'); toast.info(t); }} className="w-full mb-2 px-3 py-2 bg-primary-600 text-white rounded flex items-center gap-2">
                  <FiGlobe /> {translating ? 'Translating...' : 'Translate Crop'}
                </button>
                <button onClick={() => navigator.share ? navigator.share({ title: cropName, text: `Latest mandi prices for ${cropName}` }) : toast.info('Sharing not supported')} className="w-full px-3 py-2 border rounded flex items-center gap-2">
                  Share
                </button>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Effects: hover zoom, animated chart, gradient header, sticky quick actions, image shimmer.</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MandiPrices;

