const mongoose = require('mongoose');

module.exports = async (req, res) => {
  try {
    const dbStatus = mongoose.connection && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    return res.json({ status: 'OK', timestamp: new Date().toISOString(), database: dbStatus, uptime: process.uptime(), message: 'API running' });
  } catch (err) {
    console.error('health error', err);
    return res.status(500).json({ status: 'ERROR', message: err.message });
  }
};
