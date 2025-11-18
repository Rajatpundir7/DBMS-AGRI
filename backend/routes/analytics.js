const express = require('express');
const router = express.Router();
const Diagnosis = require('../models/Diagnosis');
const Product = require('../models/Product');
const UserEvent = require('../models/UserEvent');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// Get analytics data
router.get('/', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Top crops
    const topCrops = await Diagnosis.aggregate([
      { $match: { ...dateFilter, crop: { $exists: true, $ne: null } } },
      { $group: { _id: '$crop', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top diseases
    const topDiseases = await Diagnosis.aggregate([
      { $match: dateFilter },
      { $unwind: '$results' },
      { $group: { _id: '$results.label', count: { $sum: 1 }, avgConfidence: { $avg: '$results.confidence' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Most viewed products
    const productViews = await UserEvent.aggregate([
      { $match: { ...dateFilter, eventType: 'product_view' } },
      { $group: { _id: '$payload.productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const productIds = productViews.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const mostViewedProducts = productViews.map(pv => {
      const product = products.find(p => p._id.toString() === pv._id.toString());
      return { ...pv, product };
    });

    // Diagnosis trends (daily for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const diagnosisTrends = await Diagnosis.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User activity
    const userActivity = await UserEvent.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Disease heatmap data (locations with diagnoses)
    const heatmapData = await Diagnosis.find({
      ...dateFilter,
      location: { $exists: true, $ne: null },
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    }).select('location results').limit(1000);

    // Category-wise product distribution
    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      topCrops,
      topDiseases,
      mostViewedProducts,
      diagnosisTrends,
      userActivity,
      heatmapData,
      categoryDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get real-time page views
router.get('/page-views', adminAuth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const pageViews = await UserEvent.find({ eventType: 'page_view' })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(pageViews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

