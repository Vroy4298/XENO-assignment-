const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
  // WHY: status acts as a state machine — prevents double-sends
  status: { type: String, enum: ['draft', 'sending', 'sent'], default: 'draft' },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
  },
  sentAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
