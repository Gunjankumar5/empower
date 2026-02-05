const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  lat: { type: Number },
  lng: { type: Number },
  address: { type: String },
});

const EmergencySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    location: { type: LocationSchema },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending' },
    source: { type: String, enum: ['online', 'offline'], default: 'online' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Emergency', EmergencySchema);