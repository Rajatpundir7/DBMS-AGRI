const axios = require('axios');

const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

class MandiService {
  constructor() {
    this.apiKey = process.env.MANDI_API_KEY || '579b464db66ec23bdd0000012bc7e5d2f826a8f6bd9a3';
    this.apiUrl = 'https://api.data.gov.in/resource/35985678-8d79-46b4-9ed6-6f13308a1d24';
  }

  async getMandiPrices(cropName, dateStr = null, filters = {}, limit = 50) {
    try {
      if (!this.apiKey) throw new Error('Mandi API key not configured');
      if (!dateStr) dateStr = getDateString(1);
      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: String(limit || 50),
        'filters[commodity]': cropName,
        'filters[arrival_date]': dateStr
      };
      if (filters.state) params['filters[state]'] = filters.state;
      if (filters.district) params['filters[district]'] = filters.district;
      if (filters.market) params['filters[market]'] = filters.market;
      const response = await axios.get(this.apiUrl, { params });
      if (response.data && response.data.records) {
        return { success: true, date: dateStr, records: response.data.records, count: response.data.records.length };
      }
      return { success: false, records: [], count: 0 };
    } catch (error) {
      console.error('Mandi API Error:', error.response?.data || error.message);
      return { success: false, error: error.message, records: [], count: 0 };
    }
  }

  async getCropPrice(cropName, filters = {}, limit = 50) {
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      const dateStr = getDateString(daysAgo);
      const result = await this.getMandiPrices(cropName, dateStr, filters, limit);
      if (result.success && result.records.length > 0) {
        return { ...result, dateUsed: dateStr, daysAgo };
      }
    }
    return { success: false, records: [], count: 0, message: 'No data found for the last 3 days' };
  }

  async getMajorCropPrices(state = null, limit = 50) {
    const majorCrops = ['Wheat', 'Paddy(Dhan)(Common)', 'Tomato', 'Onion', 'Potato'];
    const results = [];
    let dateWithData = null;
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      const dateStr = getDateString(daysAgo);
      const testResult = await this.getMandiPrices('Onion', dateStr, state ? { state } : {}, limit);
      if (testResult.success && testResult.records.length > 0) { dateWithData = dateStr; break; }
    }
    if (!dateWithData) return { success: false, message: 'No data available for the last 3 days', crops: [] };
    for (const crop of majorCrops) {
      const result = await this.getMandiPrices(crop, dateWithData, state ? { state } : {}, limit);
      if (result.success && result.records.length > 0) {
        let totalPrice = 0; let count = 0;
        result.records.forEach(record => {
          const price = parseFloat(record.modal_price);
          if (!Number.isNaN(price) && price > 0) { totalPrice += price; count++; }
        });
        if (count > 0) results.push({ crop, averagePrice: totalPrice / count, mandiCount: count, date: dateWithData });
      }
    }
    return { success: true, date: dateWithData, crops: results };
  }

  async getAllCommodities(state = null, limit = 1000) {
    const res = await this.getMandiPrices('Onion', getDateString(1), state ? { state } : {}, limit);
    const commodities = new Set();
    if (res.success) res.records.forEach(r => { if (r.commodity) commodities.add(r.commodity); });
    return Array.from(commodities).sort();
  }
}

module.exports = new MandiService();
