const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: String,
    trim: true
  },
  imageUrls: [{
    type: String,
    required: true
  }],
  results: [{
    label: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    treatment: {
      type: String,
      default: ''
    },
    diseaseType: {
      type: String,
      enum: ['disease', 'pest', 'deficiency', 'healthy'],
      default: 'disease'
    }
  }],
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  recommendedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);

