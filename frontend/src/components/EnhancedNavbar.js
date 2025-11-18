import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiHome, FiShoppingBag, FiSearch, FiBook, FiUsers, FiUser, FiLogOut, FiSettings, FiMoon, FiSun, FiMenu, FiX, FiImage, FiMap, FiCloud, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedNavbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/products', icon: FiShoppingBag, label: 'Products' },
    { path: '/diagnosis', icon: FiSearch, label: 'Diagnosis' },
    { path: '/knowledge', icon: FiBook, label: 'Knowledge' },
    { path: '/community', icon: FiUsers, label: 'Community' },
    { path: '/map', icon: FiMap, label: 'Disease Map' },
    { path: '/disease-images', icon: FiImage, label: 'Disease Images' },
    { path: '/weather', icon: FiCloud, label: 'Weather' },
    { path: '/mandi-prices', icon: FiDollarSign, label: 'Mandi Prices' },
    { path: '/shops', icon: FiMapPin, label: 'Shops' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg'
          : 'bg-primary-600'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <img 
              src="/ipl_logo.webp" 
              alt="Logo" 
              className="h-8 w-8 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ display: 'none' }}
            />
            <span className="text-2xl">🌾</span>
            <span className={scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}>
              Kisan Sewa Kendra
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 transition-colors ${
                    scrolled
                      ? isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                      : isActive
                      ? 'text-primary-200'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  <Icon /> <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-white hover:bg-primary-700'
              }`}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`hidden md:flex items-center space-x-1 transition-colors ${
                      scrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                        : 'text-white hover:text-primary-200'
                    }`}
                  >
                    <FiSettings /> <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`hidden md:flex items-center space-x-1 transition-colors ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  <FiUser /> <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className={`hidden md:flex items-center space-x-1 transition-colors ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  <FiLogOut /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden md:block transition-colors ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`hidden md:block px-4 py-2 rounded-lg transition-colors ${
                    scrolled
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-primary-700 text-white hover:bg-primary-800'
                  }`}
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                scrolled
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon /> <span>{item.label}</span>
                  </Link>
                );
              })}
              {user && (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiSettings /> <span>Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiUser /> <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiLogOut /> <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default EnhancedNavbar;

