import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { FiUser, FiEye } from 'react-icons/fi';

const KnowledgeDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/knowledge/${id}`);
      setArticle(response.data);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Article not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-4">
          <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded text-sm font-semibold">
            {article.category.toUpperCase()}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          {article.createdBy && (
            <div className="flex items-center space-x-1">
              <FiUser /> <span>{article.createdBy.name}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <FiEye /> <span>{article.views} views</span>
          </div>
          {article.crop && <span>Crop: {article.crop}</span>}
        </div>
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {article.content}
          </div>
        </div>
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDetail;

