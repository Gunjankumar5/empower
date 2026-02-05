const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduledTime: { type: Date, required: true },
  checkInTime: Date,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'missed', 'auto_alert'],
    default: 'pending'
  },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  notes: String,
  autoAlertSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("CheckIn", checkInSchema);
