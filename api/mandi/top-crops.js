const mandiService = require('../../api/services/mandiService');

module.exports = async (req, res) => {
  try {
    const { state, limit = 10, sample = 30 } = req.query;
    const commodities = await mandiService.getAllCommodities(state, sample);
    const samples = commodities.slice(0, Number(sample));
    const cropAverages = [];
    for (const c of samples) {
      const data = await mandiService.getCropPrice(c, state ? { state } : {}, 50);
      if (data && data.success && data.records.length > 0) {
        let total = 0, count = 0;
        data.records.forEach(r => {
          const p = parseFloat(r.modal_price);
          if (!Number.isNaN(p) && p > 0) { total += p; count++; }
        });
        if (count > 0) cropAverages.push({ crop: c, averagePrice: total / count, count });
      }
    }
    cropAverages.sort((a,b) => b.averagePrice - a.averagePrice);
    return res.json({ success: true, top: cropAverages.slice(0, Number(limit)) });
  } catch (err) {
    console.error('top-crops error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
