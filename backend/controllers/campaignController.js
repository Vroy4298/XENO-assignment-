const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');

// POST /api/campaigns — create a new campaign
const createCampaign = async (req, res, next) => {
  try {
    const { name, segmentId, message, channel } = req.body;
    const campaign = await Campaign.create({ name, segmentId, message, channel });
    res.status(201).json({ campaign });
  } catch (err) {
    next(err);
  }
};

// GET /api/campaigns — list all campaigns with segment info
const getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name customerCount')
      .sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
};

// GET /api/campaigns/:id — campaign detail with logs
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segmentId');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const logs = await CommunicationLog.find({ campaignId: campaign._id })
      .populate('customerId', 'name email phone city')
      .sort({ createdAt: -1 });

    res.json({ campaign, logs });
  } catch (err) {
    next(err);
  }
};

// POST /api/campaigns/:id/send — fire the campaign
// WHY: We set status to 'sending' first to prevent double-sends (idempotency guard).
// Each recipient gets a unique UUID messageId so callbacks can be matched back.
const sendCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('segmentId');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Idempotency guard — don't re-fire a campaign that's already sending/sent
    if (campaign.status !== 'draft') {
      return res.status(400).json({ error: `Campaign is already in '${campaign.status}' state` });
    }

    await Campaign.findByIdAndUpdate(campaign._id, { status: 'sending', sentAt: new Date() });

    // Resolve customers for this segment
    const segment = await Segment.findById(campaign.segmentId);
    const customers = await Customer.find({ _id: { $in: segment.customerIds } });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'Segment has no customers' });
    }

    // Fire off messages — don't await, respond immediately
    // WHY: We respond 200 right away, callbacks update stats asynchronously
    res.json({ success: true, recipientCount: customers.length });

    const stubUrl = process.env.CHANNEL_STUB_URL || 'http://localhost:4000';

    // WHY: Bulk prepare log entries and updates to avoid hundreds of sequential database roundtrips
    const logs = [];
    const stubPayloads = [];

    for (const customer of customers) {
      const messageId = uuidv4();
      logs.push({
        campaignId: campaign._id,
        customerId: customer._id,
        messageId,
        channel: campaign.channel,
        status: 'sent',
        timestamps: { sent: new Date() },
      });
      stubPayloads.push({
        messageId,
        customer,
      });
    }

    try {
      // 1. Bulk insert all communication logs
      await CommunicationLog.insertMany(logs);

      // 2. Increment campaign sent count by customers.length in one single update
      await Campaign.findByIdAndUpdate(campaign._id, {
        $inc: { 'stats.sent': customers.length }
      });

      // 3. Mark campaign as fully sent
      await Campaign.findByIdAndUpdate(campaign._id, { status: 'sent' });

      // 4. Call the channel stub — fire and forget per recipient
      for (const payload of stubPayloads) {
        axios.post(`${stubUrl}/send`, {
          messageId: payload.messageId,
          recipient: {
            customerId: payload.customer._id.toString(),
            name: payload.customer.name,
            email: payload.customer.email,
            phone: payload.customer.phone,
          },
          message: campaign.message,
          channel: campaign.channel,
        }).catch((err) => {
          // WHY: Log but don't crash — stub might be temporarily unavailable
          console.error(`[STUB] Failed to reach stub for messageId ${payload.messageId}:`, err.message);
        });
      }
    } catch (dbErr) {
      console.error('[DATABASE ERROR during campaign send]', dbErr.message);
    }

  } catch (err) {
    next(err);
  }
};

module.exports = { createCampaign, getAllCampaigns, getCampaignById, sendCampaign };
