import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiSearch, FiBook, FiExternalLink } from 'react-icons/fi';

const Knowledge = () => {
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop: '', category: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNews, setShowNews] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [filters, page]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12, published: true };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const [articlesRes, newsRes] = await Promise.all([
        api.get('/knowledge', { params }),
        api.get('/news', { params: { limit: 6, crop: filters.crop } }).catch(() => ({ data: { news: [] } }))
      ]);
      setArticles(articlesRes.data.articles || []);
      setTotalPages(articlesRes.data.pages || 1);
      setNews(newsRes.data.news || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Knowledge Base & News</h1>

      {/* Toggle News/Articles */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowNews(false)}
          className={`px-4 py-2 rounded-lg ${!showNews ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Articles
        </button>
        <button
          onClick={() => setShowNews(true)}
          className={`px-4 py-2 rounded-lg ${showNews ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Crop News
        </button>
      </div>

      {/* News Section */}
      {showNews && news.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Latest Crop News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=News'; }}
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 dark:text-white line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{item.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{item.source}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <FiExternalLink />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="disease">Disease</option>
              <option value="pest">Pest</option>
              <option value="nutrient">Nutrient</option>
              <option value="care">Care</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <input
              type="text"
              placeholder="Crop name..."
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {!showNews && loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : !showNews && articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No articles found</div>
      ) : !showNews ? (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article._id}
                to={`/knowledge/${article._id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <FiBook className="text-primary-600" />
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {article.content.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{article.crop || 'General'}</span>
                  <span>{article.views} views</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Knowledge;

