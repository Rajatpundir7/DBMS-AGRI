import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiDatabase, FiSearch, FiEdit, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminDatabase = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingDoc, setEditingDoc] = useState(null);
  const [editData, setEditData] = useState('');

  const collectionNames = [
    'users',
    'products',
    'diagnoses',
    'knowledgearticles',
    'communityposts',
    'userevents'
  ];

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionData();
    }
  }, [selectedCollection]);

  const fetchCollectionData = async () => {
    setLoading(true);
    try {
      const endpoint = `/admin/database/${selectedCollection}`;
      const response = await api.get(endpoint);
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/admin/database/${selectedCollection}/${id}`);
      toast.success('Document deleted');
      fetchCollectionData();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setEditData(JSON.stringify(doc, null, 2));
  };

  const handleSaveEdit = async () => {
    try {
      const updatedDoc = JSON.parse(editData);
      await api.put(`/admin/database/${selectedCollection}/${editingDoc._id}`, updatedDoc);
      toast.success('Document updated');
      setEditingDoc(null);
      fetchCollectionData();
    } catch (error) {
      toast.error('Failed to update document');
    }
  };

  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCollection}.csv`;
    a.click();
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(doc => Object.values(doc).join(','));
    return [headers, ...rows].join('\n');
  };

  const filteredData = data.filter(doc => {
    if (!search) return true;
    const searchStr = JSON.stringify(doc).toLowerCase();
    return searchStr.includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center space-x-2">
          <FiDatabase /> <span>Database Management</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        {collectionNames.map(collection => (
          <motion.button
            key={collection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCollection(collection)}
            className={`p-4 rounded-lg shadow-lg transition-all ${
              selectedCollection === collection
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="text-sm font-semibold capitalize">{collection}</div>
          </motion.button>
        ))}
      </div>

      {selectedCollection && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold capitalize">{selectedCollection}</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiDownload /> <span>Export CSV</span>
              </button>
              <button
                onClick={fetchCollectionData}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.slice(0, 50).map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                        {doc._id.substring(0, 24)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <pre className="text-xs max-w-md overflow-hidden">
                          {JSON.stringify(doc, null, 2).substring(0, 200)}...
                        </pre>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {Math.min(filteredData.length, 50)} of {filteredData.length} documents
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Document</h2>
            <textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              rows={20}
              className="w-full font-mono text-sm border rounded-lg p-4 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setEditingDoc(null)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDatabase;

