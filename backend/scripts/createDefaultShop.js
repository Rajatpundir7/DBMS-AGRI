const mongoose = require('mongoose');
const Shop = require('../models/Shop');
require('dotenv').config();

async function createDefaultShop() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('✅ Connected to MongoDB');

    // Check if shop exists
    const existingShop = await Shop.findOne();
    if (existingShop) {
      console.log('✅ Shop already exists');
      process.exit(0);
    }

    // Create default shop (using coordinates from Google Maps link)
    const shop = new Shop({
      name: 'Kisan Sewa Kendra Main Store',
      address: 'Agricultural Market, Delhi, India',
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: 'Agricultural Market, Delhi, India'
      },
      phone: '+91-9876543210',
      email: 'shop@kisansewa.com',
      timings: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: true }
      }
    });

    await shop.save();
    console.log('✅ Created default shop');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating shop:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createDefaultShop();
}

module.exports = { createDefaultShop };

