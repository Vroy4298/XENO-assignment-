const express = require('express');
const router = express.Router();
const { handleReceipt, getAnalytics } = require('../controllers/receiptController');

// POST /api/receipt — channel stub callback
router.post('/', handleReceipt);

// GET /api/receipt/analytics/:campaignId — full stats (mounted here for simplicity)
router.get('/analytics/:campaignId', getAnalytics);

module.exports = router;
