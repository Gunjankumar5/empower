const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  userId: { type: String, required: false },
  question: { type: String, required: true },
  details: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Query', QuerySchema);
