const express = require('express');
const router = express.Router();
const {
  generateSegment,
  createSegment,
  getAllSegments,
  getSegmentById,
  draftMessage,
} = require('../controllers/segmentController');

// WHY: /generate and /draft-message come before /:id to avoid Express
// interpreting "generate" as a MongoDB ObjectId parameter
router.post('/generate', generateSegment);
router.post('/draft-message', draftMessage);
router.get('/', getAllSegments);
router.post('/', createSegment);
router.get('/:id', getSegmentById);

module.exports = router;
