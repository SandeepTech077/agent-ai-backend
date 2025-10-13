const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  leadName: {
    type: String,
    required: true
  },
  leadPhone: {
    type: String,
    required: true
  },
  vapiCallId: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['Queued', 'Ringing', 'In Progress', 'Completed', 'Failed', 'No Answer', 'Busy'],
    default: 'Queued'
  },
  outcome: {
    type: String,
    enum: ['Interested', 'Not Interested', 'Callback', 'Appointment Booked', 'No Answer', 'Wrong Number', 'Other'],
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  transcript: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  appointmentScheduled: {
    type: Boolean,
    default: false
  },
  appointmentDate: {
    type: Date
  },
  recordingUrl: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
callSchema.index({ leadId: 1 });
callSchema.index({ vapiCallId: 1 });
callSchema.index({ status: 1 });
callSchema.index({ createdAt: -1 });

const Call = mongoose.model('Call', callSchema);

module.exports = Call;