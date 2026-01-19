const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  // Face Recognition Fields
  faceEmbedding: {
    type: [Number],
    default: null
  },
  faceAuthEnabled: {
    type: Boolean,
    default: false
  },
  faceRegisteredAt: Date,
  faceAuthAttempts: {
    success: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    lastAttempt: Date
  },
  livenessCheckRequired: {
    type: Boolean,
    default: true
  },
  trackingActive: { type: Boolean, default: false },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
