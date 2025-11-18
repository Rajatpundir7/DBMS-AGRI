import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiThumbsUp, FiCheckCircle } from 'react-icons/fi';
import { IMAGE_BASE_URL } from '../utils/constants';

const CommunityPost = () => {
  const { id } = useParams();
  const { isAuthenticated, isExpert } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/community/${id}`);
      setPost(response.data);
    } catch (error) {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to reply');
      return;
    }

    try {
      await api.post(`/community/${id}/replies`, { body: replyText });
      toast.success('Reply posted!');
      setReplyText('');
      fetchPost();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      await api.post(`/community/${id}/upvote`);
      fetchPost();
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleVerifyReply = async (replyId) => {
    try {
      await api.post(`/community/${id}/replies/${replyId}/verify`);
      toast.success('Reply verified!');
      fetchPost();
    } catch (error) {
      toast.error('Failed to verify reply');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{post.authorId?.name || 'Anonymous'}</h2>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
              {post.crop && ` • ${post.crop}`}
            </p>
          </div>
          <button
            onClick={handleUpvote}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FiThumbsUp /> <span>{post.upvotes || 0}</span>
          </button>
        </div>
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.body}</p>
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {post.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={`${IMAGE_BASE_URL}${url}`}
                alt={`Post image ${idx + 1}`}
                className="w-full h-64 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">
          Replies ({post.replies?.length || 0})
        </h3>
        <div className="space-y-4">
          {post.replies && post.replies.map((reply) => (
            <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{reply.authorId?.name || 'Anonymous'}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(reply.createdAt).toLocaleDateString()}
                    {reply.isVerified && (
                      <span className="ml-2 text-green-600 flex items-center space-x-1">
                        <FiCheckCircle /> <span>Verified</span>
                      </span>
                    )}
                  </p>
                </div>
                {isExpert && !reply.isVerified && (
                  <button
                    onClick={() => handleVerifyReply(reply._id)}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Verify
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
              {reply.imageUrls && reply.imageUrls.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {reply.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={`${IMAGE_BASE_URL}${url}`}
                      alt={`Reply image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Post a Reply</h3>
          <form onSubmit={handleReply}>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Post Reply
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;

