const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  callId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Call'
  },
  leadName: {
    type: String,
    required: true
  },
  leadPhone: {
    type: String,
    required: true
  },
  leadEmail: {
    type: String
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    default: process.env.COMPANY_PROJECT || 'Shilp City Residency'
  },
  propertyAddress: {
    type: String,
    default: 'Bhubaneswar, Odisha'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
    default: 'Scheduled'
  },
  notes: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ leadId: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;