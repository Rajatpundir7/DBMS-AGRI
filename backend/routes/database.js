const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Diagnosis = require('../models/Diagnosis');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const CommunityPost = require('../models/CommunityPost');
const UserEvent = require('../models/UserEvent');
const { adminAuth } = require('../middleware/auth');

const models = {
  users: User,
  products: Product,
  diagnoses: Diagnosis,
  knowledgearticles: KnowledgeArticle,
  communityposts: CommunityPost,
  userevents: UserEvent
};

// Get all documents from a collection
router.get('/:collection', adminAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = models[collection.toLowerCase()];
    
    if (!Model) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const documents = await Model.find({}).limit(1000);
    res.json(documents);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single document
router.get('/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = models[collection.toLowerCase()];
    
    if (!Model) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const document = await Model.findById(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update document
router.put('/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = models[collection.toLowerCase()];
    
    if (!Model) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const document = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete document
router.delete('/:collection/:id', adminAuth, async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = models[collection.toLowerCase()];
    
    if (!Model) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create document
router.post('/:collection', adminAuth, async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = models[collection.toLowerCase()];
    
    if (!Model) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const document = new Model(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

