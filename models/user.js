const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  emergencyContacts: [
    {
      id: String,
      name: String,
      relation: String,
      phone: String,
      group: { type: String, default: 'primary' }, // primary, family, friends, work
    }
  ],
  emergencyMessage: { type: String, default: 'I need help!' },
  
  // Safety Settings
  autoLocationSharing: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  shakeToAlert: { type: Boolean, default: false },
  stealthMode: { type: Boolean, default: false },
  voiceActivation: { type: Boolean, default: false },
  voiceCode: { type: String, default: 'help empower' },
  
  // Advanced Features
  darkMode: { type: Boolean, default: false },
  autoCheckIn: {
    enabled: { type: Boolean, default: false },
    time: String,
    frequency: { type: String, default: 'daily' }, // daily, custom
  },
  
  // Safe Zones
  safeZones: [{
    id: String,
    name: String,
    lat: Number,
    lng: Number,
    radius: { type: Number, default: 100 }, // meters
    notifyOnExit: { type: Boolean, default: false },
    notifyOnEnter: { type: Boolean, default: false },
  }],
  
  // Security
  settingsPin: String,
  disguiseMode: { type: Boolean, default: false },
  disguiseIcon: { type: String, default: 'calculator' },
  
  // Devices & Services
  nfcDevices: [String],
  batteryAlertThreshold: { type: Number, default: 15 },
  
  // Community
  helpNetwork: { type: Boolean, default: false },
  shareAnonymous: { type: Boolean, default: false },
  
  // Stats
  safetyScore: { type: Number, default: 0 },
  totalAlerts: { type: Number, default: 0 },
  totalCheckIns: { type: Number, default: 0 },
  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
