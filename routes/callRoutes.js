const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// Start a new call
router.post('/start', callController.startCall.bind(callController));

// Get all calls
router.get('/', callController.getAllCalls.bind(callController));

// Get call statistics
router.get('/stats', callController.getStats.bind(callController));

// Get single call
router.get('/:id', callController.getCall.bind(callController));

// Webhook endpoint for vapi.ai
router.post('/webhook', callController.handleWebhook.bind(callController));

module.exports = router;