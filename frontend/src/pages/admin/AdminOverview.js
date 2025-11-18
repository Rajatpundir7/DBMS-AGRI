import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiUsers, FiPackage, FiSearch, FiBook, FiMessageSquare } from 'react-icons/fi';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats?.stats?.totalUsers || 0, color: 'blue' },
    { icon: FiPackage, label: 'Products', value: stats?.stats?.totalProducts || 0, color: 'green' },
    { icon: FiSearch, label: 'Diagnoses', value: stats?.stats?.totalDiagnoses || 0, color: 'purple' },
    { icon: FiBook, label: 'Articles', value: stats?.stats?.totalArticles || 0, color: 'orange' },
    { icon: FiMessageSquare, label: 'Posts', value: stats?.stats?.totalPosts || 0, color: 'pink' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="text-4xl text-gray-300" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Diagnoses</h2>
          <div className="space-y-3">
            {stats?.recentDiagnoses?.slice(0, 5).map(diagnosis => (
              <div key={diagnosis._id} className="border-b pb-3">
                <p className="font-semibold">{diagnosis.crop || 'Unknown'}</p>
                <p className="text-sm text-gray-600">
                  {diagnosis.userId?.name} • {new Date(diagnosis.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {stats?.recentUsers?.slice(0, 5).map(user => (
              <div key={user._id} className="border-b pb-3">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">
                  {user.email} • {user.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

