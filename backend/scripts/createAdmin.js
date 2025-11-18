const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('Connected to MongoDB');

    const email = process.argv[2] || 'admin@kisan.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin exists
    let admin = await User.findOne({ email });
    if (admin) {
      admin.role = 'admin';
      admin.password = password; // Will be hashed by pre-save hook
      await admin.save();
      console.log(`✅ Updated existing user to admin: ${email}`);
    } else {
      admin = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      await admin.save();
      console.log(`✅ Created admin user: ${email}`);
    }

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: admin\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };

