import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiShoppingBag, FiSearch, FiBook, FiUsers, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <span>🌾</span>
            <span>Kisan Sewa Kendra</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-primary-200">
              <FiHome /> <span>Home</span>
            </Link>
            <Link to="/products" className="flex items-center space-x-1 hover:text-primary-200">
              <FiShoppingBag /> <span>Products</span>
            </Link>
            <Link to="/diagnosis" className="flex items-center space-x-1 hover:text-primary-200">
              <FiSearch /> <span>Diagnosis</span>
            </Link>
            <Link to="/knowledge" className="flex items-center space-x-1 hover:text-primary-200">
              <FiBook /> <span>Knowledge</span>
            </Link>
            <Link to="/community" className="flex items-center space-x-1 hover:text-primary-200">
              <FiUsers /> <span>Community</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center space-x-1 hover:text-primary-200">
                    <FiSettings /> <span className="hidden md:inline">Admin</span>
                  </Link>
                )}
                <Link to="/profile" className="flex items-center space-x-1 hover:text-primary-200">
                  <FiUser /> <span className="hidden md:inline">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-primary-200">
                  <FiLogOut /> <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200">Login</Link>
                <Link to="/register" className="bg-primary-700 px-4 py-2 rounded hover:bg-primary-800">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

