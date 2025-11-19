import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { IMAGE_BASE_URL } from '../utils/constants';
import pesticideImages from '../data/pesticideImages';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', crop: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 20 };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const response = await api.get('/products', { params });
      const raw = response.data.products || [];
      // Assign pesticide images in ascending order for products without images
      const pesticideCategories = new Set(['insecticide', 'fungicide', 'herbicide', 'growth-regulator', 'pesticide']);
      let pIndex = 0;
      const augmented = raw.map(p => {
        const copy = { ...p };
        if ((!copy.image || copy.image === '') && pesticideCategories.has((copy.category || '').toLowerCase())) {
          // find next non-empty pesticide image
          while (pIndex < pesticideImages.length && !pesticideImages[pIndex]) pIndex += 1;
          if (pIndex < pesticideImages.length) {
            copy.image = pesticideImages[pIndex];
            pIndex += 1;
          }
        }
        return copy;
      });
      setProducts(augmented);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-4xl font-bold mb-8 dark:text-white">Products</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 glass">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="insecticide">Insecticide</option>
              <option value="fungicide">Fungicide</option>
              <option value="herbicide">Herbicide</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="growth-regulator">Growth Regulator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop</label>
            <input
              type="text"
              placeholder="Crop name..."
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={filters.crop}
              onChange={(e) => {
                setFilters({ ...filters, crop: e.target.value });
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 dark:text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No products found</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-4"
              >
                {product.image ? (
                  <img
                    src={product.image.startsWith('http') ? product.image : `${IMAGE_BASE_URL}${product.image}`}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded mb-3"
                    onError={(e) => { 
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-2 dark:text-white">{product.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.composition}</p>
                <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">₹{product.price}</p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 dark:text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
