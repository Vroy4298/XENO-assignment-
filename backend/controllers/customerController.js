const Customer = require('../models/Customer');
const Order = require('../models/Order');

// GET /api/customers — list all with optional filters
const getAllCustomers = async (req, res, next) => {
  try {
    const { city, minSpend, maxSpend, tag, search } = req.query;
    const filter = {};

    if (city) filter.city = city;
    if (minSpend || maxSpend) {
      filter.totalSpend = {};
      if (minSpend) filter.totalSpend.$gte = Number(minSpend);
      if (maxSpend) filter.totalSpend.$lte = Number(maxSpend);
    }
    if (tag) filter.tags = tag;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const customers = await Customer.find(filter).sort({ totalSpend: -1 });
    res.json({ customers, total: customers.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id — single customer with their orders
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const orders = await Order.find({ customerId: customer._id }).sort({ date: -1 });
    res.json({ customer, orders });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers — create new customer
const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ customer });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCustomers, getCustomerById, createCustomer };
