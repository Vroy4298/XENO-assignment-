const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

// POST /api/receipt — called by channel stub when a message status changes
// WHY: Using $inc for atomic increments prevents race conditions when many
// callbacks arrive simultaneously for a large campaign send.
const handleReceipt = async (req, res, next) => {
  try {
    const { messageId, status, timestamp } = req.body;

    if (!messageId || !status) {
      return res.status(400).json({ error: 'messageId and status are required' });
    }

    const log = await CommunicationLog.findOne({ messageId });
    if (!log) {
      // WHY: Return 200 anyway — stub shouldn't retry if we don't know this messageId
      return res.json({ ok: true, note: 'messageId not found, ignoring' });
    }

    // Idempotency & State Machine validation
    // WHY: Defining clear valid transitions ensures we don't double-count events (idempotency),
    // prevents terminal states from transitioning, and ignores invalid progressions (e.g., delivered -> failed).
    const VALID_TRANSITIONS = {
      sent: ['delivered', 'failed', 'opened', 'clicked'],
      delivered: ['opened', 'clicked'],
      opened: ['clicked'],
      failed: [],
      clicked: []
    };

    const currentStatus = log.status;
    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(status)) {
      return res.json({
        ok: true,
        note: `Invalid status transition: cannot go from '${currentStatus}' to '${status}' (already at or beyond this state)`
      });
    }

    // Update the log's status and timestamp
    await CommunicationLog.findByIdAndUpdate(log._id, {
      status,
      [`timestamps.${status}`]: timestamp ? new Date(timestamp) : new Date(),
    });

    // Atomically increment campaign stats
    await Campaign.findByIdAndUpdate(log.campaignId, {
      $inc: { [`stats.${status}`]: 1 },
    });

    console.log(`[RECEIPT] messageId=${messageId} → ${status}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:campaignId — full stats breakdown
const getAnalytics = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId).populate('segmentId', 'name');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const logs = await CommunicationLog.find({ campaignId: campaign._id })
      .populate('customerId', 'name email city')
      .sort({ createdAt: -1 });

    res.json({
      campaign,
      stats: campaign.stats,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleReceipt, getAnalytics };
