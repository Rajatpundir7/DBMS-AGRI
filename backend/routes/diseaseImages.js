const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');
const DiseaseImage = require('../models/DiseaseImage');
const { auth, adminAuth } = require('../middleware/auth');

// Get disease images using RAG
router.get('/search', async (req, res) => {
  try {
    const { crop, disease, limit = 5 } = req.query;
    
    if (!crop || !disease) {
      return res.status(400).json({ 
        message: 'Crop and disease parameters are required' 
      });
    }

    const images = await ragService.searchDiseaseImages(crop, disease, parseInt(limit));
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disease images', error: error.message });
  }
});

// Get disease images for a specific crop
router.get('/crop/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { limit = 10 } = req.query;
    
    const images = await ragService.getDiseaseImagesForCrop(cropName, parseInt(limit));
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching crop disease images', error: error.message });
  }
});

// Get all disease images (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, crop, disease } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = {};
    if (crop) query.crop = new RegExp(crop, 'i');
    if (disease) query.diseaseName = new RegExp(disease, 'i');

    const images = await DiseaseImage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DiseaseImage.countDocuments(query);

    res.json({
      images,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disease images', error: error.message });
  }
});

// Add disease image manually (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { crop, diseaseName, imageUrl, description, tags } = req.body;
    
    const image = new DiseaseImage({
      crop,
      diseaseName,
      imageUrl,
      description,
      tags: tags || [],
      source: 'upload',
      verified: true
    });

    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: 'Error adding disease image', error: error.message });
  }
});

// Delete disease image (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await DiseaseImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Disease image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting disease image', error: error.message });
  }
});

module.exports = router;

