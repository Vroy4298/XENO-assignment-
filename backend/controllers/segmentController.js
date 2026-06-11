const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const { generateSegmentQuery, draftCampaignMessage } = require('../services/aiService');

// POST /api/segments/generate
// Takes natural language query → returns mongoQuery + matching customers
const generateSegment = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const { mongoQuery, suggestedName } = await generateSegmentQuery(query);

    // Run the AI-generated filter against real Customer data
    const customers = await Customer.find(mongoQuery).sort({ totalSpend: -1 });

    res.json({
      mongoQuery,
      suggestedName,
      customers,
      count: customers.length,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/segments — save a segment
const createSegment = async (req, res, next) => {
  try {
    const { name, description, naturalLanguageQuery, mongoQuery, customerIds } = req.body;
    const segment = await Segment.create({
      name,
      description,
      naturalLanguageQuery,
      mongoQuery,
      customerIds,
      customerCount: customerIds.length,
    });
    res.status(201).json({ segment });
  } catch (err) {
    next(err);
  }
};

// GET /api/segments — list all segments
const getAllSegments = async (req, res, next) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json({ segments });
  } catch (err) {
    next(err);
  }
};

// GET /api/segments/:id — get segment with its customers
const getSegmentById = async (req, res, next) => {
  try {
    const segment = await Segment.findById(req.params.id).populate('customerIds');
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ segment, customers: segment.customerIds });
  } catch (err) {
    next(err);
  }
};

// POST /api/segments/draft-message — AI message drafting
const draftMessage = async (req, res, next) => {
  try {
    const { segmentDescription, channel } = req.body;
    if (!segmentDescription) return res.status(400).json({ error: 'segmentDescription is required' });

    const message = await draftCampaignMessage(segmentDescription, channel || 'whatsapp');
    res.json({ message });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateSegment, createSegment, getAllSegments, getSegmentById, draftMessage };
