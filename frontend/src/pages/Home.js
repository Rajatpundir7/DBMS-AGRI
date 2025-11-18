import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiBook, FiUsers, FiArrowRight, FiMap, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { IMAGE_BASE_URL } from '../utils/constants';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cropPrices, setCropPrices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, articlesRes, postsRes, pricesRes] = await Promise.all([
        api.get('/products?limit=6'),
        api.get('/knowledge?limit=3'),
        api.get('/community?limit=3'),
        api.get('/mandi/major-crops').catch(() => ({ data: { crops: [] } }))
      ]);
      setProducts(productsRes.data.products || []);
      setArticles(articlesRes.data.articles || []);
      setPosts(postsRes.data.posts || []);
      setCropPrices(pricesRes.data.crops || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div 
      className="page-background"
      style={{
        backgroundImage: 'url(/bg-farm.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="page-background-overlay min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative text-white py-24 overflow-hidden"
        style={{
          backgroundImage: 'url(/imag.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
              {user ? `Welcome back, ${user.name}! 👋` : 'Welcome to Kisan Sewa Kendra'}
            </h1>
            <p className="text-xl mb-8 text-primary-100">Your Intelligent Agricultural Advisor & E-Store</p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/diagnosis" className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 flex items-center space-x-2 shadow-lg">
                  <FiSearch /> <span>AI Crop Diagnosis</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/products" className="bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-900 flex items-center space-x-2 shadow-lg">
                  <FiShoppingBag /> <span>Browse Products</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/map" className="bg-primary-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-900 flex items-center space-x-2 shadow-lg">
                  <FiMap /> <span>Disease Map</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      {/* Crop Prices Section */}
      {cropPrices.length > 0 && (
        <section 
          className="py-16 relative"
          style={{
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-90"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold dark:text-white flex items-center space-x-2">
                <FiDollarSign className="text-primary-600" />
                <span>Latest Crop Prices (Mandi)</span>
              </h2>
              <Link to="/mandi-prices" className="text-primary-600 hover:text-primary-800 flex items-center space-x-2">
                <span>View All Prices</span> <FiArrowRight />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cropPrices.slice(0, 5).map((crop, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-l-4 border-primary-600"
                >
                  <h3 className="font-semibold text-sm mb-2 dark:text-white">{crop.crop}</h3>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{crop.averagePrice.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per Quintal</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900 relative z-10">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary-600 to-green-600 bg-clip-text text-transparent"
          >
            Our Features
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: FiSearch, title: 'AI Diagnosis', desc: 'Upload crop images for instant disease and pest detection' },
              { icon: FiShoppingBag, title: 'E-Store', desc: 'Browse and purchase pesticides, fertilizers, and more' },
              { icon: FiBook, title: 'Knowledge Base', desc: 'Learn about crop diseases, pests, and treatments' },
              { icon: FiUsers, title: 'Community', desc: 'Connect with farmers and experts for advice' }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all bg-white dark:bg-gray-800"
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-3xl text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Section */}
      {products.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link to="/products" className="text-primary-600 hover:text-primary-800 flex items-center space-x-2">
                <span>View All</span> <FiArrowRight />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
              {products.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
                  {product.image && (
                    <img 
                      src={product.image.startsWith('http') ? product.image : `${IMAGE_BASE_URL}${product.image}`} 
                      alt={product.title} 
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
                  <p className="text-primary-600 font-bold">₹{product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Knowledge & Community Section */}
      <section className="py-16 bg-white dark:bg-gray-900 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Latest Articles</h2>
                <Link to="/knowledge" className="text-primary-600 hover:text-primary-800 flex items-center space-x-2">
                  <span>View All</span> <FiArrowRight />
                </Link>
              </div>
              <div className="space-y-4">
                {articles.map(article => (
                  <Link key={article._id} to={`/knowledge/${article._id}`} className="block p-4 border rounded-lg hover:shadow transition">
                    <h3 className="font-semibold mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-600">{article.crop} • {article.views} views</p>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Community Posts</h2>
                <Link to="/community" className="text-primary-600 hover:text-primary-800 flex items-center space-x-2">
                  <span>View All</span> <FiArrowRight />
                </Link>
              </div>
              <div className="space-y-4">
                {posts.map(post => (
                  <Link key={post._id} to={`/community/${post._id}`} className="block p-4 border rounded-lg hover:shadow transition">
                    <p className="text-sm mb-2">{post.body.substring(0, 100)}...</p>
                    <p className="text-xs text-gray-600">{post.crop} • {post.replies?.length || 0} replies</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;

