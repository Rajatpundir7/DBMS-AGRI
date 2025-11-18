import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiTrash2 } from 'react-icons/fi';

const AdminCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [filters, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 20 };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const response = await api.get('/admin/community-posts', { params });
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId, newStatus) => {
    try {
      await api.put(`/community/${postId}/status`, { status: newStatus });
      toast.success('Post status updated');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/community/${postId}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Community Posts Management</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full md:w-64 px-4 py-2 border rounded-lg"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{post.authorId?.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                    {post.crop && ` • ${post.crop}`}
                  </p>
                </div>
                <select
                  value={post.status}
                  onChange={(e) => handleStatusChange(post._id, e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <p className="text-gray-700 mb-3">{post.body}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {post.replies?.length || 0} replies • {post.upvotes || 0} upvotes
                </div>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommunity;

