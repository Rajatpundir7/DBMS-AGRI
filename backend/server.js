const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pesticide_images', express.static(path.join(__dirname, '../pesticide_images')));
app.use('/fertilizer_images', express.static(path.join(__dirname, '../fertilizer_images')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/diagnosis', require('./routes/diagnosis'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/community', require('./routes/community'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/database', require('./routes/database'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/disease-images', require('./routes/diseaseImages'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/mandi', require('./routes/mandi'));
app.use('/api/news', require('./routes/news'));
app.use('/api/shops', require('./routes/shops'));

// New utility routes
app.use('/api/translate', require('./routes/translate'));
app.use('/api/docx', require('./routes/docx'));

// Health check
app.use('/api/health', require('./routes/health'));

// Error handling middleware (must be last)
app.use(require('./middleware/errorHandler'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

