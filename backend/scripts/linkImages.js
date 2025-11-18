const mongoose = require('mongoose');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// This script links existing images to products
// Assumes images are in ../pesticide_images and ../fertilizer_images

async function linkImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('Connected to MongoDB');

    const pesticideDir = path.join(__dirname, '../../pesticide_images');
    const fertilizerDir = path.join(__dirname, '../../fertilizer_images');

    // Get all products
    const products = await Product.find();
    console.log(`Found ${products.length} products`);

    // Get available images
    const pesticideImages = fs.existsSync(pesticideDir) 
      ? fs.readdirSync(pesticideDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      : [];
    const fertilizerImages = fs.existsSync(fertilizerDir)
      ? fs.readdirSync(fertilizerDir).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      : [];

    console.log(`Found ${pesticideImages.length} pesticide images`);
    console.log(`Found ${fertilizerImages.length} fertilizer images`);

    let linked = 0;

    // Link images to products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let imagePath = null;

      if (product.category === 'fertilizer' && fertilizerImages.length > 0) {
        // Use fertilizer images for fertilizers
        const imgIndex = i % fertilizerImages.length;
        imagePath = `/fertilizer_images/${fertilizerImages[imgIndex]}`;
      } else if (['insecticide', 'fungicide', 'herbicide', 'growth-regulator'].includes(product.category) && pesticideImages.length > 0) {
        // Use pesticide images for pesticides
        const imgIndex = i % pesticideImages.length;
        imagePath = `/pesticide_images/${pesticideImages[imgIndex]}`;
      }

      if (imagePath && !product.image) {
        product.image = imagePath;
        await product.save();
        linked++;
        console.log(`Linked image to: ${product.title}`);
      }
    }

    console.log(`\nLinked ${linked} images to products`);
    process.exit(0);
  } catch (error) {
    console.error('Error linking images:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  linkImages();
}

module.exports = { linkImages };

