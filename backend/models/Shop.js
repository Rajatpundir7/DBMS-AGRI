const mongoose = require('mongoose');

const dayTimingSchema = new mongoose.Schema({
  open: { type: String, default: '09:00' },
  close: { type: String, default: '18:00' },
  closed: { type: Boolean, default: false }
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: { type: String }
  },
  phone: { type: String },
  email: { type: String },

  // ✅ Corrected structure for timings
  timings: {
    monday: { type: dayTimingSchema, default: () => ({}) },
    tuesday: { type: dayTimingSchema, default: () => ({}) },
    wednesday: { type: dayTimingSchema, default: () => ({}) },
    thursday: { type: dayTimingSchema, default: () => ({}) },
    friday: { type: dayTimingSchema, default: () => ({}) },
    saturday: { type: dayTimingSchema, default: () => ({}) },
    sunday: {
      type: dayTimingSchema,
      default: () => ({ closed: true }) // Sunday closed by default
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shop', shopSchema);
