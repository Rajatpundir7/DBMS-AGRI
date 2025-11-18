const axios = require('axios');

// Date helper function (replaces luxon dependency)
const getDateString = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Mandi Price API Service using data.gov.in
class MandiService {
  constructor() {
    this.apiKey = process.env.MANDI_API_KEY || '579b464db66ec23bdd0000012bc7e5f654d243de5d2f826a8f6bd9a3';
    this.apiUrl = 'https://api.data.gov.in/resource/35985678-8d79-46b4-9ed6-6f13308a1d24';
  }

  // Generalised fetch: accepts optional filters object and limit
  async getMandiPrices(cropName, dateStr = null, filters = {}, limit = 50) {
    try {
      if (!this.apiKey) {
        throw new Error('Mandi API key not configured');
      }

      // If no date provided, use yesterday
      if (!dateStr) {
        dateStr = getDateString(1);
      }

      const params = {
        'api-key': this.apiKey,
        format: 'json',
        limit: String(limit || 50),
        'filters[commodity]': cropName,
        'filters[arrival_date]': dateStr
      };

      // add optional filters (state/district/market) if provided
      if (filters.state) params['filters[state]'] = filters.state;
      if (filters.district) params['filters[district]'] = filters.district;
      if (filters.market) params['filters[market]'] = filters.market;

      const response = await axios.get(this.apiUrl, { params });

      if (response.data && response.data.records) {
        return {
          success: true,
          date: dateStr,
          records: response.data.records,
          count: response.data.records.length
        };
      } else {
        return {
          success: false,
          records: [],
          count: 0
        };
      }
    } catch (error) {
      console.error('Mandi API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message,
        records: [],
        count: 0
      };
    }
  }

  // Get crop price with optional filters and limit
  async getCropPrice(cropName, filters = {}, limit = 50) {
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      const dateStr = getDateString(daysAgo);
      const result = await this.getMandiPrices(cropName, dateStr, filters, limit);

      if (result.success && result.records.length > 0) {
        return {
          ...result,
          dateUsed: dateStr,
          daysAgo: daysAgo
        };
      }
    }

    return {
      success: false,
      records: [],
      count: 0,
      message: 'No data found for the last 3 days'
    };
  }

  // Major crops with optional state filtering
  async getMajorCropPrices(state = null, limit = 50) {
    const majorCrops = ['Wheat', 'Paddy(Dhan)(Common)', 'Tomato', 'Onion', 'Potato'];
    const results = [];

    // Find a date with data
    let dateWithData = null;
    for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
      const dateStr = getDateString(daysAgo);
      const testResult = await this.getMandiPrices('Onion', dateStr, state ? { state } : {}, limit);

      if (testResult.success && testResult.records.length > 0) {
        dateWithData = dateStr;
        break;
      }
    }

    if (!dateWithData) {
      return {
        success: false,
        message: 'No data available for the last 3 days',
        crops: []
      };
    }

    for (const crop of majorCrops) {
      const result = await this.getMandiPrices(crop, dateWithData, state ? { state } : {}, limit);

      if (result.success && result.records.length > 0) {
        let totalPrice = 0;
        let count = 0;

        result.records.forEach(record => {
          const price = parseFloat(record.modal_price);
          if (!Number.isNaN(price) && price > 0) {
            totalPrice += price;
            count++;
          }
        });

        if (count > 0) {
          results.push({
            crop: crop,
            averagePrice: totalPrice / count,
            mandiCount: count,
            date: dateWithData
          });
        }
      }
    }

    return {
      success: true,
      date: dateWithData,
      crops: results
    };
  }

  // Return unique states (best-effort using latest day's records for a common crop)
  async getStates() {
    const res = await this.getMandiPrices('Onion', getDateString(1), {}, 1000);
    const states = new Set();
    if (res.success) {
      res.records.forEach(r => { if (r.state) states.add(r.state); });
    }
    return Array.from(states).sort();
  }

  async getDistrictsByState(state) {
    if (!state) return [];
    const res = await this.getMandiPrices('Onion', getDateString(1), { state }, 1000);
    const districts = new Set();
    if (res.success) {
      res.records.forEach(r => { if (r.district) districts.add(r.district); });
    }
    return Array.from(districts).sort();
  }

  async getMarkets(state, district) {
    const filters = {};
    if (state) filters.state = state;
    if (district) filters.district = district;
    const res = await this.getMandiPrices('Onion', getDateString(1), filters, 1000);
    const markets = new Set();
    if (res.success) {
      res.records.forEach(r => { if (r.market) markets.add(r.market); });
    }
    return Array.from(markets).sort();
  }

  async searchCommodities(query, state = null, limit = 50) {
    // Best-effort: fetch many records and filter commodity names
    const res = await this.getMandiPrices('Onion', getDateString(1), state ? { state } : {}, 1000);
    const matches = new Set();
    if (res.success) {
      res.records.forEach(r => {
        if (r.commodity && r.commodity.toLowerCase().includes(String(query).toLowerCase())) {
          matches.add(r.commodity);
        }
      });
    }
    return Array.from(matches).slice(0, limit);
  }

  async getAllCommodities(state = null, limit = 1000) {
    const res = await this.getMandiPrices('Onion', getDateString(1), state ? { state } : {}, limit);
    const commodities = new Set();
    if (res.success) {
      res.records.forEach(r => { if (r.commodity) commodities.add(r.commodity); });
    }
    return Array.from(commodities).sort();
  }

  async getPriceTrends(cropName, filters = {}, days = 30) {
    const trends = [];
    for (let d = days; d >= 1; d -= Math.max(1, Math.floor(days / 10))) {
      const dateStr = getDateString(d);
      const res = await this.getMandiPrices(cropName, dateStr, filters, 1000);
      let avg = null;
      if (res.success && res.records.length > 0) {
        let total = 0; let count = 0;
        res.records.forEach(r => {
          const p = parseFloat(r.modal_price);
          if (!Number.isNaN(p) && p > 0) { total += p; count++; }
        });
        if (count > 0) avg = total / count;
      }
      trends.push({ date: dateStr, averagePrice: avg, count: res.count || 0 });
    }
    return { success: true, trends };
  }

  async getLatestPrices(state = null, limit = 50) {
    const res = await this.getMandiPrices('Onion', getDateString(1), state ? { state } : {}, limit);
    return res;
  }

  // Compare prices for a crop across locations (locations: [{state,district,market}])
  async comparePrices(cropName, locations = []) {
    const comparisons = [];
    for (const loc of locations) {
      const filters = {};
      if (loc.state) filters.state = loc.state;
      if (loc.district) filters.district = loc.district;
      if (loc.market) filters.market = loc.market;
      const res = await this.getCropPrice(cropName, filters, 50);
      let avg = null;
      if (res.success && res.records.length > 0) {
        let total = 0; let count = 0;
        res.records.forEach(r => {
          const p = parseFloat(r.modal_price);
          if (!Number.isNaN(p) && p > 0) { total += p; count++; }
        });
        if (count > 0) avg = total / count;
      }
      comparisons.push({ location: loc, averagePrice: avg, records: res.records || [] });
    }
    return { success: true, comparisons };
  }
}

module.exports = new MandiService();

