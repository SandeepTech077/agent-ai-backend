const Lead = require('../models/Lead');
const { isMongoConnected } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class LeadRepository {
  // Create single lead
  async create(leadData) {
    if (isMongoConnected()) {
      return await Lead.create(leadData);
    } else {
      // In-memory storage
      const lead = {
        _id: uuidv4(),
        ...leadData,
        callCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryStore.leads.push(lead);
      return lead;
    }
  }

  // Create multiple leads
  async createMany(leadsData) {
    if (isMongoConnected()) {
      return await Lead.insertMany(leadsData);
    } else {
      // In-memory storage
      const leads = leadsData.map(leadData => ({
        _id: uuidv4(),
        ...leadData,
        callCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      global.inMemoryStore.leads.push(...leads);
      return leads;
    }
  }

  // Get all leads with optional filters
  async findAll(filters = {}) {
    if (isMongoConnected()) {
      return await Lead.find(filters).sort({ createdAt: -1 });
    } else {
      // In-memory storage
      let leads = [...global.inMemoryStore.leads];
      
      // Apply filters
      if (filters.status) {
        leads = leads.filter(l => l.status === filters.status);
      }
      if (filters.priority) {
        leads = leads.filter(l => l.priority === filters.priority);
      }
      
      // Sort by createdAt descending
      return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  // Get lead by ID
  async findById(id) {
    if (isMongoConnected()) {
      return await Lead.findById(id);
    } else {
      return global.inMemoryStore.leads.find(l => l._id === id);
    }
  }

  // Get lead by phone
  async findByPhone(phone) {
    if (isMongoConnected()) {
      return await Lead.findOne({ phone });
    } else {
      return global.inMemoryStore.leads.find(l => l.phone === phone);
    }
  }

  // Update lead
  async update(id, updateData) {
    if (isMongoConnected()) {
      return await Lead.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      const index = global.inMemoryStore.leads.findIndex(l => l._id === id);
      if (index !== -1) {
        global.inMemoryStore.leads[index] = {
          ...global.inMemoryStore.leads[index],
          ...updateData,
          updatedAt: new Date()
        };
        return global.inMemoryStore.leads[index];
      }
      return null;
    }
  }

  // Delete lead
  async delete(id) {
    if (isMongoConnected()) {
      return await Lead.findByIdAndDelete(id);
    } else {
      const index = global.inMemoryStore.leads.findIndex(l => l._id === id);
      if (index !== -1) {
        const deleted = global.inMemoryStore.leads[index];
        global.inMemoryStore.leads.splice(index, 1);
        return deleted;
      }
      return null;
    }
  }

  // Increment call count
  async incrementCallCount(id) {
    if (isMongoConnected()) {
      return await Lead.findByIdAndUpdate(
        id,
        { 
          $inc: { callCount: 1 },
          lastContactedAt: new Date()
        },
        { new: true }
      );
    } else {
      const lead = await this.findById(id);
      if (lead) {
        return await this.update(id, {
          callCount: (lead.callCount || 0) + 1,
          lastContactedAt: new Date()
        });
      }
      return null;
    }
  }

  // Get statistics
  async getStats() {
    if (isMongoConnected()) {
      const total = await Lead.countDocuments();
      const byStatus = await Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      return { total, byStatus };
    } else {
      const leads = global.inMemoryStore.leads;
      const total = leads.length;
      const statusCounts = {};
      
      leads.forEach(lead => {
        statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
      });
      
      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        _id: status,
        count
      }));
      
      return { total, byStatus };
    }
  }
}

module.exports = new LeadRepository();