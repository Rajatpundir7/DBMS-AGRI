// Script to help extract image links from cloudlink.docx
// Since we can't directly read .docx, this script provides a template
// User should manually extract links from the docx and add them here

const productImageLinks = {
  // Add image links here in format:
  // "Product Title": "https://cloud-image-url.com/image.jpg",
  // Example:
  // "Imidacloprid 17.8% SL": "https://example.com/imidacloprid.jpg",
};

// Export for use in updateProductImages.js
module.exports = productImageLinks;

