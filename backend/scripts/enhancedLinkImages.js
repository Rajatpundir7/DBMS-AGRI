const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Enhanced script to link images to products with better matching
async function linkImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('✅ Connected to MongoDB');

    const pesticideDir = path.join(__dirname, '../../pesticide_images');
    const fertilizerDir = path.join(__dirname, '../../fertilizer_images');

    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    // Get available images
    const pesticideImages = fs.existsSync(pesticideDir) 
      ? fs.readdirSync(pesticideDir)
          .filter(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
          .sort()
      : [];
    const fertilizerImages = fs.existsSync(fertilizerDir)
      ? fs.readdirSync(fertilizerDir)
          .filter(f => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
          .sort()
      : [];

    console.log(`🖼️  Found ${pesticideImages.length} pesticide images`);
    console.log(`🖼️  Found ${fertilizerImages.length} fertilizer images`);

    let linked = 0;
    let updated = 0;

    // Separate products by category
    const fertilizers = products.filter(p => p.category === 'fertilizer');
    const pesticides = products.filter(p => 
      ['insecticide', 'fungicide', 'herbicide', 'growth-regulator'].includes(p.category)
    );

    // Link fertilizer images
    fertilizers.forEach((product, index) => {
      if (fertilizerImages.length > 0) {
        const imgIndex = index % fertilizerImages.length;
        const imagePath = `/fertilizer_images/${fertilizerImages[imgIndex]}`;
        if (product.image !== imagePath) {
          product.image = imagePath;
          product.save();
          linked++;
          console.log(`✅ Linked fertilizer image to: ${product.title}`);
        } else {
          updated++;
        }
      }
    });

    // Link pesticide images
    pesticides.forEach((product, index) => {
      if (pesticideImages.length > 0) {
        const imgIndex = index % pesticideImages.length;
        const imagePath = `/pesticide_images/${pesticideImages[imgIndex]}`;
        if (product.image !== imagePath) {
          product.image = imagePath;
          product.save();
          linked++;
          console.log(`✅ Linked pesticide image to: ${product.title}`);
        } else {
          updated++;
        }
      }
    });

    console.log(`\n✅ Linked ${linked} new images`);
    console.log(`✅ ${updated} products already had correct images`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Fertilizers: ${fertilizers.length} products`);
    console.log(`   - Pesticides: ${pesticides.length} products`);
    console.log(`   - Total images linked: ${linked + updated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error linking images:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  linkImages();
}

module.exports = { linkImages };

