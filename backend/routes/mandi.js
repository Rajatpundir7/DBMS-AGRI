const express = require('express');
const router = express.Router();
const mandiService = require('../services/mandiService');

// Get mandi prices for a specific crop with filters
router.get('/crop/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { state, district, market, limit } = req.query;
    
    if (!cropName) {
      return res.status(400).json({ 
        success: false,
        message: 'Crop name is required' 
      });
    }

    const filters = { state, district, market };
    const priceData = await mandiService.getCropPrice(cropName, filters, limit);
    
    res.json(priceData);
  } catch (error) {
    console.error('Error fetching crop prices:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching mandi prices', 
      error: error.message 
    });
  }
});

// Get major crop prices
router.get('/major-crops', async (req, res) => {
  try {
    const { state, limit } = req.query;
    const prices = await mandiService.getMajorCropPrices(state, limit);
    res.json(prices);
  } catch (error) {
    console.error('Error fetching major crop prices:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching major crop prices', 
      error: error.message 
    });
  }
});

// Get all available states
router.get('/states', async (req, res) => {
  try {
    const states = await mandiService.getStates();
    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching states', 
      error: error.message 
    });
  }
});

// Get districts by state
router.get('/districts/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const districts = await mandiService.getDistrictsByState(state);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching districts', 
      error: error.message 
    });
  }
});

// Get markets by state and district
router.get('/markets', async (req, res) => {
  try {
    const { state, district } = req.query;
    
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State is required'
      });
    }

    const markets = await mandiService.getMarkets(state, district);
    res.json(markets);
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching markets', 
      error: error.message 
    });
  }
});

// Search commodities
router.get('/search', async (req, res) => {
  try {
    const { query, state, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = await mandiService.searchCommodities(query, state, limit);
    res.json(results);
  } catch (error) {
    console.error('Error searching commodities:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching commodities', 
      error: error.message 
    });
  }
});

// Get all available commodities
router.get('/commodities', async (req, res) => {
  try {
    const { state, limit } = req.query;
    const commodities = await mandiService.getAllCommodities(state, limit);
    res.json(commodities);
  } catch (error) {
    console.error('Error fetching commodities:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching commodities', 
      error: error.message 
    });
  }
});

// Get top N crops by average price (best-effort)
router.get('/top-crops', async (req, res) => {
  try {
    const { state, limit = 10, sample = 30 } = req.query;
    // Get list of commodities
    const commodities = await mandiService.getAllCommodities(state, sample);
    const samples = commodities.slice(0, sample);

    const cropAverages = [];
    for (const c of samples) {
      const data = await mandiService.getCropPrice(c, state ? { state } : {}, 50);
      if (data && data.success && data.records.length > 0) {
        let total = 0, count = 0;
        data.records.forEach(r => {
          const p = parseFloat(r.modal_price);
          if (!Number.isNaN(p) && p > 0) { total += p; count++; }
        });
        if (count > 0) {
          cropAverages.push({ crop: c, averagePrice: total / count, count });
        }
      }
    }

    cropAverages.sort((a, b) => b.averagePrice - a.averagePrice);
    res.json({ success: true, top: cropAverages.slice(0, limit) });
  } catch (error) {
    console.error('Error fetching top crops:', error);
    res.status(500).json({ success: false, message: 'Error fetching top crops', error: error.message });
  }
});

// Get price trends for a commodity
router.get('/trends/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { state, district, market, days } = req.query;
    
    if (!cropName) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }

    const trends = await mandiService.getPriceTrends(
      cropName, 
      { state, district, market }, 
      days || 30
    );
    res.json(trends);
  } catch (error) {
    console.error('Error fetching price trends:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching price trends', 
      error: error.message 
    });
  }
});

// Get latest prices across all markets
router.get('/latest', async (req, res) => {
  try {
    const { state, limit } = req.query;
    const latestPrices = await mandiService.getLatestPrices(state, limit || 50);
    res.json(latestPrices);
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching latest prices', 
      error: error.message 
    });
  }
});

// Get price comparison between states/markets
router.post('/compare', async (req, res) => {
  try {
    const { cropName, locations } = req.body;
    
    if (!cropName || !locations || !Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        message: 'Crop name and locations array are required'
      });
    }

    const comparison = await mandiService.comparePrices(cropName, locations);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error comparing prices', 
      error: error.message 
    });
  }
});

module.exports = router;