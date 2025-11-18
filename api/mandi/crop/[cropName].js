const mandiService = require('../../../api/services/mandiService');

module.exports = async (req, res) => {
  try {
    const cropName = req.query.cropName || req.query.crop || req.query['cropName'] || req.query['crop'] || req.query.slug;
    const { state, district, market, limit } = req.query;
    if (!cropName) return res.status(400).json({ success: false, message: 'Crop name is required' });
    const filters = { state, district, market };
    const data = await mandiService.getCropPrice(cropName, filters, limit);
    return res.json(data);
  } catch (err) {
    console.error('crop error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
