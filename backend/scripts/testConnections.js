const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra';

async function testConnections() {
  console.log('🧪 Testing Kisan Sewa Kendra Connections\n');
  console.log('=' .repeat(50));

  // Test MongoDB Connection
  console.log('\n📦 Testing MongoDB Connection...');
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    return;
  }

  // Test API Health
  console.log('\n🏥 Testing API Health...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ API is running');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Database: ${response.data.database}`);
  } catch (error) {
    console.error('❌ API Health Check Failed:', error.message);
    console.log('   Make sure the backend server is running (npm start)');
    return;
  }

  // Test Auth Endpoint
  console.log('\n🔐 Testing Authentication Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/auth/me`);
    console.log('⚠️  Auth endpoint accessible (expected 401 without token)');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Auth endpoint working (401 as expected without token)');
    } else {
      console.error('❌ Auth endpoint error:', error.message);
    }
  }

  // Test Products Endpoint
  console.log('\n🛒 Testing Products Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/products?limit=5`);
    console.log(`✅ Products endpoint working`);
    console.log(`   Found ${response.data.products?.length || 0} products`);
  } catch (error) {
    console.error('❌ Products endpoint error:', error.message);
  }

  // Test Knowledge Endpoint
  console.log('\n📚 Testing Knowledge Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/knowledge?limit=5`);
    console.log(`✅ Knowledge endpoint working`);
    console.log(`   Found ${response.data.articles?.length || 0} articles`);
  } catch (error) {
    console.error('❌ Knowledge endpoint error:', error.message);
  }

  // Test Community Endpoint
  console.log('\n👥 Testing Community Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/community?limit=5`);
    console.log(`✅ Community endpoint working`);
    console.log(`   Found ${response.data.posts?.length || 0} posts`);
  } catch (error) {
    console.error('❌ Community endpoint error:', error.message);
  }

  // Test Diagnosis Endpoint
  console.log('\n🔬 Testing Diagnosis Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/diagnosis?limit=5`);
    console.log(`✅ Diagnosis endpoint working`);
    console.log(`   Found ${response.data.diagnoses?.length || 0} diagnoses`);
  } catch (error) {
    console.error('❌ Diagnosis endpoint error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Connection tests completed!\n');
  process.exit(0);
}

testConnections().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});

