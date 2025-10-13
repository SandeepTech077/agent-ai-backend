const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// Get lead statistics
router.get('/stats', leadController.getStats.bind(leadController));

// Get all leads
router.get('/', leadController.getAllLeads.bind(leadController));

// Get single lead
router.get('/:id', leadController.getLead.bind(leadController));

// Create new lead
router.post('/', leadController.createLead.bind(leadController));

// Update lead
router.put('/:id', leadController.updateLead.bind(leadController));

// Delete lead
router.delete('/:id', leadController.deleteLead.bind(leadController));

module.exports = router;