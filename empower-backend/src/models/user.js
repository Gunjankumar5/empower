const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    relation: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },
    profilePic: { type: String, default: '' },
    nfcTagId: { type: String, default: '', index: true, sparse: true },
    emergencyContacts: { type: [EmergencyContactSchema], default: [] },
    lastKnownLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    },
    safe_zones: [
      {
        id: { type: String, default: () => require('crypto').randomBytes(12).toString('hex') },
        name: { type: String, required: true, trim: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        radius: { type: Number, required: true, min: 100, max: 50000 }, // meters
        createdAt: { type: Date, default: Date.now },
      },
    ],
    fcmTokens: { type: [String], default: [] },
    safetyScore: { type: Number, default: 100 },
    totalAlerts: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.pre('save', function setUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema);
