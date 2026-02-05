const mongoose = require("mongoose");

const safetyReportSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
  },
  reportType: {
    type: String,
    enum: ['harassment', 'unsafe_area', 'poor_lighting', 'suspicious_activity', 'positive'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  description: String,
  timeOfDay: String,
  anonymous: { type: Boolean, default: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verified: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("SafetyReport", safetyReportSchema);
