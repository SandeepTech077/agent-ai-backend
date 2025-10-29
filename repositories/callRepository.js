const Call = require('../models/Call');
const { isMongoConnected } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CallRepository {
  // Ensure in-memory store exists
  _ensureInMemoryStore() {
    if (!global.inMemoryStore) {
      global.inMemoryStore = {
        leads: [],
        calls: [],
        appointments: []
      };
    }
  }

  // Create call
  async create(callData) {
    if (isMongoConnected()) {
      return await Call.create(callData);
    } else {
      this._ensureInMemoryStore();
      const call = {
        _id: uuidv4(),
        ...callData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      global.inMemoryStore.calls.push(call);
      return call;
    }
  }

  // Get all calls
  async findAll(filters = {}) {
    if (isMongoConnected()) {
      return await Call.find(filters)
        .populate('leadId', 'name phone email')
        .sort({ createdAt: -1 });
    } else {
      this._ensureInMemoryStore();
      let calls = [...global.inMemoryStore.calls];
      
      // Apply filters
      if (filters.leadId) {
        calls = calls.filter(c => c.leadId === filters.leadId);
      }
      if (filters.status) {
        calls = calls.filter(c => c.status === filters.status);
      }
      
      return calls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  // Get call by ID
  async findById(id) {
    if (isMongoConnected()) {
      return await Call.findById(id).populate('leadId', 'name phone email');
    } else {
      this._ensureInMemoryStore();
      return global.inMemoryStore.calls.find(c => c._id === id);
    }
  }

  // Get call by vapi call ID
  async findByVapiId(vapiCallId) {
    if (isMongoConnected()) {
      return await Call.findOne({ vapiCallId });
    } else {
      this._ensureInMemoryStore();
      return global.inMemoryStore.calls.find(c => c.vapiCallId === vapiCallId);
    }
  }

  // Update call
  async update(id, updateData) {
    if (isMongoConnected()) {
      return await Call.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    } else {
      this._ensureInMemoryStore();
      const index = global.inMemoryStore.calls.findIndex(c => c._id === id);
      if (index !== -1) {
        global.inMemoryStore.calls[index] = {
          ...global.inMemoryStore.calls[index],
          ...updateData,
          updatedAt: new Date()
        };
        return global.inMemoryStore.calls[index];
      }
      return null;
    }
  }

  // Update by vapi call ID
  async updateByVapiId(vapiCallId, updateData) {
    if (isMongoConnected()) {
      return await Call.findOneAndUpdate(
        { vapiCallId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
    } else {
      this._ensureInMemoryStore();
      const index = global.inMemoryStore.calls.findIndex(c => c.vapiCallId === vapiCallId);
      if (index !== -1) {
        global.inMemoryStore.calls[index] = {
          ...global.inMemoryStore.calls[index],
          ...updateData,
          updatedAt: new Date()
        };
        return global.inMemoryStore.calls[index];
      }
      return null;
    }
  }

  // Get calls by lead ID
  async findByLeadId(leadId) {
    if (isMongoConnected()) {
      return await Call.find({ leadId }).sort({ createdAt: -1 });
    } else {
      this._ensureInMemoryStore();
      return global.inMemoryStore.calls
        .filter(c => c.leadId === leadId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  // Get statistics
  async getStats() {
    if (isMongoConnected()) {
      const total = await Call.countDocuments();
      const byStatus = await Call.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const byOutcome = await Call.aggregate([
        { $match: { outcome: { $ne: null } } },
        { $group: { _id: '$outcome', count: { $sum: 1 } } }
      ]);
      
      const avgDuration = await Call.aggregate([
        { $match: { duration: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } }
      ]);
      
      return {
        total,
        byStatus,
        byOutcome,
        avgDuration: avgDuration[0]?.avg || 0
      };
    } else {
      const calls = global.inMemoryStore.calls;
      const total = calls.length;
      
      const statusCounts = {};
      const outcomeCounts = {};
      let totalDuration = 0;
      let durationCount = 0;
      
      calls.forEach(call => {
        statusCounts[call.status] = (statusCounts[call.status] || 0) + 1;
        
        if (call.outcome) {
          outcomeCounts[call.outcome] = (outcomeCounts[call.outcome] || 0) + 1;
        }
        
        if (call.duration > 0) {
          totalDuration += call.duration;
          durationCount++;
        }
      });
      
      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        _id: status,
        count
      }));
      
      const byOutcome = Object.entries(outcomeCounts).map(([outcome, count]) => ({
        _id: outcome,
        count
      }));
      
      return {
        total,
        byStatus,
        byOutcome,
        avgDuration: durationCount > 0 ? totalDuration / durationCount : 0
      };
    }
  }
}

module.exports = new CallRepository();