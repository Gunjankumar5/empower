const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  
  // Advanced tracking
  locationTrail: [{
    lat: Number,
    lng: Number,
    timestamp: Date,
  }],
  alertType: {
    type: String,
    enum: ['manual', 'shake', 'voice', 'timer', 'stealth', 'nfc'],
    default: 'manual'
  },
  alertLevel: {
    type: String,
    enum: ['warning', 'urgent', 'critical'],
    default: 'urgent'
  },
  
  // Contacts response
  contactResponses: [{
    contactId: mongoose.Schema.Types.ObjectId,
    name: String,
    phone: String,
    acknowledged: Boolean,
    acknowledgedAt: Date,
    response: String,
  }],
  
  // Media
  audioRecording: String,
  videoRecording: String,
  photos: [String],
  
  // Device info
  batteryLevel: Number,
  networkStatus: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  
  // Resolution
  status: {
    type: String,
    enum: ['active', 'resolved', 'false-alarm'],
    default: 'active'
  },
  resolvedAt: Date,
  resolutionNotes: String,
  
  // Metadata
  metadata: {},
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Incident', IncidentSchema);
