import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';

const ProductForm = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'insecticide',
    composition: '',
    dosage: { perAcre: '', format: '' },
    crops: [],
    price: '',
    brand: '',
    weight: '',
    description: '',
    image: '',
    tags: []
  });
  const [cropInput, setCropInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        category: product.category || 'insecticide',
        composition: product.composition || '',
        dosage: product.dosage || { perAcre: '', format: '' },
        crops: product.crops || [],
        price: product.price || '',
        brand: product.brand || '',
        weight: product.weight || '',
        description: product.description || '',
        image: product.image || '',
        tags: product.tags || []
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        await api.put(`/products/${product._id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const addCrop = () => {
    if (cropInput.trim()) {
      setFormData({
        ...formData,
        crops: [...formData.crops, cropInput.trim()]
      });
      setCropInput('');
    }
  };

  const removeCrop = (index) => {
    setFormData({
      ...formData,
      crops: formData.crops.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="insecticide">Insecticide</option>
                <option value="fungicide">Fungicide</option>
                <option value="herbicide">Herbicide</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="growth-regulator">Growth Regulator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Composition *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.composition}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage per Acre</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.dosage.perAcre}
                onChange={(e) => setFormData({
                  ...formData,
                  dosage: { ...formData.dosage, perAcre: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.dosage.format}
                onChange={(e) => setFormData({
                  ...formData,
                  dosage: { ...formData.dosage, format: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crops</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg"
                value={cropInput}
                onChange={(e) => setCropInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                placeholder="Add crop and press Enter"
              />
              <button type="button" onClick={addCrop} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.crops.map((crop, idx) => (
                <span key={idx} className="bg-primary-100 text-primary-800 px-3 py-1 rounded flex items-center space-x-2">
                  <span>{crop}</span>
                  <button type="button" onClick={() => removeCrop(idx)} className="text-primary-600 hover:text-primary-800">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight/Volume</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Enter image URL or path"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded flex items-center space-x-2">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(idx)} className="text-gray-600 hover:text-gray-800">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

