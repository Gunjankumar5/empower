const mongoose = require('mongoose');

const SafetyReportSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
  },
  reportType: {
    type: String,
    enum: ['harassment', 'unsafe', 'poor_lighting', 'suspicious', 'positive'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: String,
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
  },
  anonymous: { type: Boolean, default: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Geospatial index for location-based queries
SafetyReportSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('SafetyReport', SafetyReportSchema);
