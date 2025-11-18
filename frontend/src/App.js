import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import EnhancedNavbar from './components/EnhancedNavbar';
import AIChatbot from './components/AIChatbot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Diagnosis from './pages/Diagnosis';
import Knowledge from './pages/Knowledge';
import KnowledgeDetail from './pages/KnowledgeDetail';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import DiseaseMap from './pages/DiseaseMap';
import DiseaseImages from './pages/DiseaseImages';
import Weather from './pages/Weather';
import MandiPrices from './pages/MandiPrices';
import Shops from './pages/Shops';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div 
              className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors"
              style={{
                backgroundImage: 'url(/bg-farm.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="min-h-screen" style={{ 
                backgroundColor: 'rgba(249, 250, 251, 0.95)'
              }}>
              <EnhancedNavbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/diagnosis" element={<PrivateRoute><Diagnosis /></PrivateRoute>} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
                <Route path="/community" element={<Community />} />
                <Route path="/community/:id" element={<CommunityPost />} />
                  <Route path="/map" element={<DiseaseMap />} />
                  <Route path="/disease-images" element={<DiseaseImages />} />
                  <Route path="/weather" element={<Weather />} />
                  <Route path="/mandi-prices" element={<MandiPrices />} />
                  <Route path="/shops" element={<Shops />} />
                <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <AIChatbot />
              <ToastContainer position="top-right" autoClose={3000} />
              </div>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

