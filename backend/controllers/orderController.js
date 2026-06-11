const Order = require('../models/Order');

// GET /api/orders — list all orders
const getAllOrders = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const filter = customerId ? { customerId } : {};
    const orders = await Order.find(filter).populate('customerId', 'name email city').sort({ date: -1 });
    res.json({ orders, total: orders.length });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders — create order
const createOrder = async (req, res, next) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllOrders, createOrder };
