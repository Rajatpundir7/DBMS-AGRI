import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiUpload, FiImage } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../utils/constants';

const Diagnosis = () => {
  const [images, setImages] = useState([]);
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });
      formData.append('crop', crop);

      const response = await api.post('/diagnosis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      toast.success('Diagnosis completed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Diagnosis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">AI Crop Diagnosis</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Upload crop images to get AI-powered disease diagnosis using Gemini AI. Results will be in Hinglish for easy understanding.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 glass">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Upload Crop Images</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Crop Type (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Rice, Wheat, Cotton"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-gray-600">Click to upload images</span>
                </label>
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{images.length} image(s) selected</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {images.map((img, idx) => (
                        <span key={idx} className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          {img.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Start Diagnosis'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 glass">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Diagnosis Results</h2>
          {result ? (
            <div className="space-y-4">
              {result.results && result.results.map((res, idx) => (
                <div key={idx} className="border-l-4 border-primary-600 pl-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg dark:text-white">{res.label}</h3>
                      {res.source === 'gemini' && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          AI Powered
                        </span>
                      )}
                    </div>
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded text-sm">
                      {res.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Type: {res.diseaseType || 'disease'}
                  </p>
                  {res.fullDiagnosis && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-sm font-semibold dark:text-white mb-1">Full Diagnosis (Hinglish):</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{res.fullDiagnosis}</p>
                    </div>
                  )}
                  {res.treatment && (
                    <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900 rounded">
                      <p className="text-sm font-semibold dark:text-white mb-1">Recommendation:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{res.treatment}</p>
                    </div>
                  )}
                </div>
              ))}

              {result.recommendedProducts && result.recommendedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-xl mb-3 dark:text-white">Recommended Products</h3>
                  <div className="space-y-3">
                    {result.recommendedProducts.map((product) => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="block border dark:border-gray-600 rounded-lg p-3 hover:shadow transition bg-white dark:bg-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          {product.image ? (
                            <img
                              src={product.image.startsWith('http') ? product.image : `${IMAGE_BASE_URL}${product.image}`}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-400">No Img</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold dark:text-white">{product.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.composition}</p>
                            <p className="text-primary-600 dark:text-primary-400 font-bold">₹{product.price}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FiImage className="text-5xl mx-auto mb-4" />
              <p>Upload images to get diagnosis results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;

