const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Not Interested', 'Callback', 'Appointment Booked', 'Closed'],
    default: 'New'
  },
  budget: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    default: 'Excel Import'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  notes: {
    type: String,
    trim: true
  },
  lastContactedAt: {
    type: Date
  },
  callCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;