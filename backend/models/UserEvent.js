const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventType: {
    type: String,
    required: true,
    enum: ['page_view', 'product_view', 'diagnosis', 'article_view', 'search', 'cart_add', 'checkout']
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

userEventSchema.index({ userId: 1, timestamp: -1 });
userEventSchema.index({ eventType: 1, timestamp: -1 });

module.exports = mongoose.model('UserEvent', userEventSchema);

