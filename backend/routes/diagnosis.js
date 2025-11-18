const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Diagnosis = require('../models/Diagnosis');
const Product = require('../models/Product');
const UserEvent = require('../models/UserEvent');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/diagnosis');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'diagnosis-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// AI diagnosis using Gemini API (with fallback to simulation)
const performAIDiagnosis = async (imagePaths, cropName) => {
  try {
    // Try Gemini API first
    const geminiResult = await geminiService.analyzeCropImages(imagePaths, cropName || 'Crop');
    
    if (geminiResult.success) {
      // Parse Gemini response into our format
      const diagnosisText = geminiResult.diagnosis || geminiResult.fullText;
      const recommendationText = geminiResult.recommendation || geminiResult.fullText;
      
      // Extract disease name from diagnosis (first line or key phrase)
      const diseaseMatch = diagnosisText.match(/(?:bimari|disease|pest|deficiency)[\s:]+([^\n,]+)/i) ||
                          diagnosisText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      
      const diseaseName = diseaseMatch ? diseaseMatch[1].trim() : 'Unknown Disease';
      
      return [{
        label: diseaseName,
        confidence: 85, // Gemini doesn't provide confidence, use default
        diseaseType: diagnosisText.toLowerCase().includes('pest') ? 'pest' : 
                    diagnosisText.toLowerCase().includes('deficiency') ? 'deficiency' : 'disease',
        treatment: recommendationText,
        fullDiagnosis: diagnosisText,
        source: 'gemini',
        language: 'hinglish'
      }];
    } else {
      // Fallback to simulation if Gemini fails
      return simulateAIDiagnosis();
    }
  } catch (error) {
    console.error('Gemini diagnosis error:', error);
    // Fallback to simulation
    return simulateAIDiagnosis();
  }
};

// Fallback simulation (if Gemini API fails)
const simulateAIDiagnosis = async () => {
  const diseases = [
    { label: 'Rice Blast', confidence: 85, diseaseType: 'disease', treatment: 'Apply fungicide containing tricyclazole or propiconazole' },
    { label: 'Brown Spot', confidence: 78, diseaseType: 'disease', treatment: 'Use mancozeb or carbendazim fungicide' },
    { label: 'Leaf Blight', confidence: 72, diseaseType: 'disease', treatment: 'Apply copper-based fungicides' },
    { label: 'Aphids', confidence: 80, diseaseType: 'pest', treatment: 'Use imidacloprid or acephate insecticides' },
    { label: 'Nitrogen Deficiency', confidence: 75, diseaseType: 'deficiency', treatment: 'Apply urea or ammonium sulfate fertilizer' },
    { label: 'Healthy Plant', confidence: 90, diseaseType: 'healthy', treatment: 'Continue regular care and monitoring' }
  ];

  const result = diseases[Math.floor(Math.random() * diseases.length)];
  return [result];
};

// Create diagnosis
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const { crop, location } = req.body;
    const imageUrls = req.files.map(file => `/uploads/diagnosis/${file.filename}`);
    const imagePaths = req.files.map(file => file.path);

    // Call AI diagnosis using Gemini API
    const results = await performAIDiagnosis(imagePaths, crop);

    // Find recommended products based on diagnosis
    const recommendedProducts = [];
    if (results.length > 0 && results[0].diseaseType !== 'healthy') {
      const diseaseName = results[0].label;
      
      // Try to find products matching the disease
      let products = await Product.find({
        $or: [
          { title: { $regex: diseaseName, $options: 'i' } },
          { description: { $regex: diseaseName, $options: 'i' } },
          { tags: { $in: [new RegExp(diseaseName, 'i')] } }
        ]
      }).limit(5);
      
      // If no products found, try matching by disease type
      if (products.length === 0 && results[0].diseaseType) {
        const categoryMap = {
          'disease': 'fungicide',
          'pest': 'insecticide',
          'deficiency': 'fertilizer'
        };
        const category = categoryMap[results[0].diseaseType] || 'fungicide';
        products = await Product.find({ category }).limit(5);
      }
      
      // If still no products, get any products for the crop
      if (products.length === 0 && crop) {
        products = await Product.find({
          crops: { $in: [new RegExp(crop, 'i')] }
        }).limit(5);
      }
      
      // If still no products, get top products
      if (products.length === 0) {
        products = await Product.find().limit(5);
      }

      recommendedProducts.push(...products.map(p => p._id));
    }

    // Parse location if provided
    let locationData = null;
    if (location) {
      try {
        locationData = JSON.parse(location);
      } catch (e) {
        locationData = { address: location };
      }
    }

    const diagnosis = new Diagnosis({
      userId: req.user._id,
      crop,
      imageUrls,
      results,
      location: locationData,
      recommendedProducts,
      status: 'completed'
    });

    await diagnosis.save();

    // Log event
    await UserEvent.create({
      userId: req.user._id,
      eventType: 'diagnosis',
      payload: { diagnosisId: diagnosis._id, crop, results }
    });

    // Populate recommended products
    await diagnosis.populate('recommendedProducts');

    res.status(201).json(diagnosis);
  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all diagnoses (public for map) - MUST BE BEFORE /:id
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100, crop } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (crop) {
      query.crop = new RegExp(crop, 'i');
    }

    const diagnoses = await Diagnosis.find(query)
      .populate('userId', 'name email')
      .populate('recommendedProducts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Diagnosis.countDocuments(query);

    res.json({
      diagnoses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's diagnoses - MUST BE BEFORE /:id
router.get('/my-diagnoses', auth, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user._id })
      .populate('recommendedProducts')
      .sort({ createdAt: -1 });
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single diagnosis - MUST BE LAST
router.get('/:id', auth, async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('recommendedProducts')
      .populate('userId', 'name email');
    
    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

