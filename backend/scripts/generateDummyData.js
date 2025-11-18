const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Diagnosis = require('../models/Diagnosis');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const CommunityPost = require('../models/CommunityPost');
const UserEvent = require('../models/UserEvent');
const DiseaseImage = require('../models/DiseaseImage');
require('dotenv').config();

// Import ragService only if available
let ragService;
try {
  ragService = require('../services/ragService');
} catch (error) {
  console.log('⚠️  RAG service not available, using placeholders');
  ragService = null;
}

const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Tomato', 'Onion', 'Chilli', 'Brinjal'];
const diseases = ['Blast', 'Brown Spot', 'Leaf Blight', 'Rust', 'Powdery Mildew', 'Downy Mildew', 'Bacterial Blight'];
const pests = ['Aphids', 'Whitefly', 'Stem Borer', 'Armyworm', 'Thrips', 'Jassids', 'Leafhoppers'];

// Generate dummy users
async function generateUsers(count = 20) {
  const users = [];
  const roles = ['user', 'user', 'user', 'expert']; // 75% users, 25% experts
  
  for (let i = 0; i < count; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: 'password123', // Will be hashed by pre-save hook
      phone: `9876543${String(i).padStart(3, '0')}`,
      role: role,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
    });
  }
  
  await User.insertMany(users);
  console.log(`✅ Generated ${count} users`);
  return await User.find();
}

// Generate dummy diagnoses
async function generateDiagnoses(users, count = 50) {
  const diagnoses = [];
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    const pest = pests[Math.floor(Math.random() * pests.length)];
    
    const diseaseType = Math.random() > 0.5 ? 'disease' : 'pest';
    const label = diseaseType === 'disease' ? `${crop} ${disease}` : pest;
    
    diagnoses.push({
      userId: user._id,
      crop: crop,
      imageUrls: [
        `/uploads/diagnosis/dummy-${i + 1}-1.jpg`,
        `/uploads/diagnosis/dummy-${i + 1}-2.jpg`
      ],
      results: [{
        label: label,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        diseaseType: diseaseType,
        treatment: `Apply appropriate ${diseaseType === 'disease' ? 'fungicide' : 'insecticide'} for ${label}`
      }],
      location: {
        latitude: 20 + Math.random() * 10, // India coordinates
        longitude: 70 + Math.random() * 10,
        address: `Village ${i + 1}, District ${Math.floor(Math.random() * 10) + 1}`
      },
      status: 'completed',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    });
  }
  
  await Diagnosis.insertMany(diagnoses);
  console.log(`✅ Generated ${count} diagnoses`);
}

// Generate dummy knowledge articles
async function generateKnowledgeArticles(count = 30) {
  const articles = [];
  const categories = ['disease', 'pest', 'nutrient', 'treatment', 'prevention'];
  
  for (let i = 0; i < count; i++) {
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    
    articles.push({
      title: `${crop} ${disease} - Complete Guide`,
      content: `This is a comprehensive guide about ${disease} in ${crop}. ${disease} is a common problem affecting ${crop} cultivation. Symptoms include leaf spots, wilting, and reduced yield. Treatment involves proper fungicide application and cultural practices. Prevention is key through crop rotation and resistant varieties.`,
      crop: crop,
      category: category,
      tags: [crop.toLowerCase(), disease.toLowerCase(), category],
      published: true,
      viewCount: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    });
  }
  
  await KnowledgeArticle.insertMany(articles);
  console.log(`✅ Generated ${count} knowledge articles`);
}

// Generate dummy community posts
async function generateCommunityPosts(users, count = 40) {
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    
    posts.push({
      authorId: user._id,
      body: `I'm facing ${disease} problem in my ${crop} field. Can anyone suggest a solution? The leaves are showing yellow spots and the yield is decreasing.`,
      crop: crop,
      images: [`/uploads/community/post-${i + 1}.jpg`],
      tags: [crop.toLowerCase(), disease.toLowerCase()],
      upvotes: Math.floor(Math.random() * 50),
      replies: [],
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
    });
  }
  
  await CommunityPost.insertMany(posts);
  console.log(`✅ Generated ${count} community posts`);
}

// Generate dummy user events
async function generateUserEvents(users, count = 100) {
  const events = [];
  const eventTypes = ['page_view', 'product_view', 'diagnosis', 'article_view', 'search'];
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    events.push({
      userId: user._id,
      eventType: eventType,
      payload: {
        page: eventType === 'page_view' ? ['/products', '/diagnosis', '/knowledge'][Math.floor(Math.random() * 3)] : null,
        productId: eventType === 'product_view' ? 'product123' : null,
        searchQuery: eventType === 'search' ? crops[Math.floor(Math.random() * crops.length)] : null
      },
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
    });
  }
  
  await UserEvent.insertMany(events);
  console.log(`✅ Generated ${count} user events`);
}

// Generate disease images using RAG
async function generateDiseaseImages(count = 50) {
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    
    try {
      // Use RAG service to get images if available
      if (ragService) {
        const ragImages = await ragService.searchDiseaseImages(crop, disease, 1);
        if (ragImages.length > 0) {
          images.push({
            crop: crop,
            diseaseName: disease,
            imageUrl: ragImages[0].url,
            source: 'rag',
            description: ragImages[0].description || `${crop} ${disease} - Sample image`,
            tags: [crop.toLowerCase(), disease.toLowerCase()],
            verified: false
          });
        } else {
          throw new Error('No images from RAG');
        }
      } else {
        throw new Error('RAG service not available');
      }
    } catch (error) {
      // If RAG fails, use placeholder
      images.push({
        crop: crop,
        diseaseName: disease,
        imageUrl: `https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=${encodeURIComponent(crop + ' ' + disease)}`,
        source: 'placeholder',
        description: `${crop} ${disease} - Placeholder image`,
        tags: [crop.toLowerCase(), disease.toLowerCase()],
        verified: false
      });
    }
    
    // Add delay to avoid rate limiting
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  await DiseaseImage.insertMany(images);
  console.log(`✅ Generated ${count} disease images using RAG`);
}

// Main function
async function generateDummyData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🌱 Starting dummy data generation...\n');
    
    // Generate users first (needed for other data)
    const users = await generateUsers(20);
    
    // Generate other data in parallel where possible
    await Promise.all([
      generateDiagnoses(users, 50),
      generateKnowledgeArticles(30),
      generateCommunityPosts(users, 40),
      generateUserEvents(users, 100)
    ]);
    
    // Generate disease images (with delay to avoid rate limiting)
    await generateDiseaseImages(50);
    
    console.log('\n✅ All dummy data generated successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 20`);
    console.log(`   - Diagnoses: 50`);
    console.log(`   - Knowledge Articles: 30`);
    console.log(`   - Community Posts: 40`);
    console.log(`   - User Events: 100`);
    console.log(`   - Disease Images: 50`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateDummyData();
}

module.exports = { generateDummyData };

