import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiMessageSquare, FiThumbsUp } from 'react-icons/fi';
import { IMAGE_BASE_URL } from '../utils/constants';

const Community = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ crop: '', search: '', status: 'active' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ body: '', crop: '', images: [] });

  useEffect(() => {
    fetchPosts();
  }, [filters, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const response = await api.get('/community', { params });
      setPosts(response.data.posts || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('body', newPost.body);
      formData.append('crop', newPost.crop);
      newPost.images.forEach((img) => {
        formData.append('images', img);
      });

      await api.post('/community', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({ body: '', crop: '', images: [] });
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Create Post
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
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

      {/* Posts */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No posts found</div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map(post => (
              <Link
                key={post._id}
                to={`/community/${post._id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{post.authorId?.name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                      {post.crop && ` • ${post.crop}`}
                    </p>
                  </div>
                  {post.status && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      post.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {post.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3 line-clamp-3">{post.body}</p>
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {post.imageUrls.slice(0, 3).map((url, idx) => (
                      <img
                        key={idx}
                        src={`${IMAGE_BASE_URL}${url}`}
                        alt={`Post image ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FiMessageSquare /> <span>{post.replies?.length || 0} replies</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiThumbsUp /> <span>{post.upvotes || 0}</span>
                  </div>
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
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newPost.crop}
                  onChange={(e) => setNewPost({ ...newPost, crop: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question/Post</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newPost.body}
                  onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setNewPost({ ...newPost, images: Array.from(e.target.files) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;

