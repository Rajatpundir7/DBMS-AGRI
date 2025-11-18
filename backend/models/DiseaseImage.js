const mongoose = require('mongoose');

const DiseaseImageSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
    index: true
  },
  diseaseName: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['rag', 'upload', 'external'],
    default: 'rag'
  },
  description: {
    type: String
  },
  tags: [{
    type: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DiseaseImage', DiseaseImageSchema);

