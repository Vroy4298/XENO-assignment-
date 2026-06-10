const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  naturalLanguageQuery: { type: String, required: true },
  // WHY: We store the raw mongoQuery as Mixed so any valid filter object can be saved
  mongoQuery: { type: mongoose.Schema.Types.Mixed, required: true },
  customerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
  customerCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Segment', SegmentSchema);
