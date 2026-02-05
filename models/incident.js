const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, default: "Emergency SOS Alert!" },
  
  // Location Tracking
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  locationTrail: [{
    lat: Number,
    lng: Number,
    timestamp: { type: Date, default: Date.now },
  }],
  
  // Alert Details
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
  status: { 
    type: String, 
    enum: ['pending', 'acknowledged', 'resolved', 'false_alarm'],
    default: "pending" 
  },
  
  // Contact Response
  contactResponses: [{
    contactId: String,
    contactName: String,
    acknowledged: Boolean,
    acknowledgedAt: Date,
    location: { lat: Number, lng: Number },
    eta: Number, // minutes
  }],
  
  // Media
  audioRecording: String, // URL
  videoRecording: String, // URL
  photos: [String],
  
  // Device Info
  batteryLevel: Number,
  networkStatus: String,
  
  // Resolution
  resolvedAt: Date,
  resolvedBy: String,
  resolutionNotes: String,
  
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model("Incident", incidentSchema);
