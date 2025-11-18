import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiHome, FiPackage, FiUsers, FiSearch, FiBook, FiMessageSquare, FiBarChart, FiSettings } from 'react-icons/fi';
import AdminOverview from './admin/AdminOverview';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';
import AdminDiagnoses from './admin/AdminDiagnoses';
import AdminKnowledge from './admin/AdminKnowledge';
import AdminCommunity from './admin/AdminCommunity';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminDatabase from './admin/AdminDatabase';

const AdminDashboard = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Overview' },
    { path: '/admin/products', icon: FiPackage, label: 'Products' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/diagnoses', icon: FiSearch, label: 'Diagnoses' },
    { path: '/admin/knowledge', icon: FiBook, label: 'Knowledge' },
    { path: '/admin/community', icon: FiMessageSquare, label: 'Community' },
    { path: '/admin/analytics', icon: FiBarChart, label: 'Analytics' },
    { path: '/admin/database', icon: FiSettings, label: 'Database' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary-600">Admin Dashboard</h2>
        </div>
        <nav className="p-4">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon /> <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/products/*" element={<AdminProducts />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/diagnoses" element={<AdminDiagnoses />} />
          <Route path="/knowledge/*" element={<AdminKnowledge />} />
          <Route path="/community" element={<AdminCommunity />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="/database" element={<AdminDatabase />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

