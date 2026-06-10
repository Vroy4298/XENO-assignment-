const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  totalSpend: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
