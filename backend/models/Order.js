const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: String,
  category: String,  // e.g. "kurta", "denim", "ethnic-wear", "accessories"
  qty: Number,
  price: Number,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  items: [OrderItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
