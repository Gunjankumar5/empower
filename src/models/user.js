const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  emergencyContacts: [{
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    relation: String,
    phone: String,
  }],
  
  // Safety Features
  autoLocationSharing: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  shakeToAlert: { type: Boolean, default: false },
  stealthMode: { type: Boolean, default: false },
  voiceActivation: { type: Boolean, default: false },
  voiceCode: { type: String, default: 'help empower' },
  darkMode: { type: Boolean, default: false },
  autoCheckIn: { type: Boolean, default: false },
  batteryAlertThreshold: { type: Number, default: 15 },
  helpNetwork: [mongoose.Schema.Types.ObjectId],
  shareAnonymous: { type: Boolean, default: false },
  
  // Advanced Features
  safeZones: [{
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    lat: Number,
    lng: Number,
    radius: Number,
    notifyOnExit: Boolean,
    notifyOnEnter: Boolean,
  }],
  settingsPin: String,
  disguiseMode: { type: Boolean, default: false },
  nfcDevices: [String],
  
  // Analytics
  safetyScore: { type: Number, default: 100 },
  totalAlerts: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
