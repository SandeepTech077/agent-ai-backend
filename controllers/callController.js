const vapiService = require('../services/vapiService');
const leadRepository = require('../repositories/leadRepository');
const callRepository = require('../repositories/callRepository');

class CallController {
  // Start a new call
  async startCall(req, res) {
    try {
      const { leadId, customMessage } = req.body;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: 'Lead ID is required'
        });
      }

      // Get lead details
      const lead = await leadRepository.findById(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      // Create call record
      const callRecord = await callRepository.create({
        leadId: lead._id,
        leadName: lead.name,
        leadPhone: lead.phone,
        status: 'Queued',
        startTime: new Date()
      });

      // Make call via vapi.ai
      try {
        const vapiCall = await vapiService.makeCall(lead, customMessage);
        
        // Update call record with vapi call ID
        await callRepository.update(callRecord._id, {
          vapiCallId: vapiCall.id,
          status: 'Ringing'
        });

        // Increment lead call count
        await leadRepository.incrementCallCount(leadId);

        res.status(200).json({
          success: true,
          message: 'Call initiated successfully',
          data: {
            callId: callRecord._id,
            vapiCallId: vapiCall.id,
            leadName: lead.name,
            leadPhone: lead.phone,
            status: 'Ringing'
          }
        });
      } catch (vapiError) {
        // Update call record as failed
        await callRepository.update(callRecord._id, {
          status: 'Failed',
          endTime: new Date()
        });

        throw vapiError;
      }
    } catch (error) {
      console.error('Start call error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start call'
      });
    }
  }

  // Get all calls
  async getAllCalls(req, res) {
    try {
      const { leadId, status } = req.query;
      
      const filters = {};
      if (leadId) filters.leadId = leadId;
      if (status) filters.status = status;

      const calls = await callRepository.findAll(filters);

      res.status(200).json({
        success: true,
        count: calls.length,
        data: calls
      });
    } catch (error) {
      console.error('Get calls error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calls'
      });
    }
  }

  // Get single call details
  async getCall(req, res) {
    try {
      const { id } = req.params;

      const call = await callRepository.findById(id);
      if (!call) {
        return res.status(404).json({
          success: false,
          message: 'Call not found'
        });
      }

      res.status(200).json({
        success: true,
        data: call
      });
    } catch (error) {
      console.error('Get call error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch call'
      });
    }
  }

  // Handle vapi.ai webhook
  async handleWebhook(req, res) {
    try {
      const webhookData = req.body;
      console.log('📨 Received webhook:', JSON.stringify(webhookData, null, 2));

      // Process webhook data
      const processed = vapiService.processWebhook(webhookData);

      // Find call by vapi call ID
      const call = await callRepository.findByVapiId(processed.callId);
      if (!call) {
        console.warn('Call not found for vapi ID:', processed.callId);
        return res.status(200).json({ received: true });
      }

      // Update call based on webhook type
      const updates = {};

      if (processed.type === 'status-update') {
        updates.status = this.mapVapiStatus(processed.status);
      }

      if (processed.type === 'end-of-call-report') {
        updates.status = 'Completed';
        updates.endTime = new Date();
        updates.duration = processed.duration || 0;
        updates.transcript = processed.transcript || '';
        updates.summary = processed.summary || '';
        updates.recordingUrl = processed.recordingUrl || '';

        // Analyze conversation
        updates.sentiment = vapiService.analyzeSentiment(processed.transcript);
        updates.outcome = vapiService.determineOutcome(processed.transcript);

        // Check if appointment was booked
        if (processed.appointmentData) {
          updates.appointmentScheduled = true;
          updates.appointmentDate = processed.appointmentData.date;
        }

        // Update lead status based on outcome
        if (updates.outcome === 'Appointment Booked') {
          await leadRepository.update(call.leadId, {
            status: 'Appointment Booked'
          });
        } else if (updates.outcome === 'Interested') {
          await leadRepository.update(call.leadId, {
            status: 'Interested'
          });
        } else if (updates.outcome === 'Not Interested') {
          await leadRepository.update(call.leadId, {
            status: 'Not Interested'
          });
        }
      }

      // Update call record
      await callRepository.updateByVapiId(processed.callId, updates);

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(200).json({ received: true }); // Always return 200 to vapi
    }
  }

  // Get call statistics
  async getStats(req, res) {
    try {
      const stats = await callRepository.getStats();

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

  // Map vapi status to our status
  mapVapiStatus(vapiStatus) {
    const statusMap = {
      'queued': 'Queued',
      'ringing': 'Ringing',
      'in-progress': 'In Progress',
      'forwarding': 'In Progress',
      'ended': 'Completed'
    };

    return statusMap[vapiStatus] || 'In Progress';
  }
}

module.exports = new CallController();