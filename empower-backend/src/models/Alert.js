const mongoose = require('mongoose');

const NotifiedContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
    error: { type: String, default: '' },
  },
  { _id: false }
);

const AlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: '' },
    },
    locationTrail: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        accuracy: { type: Number, default: null },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['sos', 'nfc', 'manual'], default: 'sos' },
    notifiedContacts: { type: [NotifiedContactSchema], default: [] },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);