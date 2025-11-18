const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['insecticide', 'fungicide', 'herbicide', 'fertilizer', 'growth-regulator'],
    required: true
  },
  composition: {
    type: String,
    required: true
  },
  dosage: {
    perAcre: String,
    format: String
  },
  crops: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ title: 'text', description: 'text', crops: 'text' });

module.exports = mongoose.model('Product', productSchema);

