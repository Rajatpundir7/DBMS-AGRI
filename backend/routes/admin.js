const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Diagnosis = require('../models/Diagnosis');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const CommunityPost = require('../models/CommunityPost');
const UserEvent = require('../models/UserEvent');
const { adminAuth } = require('../middleware/auth');

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalDiagnoses,
      totalArticles,
      totalPosts,
      recentDiagnoses,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Diagnosis.countDocuments(),
      KnowledgeArticle.countDocuments(),
      CommunityPost.countDocuments(),
      Diagnosis.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(10),
      User.find().sort({ createdAt: -1 }).limit(10).select('-password')
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalDiagnoses,
        totalArticles,
        totalPosts
      },
      recentDiagnoses,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all diagnoses with filters
router.get('/diagnoses', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, crop, status } = req.query;
    const query = {};

    if (crop) {
      query.crop = new RegExp(crop, 'i');
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
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

// Get all community posts for moderation
router.get('/community-posts', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await CommunityPost.find(query)
      .populate('authorId', 'name email role')
      .populate('replies.authorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

