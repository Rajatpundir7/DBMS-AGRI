import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import { FiFilter, FiMap } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DiseaseMap = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop: '', disease: '' });
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    fetchDiagnoses();
  }, [filters]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filters.crop) params.crop = filters.crop;
      const response = await api.get('/diagnosis', { params });
      const fetchedDiagnoses = response.data.diagnoses || [];
      setDiagnoses(fetchedDiagnoses);
      
      // Update map center based on diagnoses if available
      if (fetchedDiagnoses.length > 0) {
        const withLocation = fetchedDiagnoses.filter(d => d.location?.latitude && d.location?.longitude);
        if (withLocation.length > 0) {
          const avgLat = withLocation.reduce((sum, d) => sum + d.location.latitude, 0) / withLocation.length;
          const avgLng = withLocation.reduce((sum, d) => sum + d.location.longitude, 0) / withLocation.length;
          // Center will be updated in MapView component
        }
      }
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent">
          Disease Heatmap
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive map showing crop disease outbreaks and diagnosis locations
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <FiFilter /> <span>Filters</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Crop Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rice, Wheat"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={filters.crop}
                  onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Disease
                </label>
                <input
                  type="text"
                  placeholder="e.g., Blast, Blight"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  value={filters.disease}
                  onChange={(e) => setFilters({ ...filters, disease: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="heatmap"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="heatmap" className="text-sm text-gray-700 dark:text-gray-300">
                  Show Heatmap
                </label>
              </div>

              <button
                onClick={() => setFilters({ crop: '', disease: '' })}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Diagnoses</span>
                  <span className="font-semibold">{diagnoses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Locations</span>
                  <span className="font-semibold">
                    {new Set(diagnoses.map(d => `${d.location?.latitude}_${d.location?.longitude}`).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {loading ? (
              <LoadingSpinner size="lg" text="Loading map data..." />
            ) : (
              <MapView diagnoses={diagnoses} showHeatmap={showHeatmap} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseMap;

