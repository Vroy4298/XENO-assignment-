const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  sendCampaign,
} = require('../controllers/campaignController');

router.post('/', createCampaign);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);
router.post('/:id/send', sendCampaign);

module.exports = router;
