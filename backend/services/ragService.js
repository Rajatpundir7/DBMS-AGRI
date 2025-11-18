const axios = require('axios');
const DiseaseImage = require('../models/DiseaseImage');

// RAG Service to fetch disease images from internet
class RAGService {
  constructor() {
    // Using Unsplash API for high-quality images (free tier)
    // In production, you can use other APIs like Pexels, Pixabay, or custom scrapers
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    this.useUnsplash = !!this.unsplashAccessKey;
  }

  // Search for disease images using RAG approach
  async searchDiseaseImages(crop, diseaseName, limit = 5) {
    try {
      // Build better search query
      const searchQuery = `${crop} ${diseaseName} plant disease symptoms`;
      
      // First, check if we have cached images in database with better matching
      const cachedImages = await DiseaseImage.find({
        $or: [
          { crop: new RegExp(crop, 'i'), diseaseName: new RegExp(diseaseName, 'i') },
          { tags: { $in: [new RegExp(crop.toLowerCase(), 'i'), new RegExp(diseaseName.toLowerCase(), 'i')] } }
        ]
      }).limit(limit);

      if (cachedImages.length >= limit) {
        console.log(`📦 Using cached images for ${crop} - ${diseaseName}`);
        return cachedImages.map(img => ({
          url: img.imageUrl,
          source: img.source,
          description: img.description,
          crop: img.crop,
          diseaseName: img.diseaseName
        }));
      }

      // If not enough cached, fetch from internet with better search
      const images = await this.fetchFromInternet(crop, diseaseName, limit, searchQuery);
      
      // Cache the images in database
      for (const img of images) {
        await DiseaseImage.findOneAndUpdate(
          { imageUrl: img.url },
          {
            crop: img.crop || crop,
            diseaseName: img.diseaseName || diseaseName,
            imageUrl: img.url,
            source: 'rag',
            description: img.description,
            tags: [crop.toLowerCase(), diseaseName.toLowerCase(), 'disease', 'symptoms']
          },
          { upsert: true, new: true }
        );
      }

      return images;
    } catch (error) {
      console.error('Error in RAG search:', error);
      // Return dummy/placeholder images if API fails
      return this.getDummyImages(crop, diseaseName, limit);
    }
  }

  // Fetch images from internet using Unsplash or placeholder service
  async fetchFromInternet(crop, diseaseName, limit, customQuery = null) {
    const searchQuery = customQuery || `${crop} ${diseaseName} plant disease symptoms`;
    
    if (this.useUnsplash) {
      return await this.fetchFromUnsplash(searchQuery, limit);
    } else {
      // Use placeholder service or generate image URLs
      return await this.fetchFromPlaceholder(searchQuery, limit, crop, diseaseName);
    }
  }

  // Fetch from Unsplash API
  async fetchFromUnsplash(query, limit) {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          per_page: limit,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        }
      });

      return response.data.results.map((photo, index) => ({
        url: photo.urls.regular,
        source: 'unsplash',
        description: photo.description || `${query} - Image ${index + 1}`,
        crop: query.split(' ')[0],
        diseaseName: query.split(' ').slice(1).join(' ')
      }));
    } catch (error) {
      console.error('Unsplash API error:', error.message);
      return this.getDummyImages(query.split(' ')[0], query.split(' ').slice(1).join(' '), limit);
    }
  }

  // Fetch from placeholder service (Picsum or similar)
  async fetchFromPlaceholder(query, limit, crop, diseaseName) {
    const images = [];
    const cropName = crop || query.split(' ')[0];
    const disease = diseaseName || query.split(' ').slice(1).join(' ');

    // Use more specific image URLs based on crop and disease
    const imageSeeds = [
      `${cropName}${disease}1`,
      `${cropName}${disease}2`,
      `${cropName}${disease}3`,
      `${cropName}${disease}4`,
      `${cropName}${disease}5`
    ];

    for (let i = 0; i < limit; i++) {
      const seed = imageSeeds[i] || `${cropName}${disease}${Date.now()}${i}`;
      images.push({
        url: `https://picsum.photos/seed/${seed}/800/600`,
        source: 'picsum',
        description: `${cropName} ${disease} - Disease symptoms and treatment guide ${i + 1}`,
        crop: cropName,
        diseaseName: disease
      });
    }

    return images;
  }

  // Get dummy/placeholder images
  getDummyImages(crop, diseaseName, limit) {
    const images = [];
    for (let i = 0; i < limit; i++) {
      images.push({
        url: `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(crop + ' ' + diseaseName)}`,
        source: 'placeholder',
        description: `${crop} ${diseaseName} - Placeholder image ${i + 1}`,
        crop: crop,
        diseaseName: diseaseName
      });
    }
    return images;
  }

  // Get disease images for a specific crop
  async getDiseaseImagesForCrop(crop, limit = 10) {
    try {
      const images = await DiseaseImage.find({
        crop: new RegExp(crop, 'i')
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return images.map(img => ({
        url: img.imageUrl,
        source: img.source,
        description: img.description,
        crop: img.crop,
        diseaseName: img.diseaseName
      }));
    } catch (error) {
      console.error('Error fetching disease images:', error);
      return [];
    }
  }
}

module.exports = new RAGService();

