const express = require('express');
const router = express.Router();
const KnowledgeArticle = require('../models/KnowledgeArticle');
const UserEvent = require('../models/UserEvent');
const { auth, expertAuth } = require('../middleware/auth');

// Get all articles
router.get('/', async (req, res) => {
  try {
    const { crop, category, search, page = 1, limit = 20, published = true } = req.query;
    const query = { published: published === 'true' || published === true };

    if (crop) {
      query.crop = new RegExp(crop, 'i');
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const articles = await KnowledgeArticle.find(query)
      .populate('createdBy', 'name')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await KnowledgeArticle.countDocuments(query);

    res.json({
      articles,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    // Log event if user is authenticated
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        await UserEvent.create({
          userId: decoded.userId,
          eventType: 'article_view',
          payload: { articleId: article._id }
        });
      } catch (e) {
        // Not authenticated, skip event logging
      }
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create article (expert/admin only)
router.post('/', expertAuth, async (req, res) => {
  try {
    const article = new KnowledgeArticle({
      ...req.body,
      createdBy: req.user._id
    });
    await article.save();
    await article.populate('createdBy', 'name');
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update article (expert/admin only)
router.put('/:id', expertAuth, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is the creator or admin
    if (article.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(article, req.body, { updatedAt: Date.now() });
    await article.save();
    await article.populate('createdBy', 'name');

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete article (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

