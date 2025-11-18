const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Product image cloud links (from cloudlink.docx)
// Update these with actual links from the docx file
const productImageLinks = {
  // Format: product title or ID -> cloud image URL
  // Example entries - replace with actual links from docx
};

async function updateProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('✅ Connected to MongoDB');

    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    let updated = 0;

    // Update products with cloud image links
    for (const product of products) {
      // Try to match product by title or use index-based mapping
      const imageLink = productImageLinks[product.title] || 
                       productImageLinks[product._id.toString()];
      
      if (imageLink && !product.image?.startsWith('http')) {
        product.image = imageLink;
        await product.save();
        updated++;
        console.log(`✅ Updated image for: ${product.title}`);
      }
    }

    console.log(`\n✅ Updated ${updated} product images`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateProductImages();
}

module.exports = { updateProductImages };

