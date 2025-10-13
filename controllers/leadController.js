const leadRepository = require('../repositories/leadRepository');

class LeadController {
  // Get all leads
  async getAllLeads(req, res) {
    try {
      const { status, priority } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const leads = await leadRepository.findAll(filters);

      res.status(200).json({
        success: true,
        count: leads.length,
        data: leads
      });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leads'
      });
    }
  }

  // Get single lead
  async getLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await leadRepository.findById(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Get lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lead'
      });
    }
  }

  // Create new lead
  async createLead(req, res) {
    try {
      const leadData = req.body;

      // Validate required fields
      if (!leadData.name || !leadData.phone) {
        return res.status(400).json({
          success: false,
          message: 'Name and phone are required'
        });
      }

      // Check for duplicate phone
      const existing = await leadRepository.findByPhone(leadData.phone);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Lead with this phone number already exists',
          data: existing
        });
      }

      const lead = await leadRepository.create(leadData);

      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead
      });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lead'
      });
    }
  }

  // Update lead
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lead = await leadRepository.findById(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      // If phone is being updated, check for duplicates
      if (updateData.phone && updateData.phone !== lead.phone) {
        const existing = await leadRepository.findByPhone(updateData.phone);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Another lead with this phone number already exists'
          });
        }
      }

      const updatedLead = await leadRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        data: updatedLead
      });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead'
      });
    }
  }

  // Delete lead
  async deleteLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await leadRepository.findById(id);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      await leadRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lead'
      });
    }
  }

  // Get lead statistics
  async getStats(req, res) {
    try {
      const stats = await leadRepository.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  }
}

module.exports = new LeadController();