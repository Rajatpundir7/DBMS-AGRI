import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FiShoppingCart } from 'react-icons/fi';
import { IMAGE_BASE_URL } from '../utils/constants';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Cart functionality can be implemented here
    toast.success('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.image ? (
            <img
              src={product.image.startsWith('http') ? product.image : `${IMAGE_BASE_URL}${product.image}`}
              alt={product.title}
              className="w-full rounded-lg shadow-lg"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image Available</span>
            </div>
          )}
        </div>
        <div>
          <div className="mb-4">
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded text-sm font-semibold">
              {product.category.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-2xl text-primary-600 font-bold mb-6">₹{product.price}</p>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold mb-1">Composition</h3>
              <p className="text-gray-700">{product.composition}</p>
            </div>
            {product.dosage && (
              <div>
                <h3 className="font-semibold mb-1">Dosage</h3>
                <p className="text-gray-700">
                  {product.dosage.perAcre} per acre ({product.dosage.format})
                </p>
              </div>
            )}
            {product.crops && product.crops.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Recommended Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {product.crops.map((crop, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.brand && (
              <div>
                <h3 className="font-semibold mb-1">Brand</h3>
                <p className="text-gray-700">{product.brand}</p>
              </div>
            )}
            {product.weight && (
              <div>
                <h3 className="font-semibold mb-1">Weight/Volume</h3>
                <p className="text-gray-700">{product.weight}</p>
              </div>
            )}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center justify-center space-x-2"
          >
            <FiShoppingCart /> <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

