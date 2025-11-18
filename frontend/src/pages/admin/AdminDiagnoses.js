import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiEye } from 'react-icons/fi';

const AdminDiagnoses = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop: '', status: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDiagnoses();
  }, [filters, page]);

  const fetchDiagnoses = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 20 };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const response = await api.get('/admin/diagnoses', { params });
      setDiagnoses(response.data.diagnoses || []);
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Diagnoses Management</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <input
              type="text"
              placeholder="Filter by crop..."
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Results</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {diagnoses.map(diagnosis => (
                <tr key={diagnosis._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {diagnosis.userId?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {diagnosis.crop || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {diagnosis.results?.length > 0 ? (
                      <div>
                        {diagnosis.results[0].label} ({diagnosis.results[0].confidence}%)
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(diagnosis.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' :
                      diagnosis.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {diagnosis.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDiagnoses;

