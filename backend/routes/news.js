const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');

// Get crop-related news
router.get('/', async (req, res) => {
  try {
    const { crop = '', limit = 10 } = req.query;
    const news = await newsService.getCropNews(crop, parseInt(limit));
    res.json({ news, count: news.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
});

module.exports = router;

