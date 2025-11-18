import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiMapPin, FiPhone, FiMail, FiClock, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import MapView from '../components/MapView';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.shops || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const isShopOpen = (shop) => {
    const today = getCurrentDay();
    const timing = shop.timings[today];
    if (timing.closed) return false;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= timing.open && currentTime <= timing.close;
  };

  const mapMarkers = shops
    .filter(shop => shop.location?.latitude && shop.location?.longitude)
    .map(shop => ({
      position: [shop.location.latitude, shop.location.longitude],
      popupContent: (
        <div>
          <h4 className="font-bold">{shop.name}</h4>
          <p className="text-sm">{shop.address}</p>
          <p className="text-sm text-gray-600">{shop.phone}</p>
        </div>
      ),
    }));

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Our Shops</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find our physical stores and their timings
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Shops List */}
        <div>
          {loading ? (
            <div className="text-center py-12 dark:text-white">Loading shops...</div>
          ) : shops.length > 0 ? (
            <div className="space-y-6">
              {shops.map((shop, idx) => (
                <motion.div
                  key={shop._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 glass"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold dark:text-white mb-2">{shop.name}</h3>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                        <FiMapPin />
                        <span>{shop.address}</span>
                      </div>
                      {shop.phone && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                          <FiPhone />
                          <span>{shop.phone}</span>
                        </div>
                      )}
                      {shop.email && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <FiMail />
                          <span>{shop.email}</span>
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isShopOpen(shop) 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {isShopOpen(shop) ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-semibold mb-3 dark:text-white flex items-center space-x-2">
                      <FiClock />
                      <span>Timings</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(shop.timings).map(([day, timing]) => (
                        <div
                          key={day}
                          className={`flex justify-between ${
                            timing.closed ? 'text-gray-400 dark:text-gray-600' : 'dark:text-gray-300'
                          }`}
                        >
                          <span className="capitalize">{day}:</span>
                          <span>
                            {timing.closed ? (
                              <span className="text-red-500 flex items-center space-x-1">
                                <FiX />
                                <span>Closed</span>
                              </span>
                            ) : (
                              `${timing.open} - ${timing.close}`
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 dark:text-white">
              <p>No shops found. Contact admin to add shop locations.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="sticky top-24">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {shops.length > 0 ? (
              <MapView diagnoses={[]} showHeatmap={false} />
            ) : (
              <div className="flex items-center justify-center h-full dark:text-white">
                <p>No shop locations available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shops;

