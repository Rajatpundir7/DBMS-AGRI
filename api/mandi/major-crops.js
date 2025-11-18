const mandiService = require('../../api/services/mandiService');

module.exports = async (req, res) => {
  try {
    const { state, limit } = req.query;
    const data = await mandiService.getMajorCropPrices(state, limit);
    return res.json(data);
  } catch (err) {
    console.error('major-crops error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
