const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledTime: { type: Date, required: true },
  checkInTime: Date,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed', 'auto_alert'],
    default: 'pending'
  },
  notes: String,
  autoAlertSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CheckIn', CheckInSchema);
