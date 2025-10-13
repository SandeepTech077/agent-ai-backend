const axios = require('axios');

class VapiService {
  constructor() {
    this.apiKey = process.env.VAPI_API_KEY;
    this.baseURL = 'https://api.vapi.ai';
    this.phoneNumberId = process.env.VAPI_PHONE_NUMBER;
    this.assistantId = process.env.VAPI_ASSISTANT_ID;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Create AI Assistant with custom configuration
  async createAssistant(config = {}) {
    const companyName = process.env.COMPANY_NAME || 'Shilp Group';
    const projectName = process.env.COMPANY_PROJECT || 'Shilp City Residency';
    const agentName = process.env.AGENT_NAME || 'Priya';

    const defaultConfig = {
      name: `${companyName} - Real Estate Agent`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are ${agentName}, a friendly and professional real estate agent from ${companyName}. 

Your goal is to:
1. Introduce yourself warmly
2. Ask about their interest in ${projectName}
3. Handle questions about the property (location, amenities, pricing)
4. Address any concerns or objections politely
5. Schedule a site visit appointment
6. Confirm the appointment details

Property Details:
- Name: ${projectName}
- Location: Bhubaneswar, Odisha
- Type: Luxury Apartments (2BHK, 3BHK, 4BHK)
- Amenities: Swimming pool, Gym, Clubhouse, 24/7 Security, Kids Play Area, Landscaped Gardens
- Price Range: Starting from ₹50 Lakhs
- Possession: Ready to Move & Under Construction options available

Guidelines:
- Be conversational and natural, not scripted
- Listen actively and respond to what they say
- If they're interested, offer to schedule a site visit
- Ask about their preferred date and time
- For appointments, suggest: "Would this weekend work, or would you prefer a weekday evening?"
- If they're not interested, politely ask if they'd like a callback later
- Always be respectful and professional
- Keep the conversation concise (2-3 minutes ideal)

Remember: Your goal is to book appointments, but be helpful and not pushy.`
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: config.voiceId || 'default'
      },
      firstMessage: `Hello! This is ${agentName} calling from ${companyName}. How are you doing today?`,
      endCallMessage: 'Thank you for your time! Looking forward to seeing you. Have a great day!',
      endCallPhrases: [
        'goodbye',
        'bye',
        'not interested',
        'hang up',
        'end call'
      ],
      recordingEnabled: true,
      hipaaEnabled: false,
      clientMessages: [
        'transcript',
        'hang',
        'function-call',
        'speech-update',
        'metadata',
        'conversation-update'
      ],
      serverMessages: [
        'end-of-call-report',
        'status-update',
        'hang',
        'function-call'
      ],
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600, // 10 minutes max
      backgroundSound: 'office',
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      modelOutputInMessagesEnabled: true
    };

    try {
      const response = await this.client.post('/assistant', {
        ...defaultConfig,
        ...config
      });
      return response.data;
    } catch (error) {
      console.error('Error creating assistant:', error.response?.data || error.message);
      throw error;
    }
  }

  // Make an outbound call
  async makeCall(leadData, customMessage = null) {
    try {
      const payload = {
        phoneNumberId: this.phoneNumberId,
        assistantId: this.assistantId,
        customer: {
          number: leadData.phone,
          name: leadData.name,
          ...(leadData.email && { email: leadData.email })
        }
      };

      // Override first message if custom message provided
      if (customMessage) {
        payload.assistantOverrides = {
          firstMessage: customMessage
        };
      }

      console.log('📞 Initiating call to:', leadData.phone);
      
      const response = await this.client.post('/call/phone', payload);
      
      console.log('✅ Call initiated successfully:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Error making call:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate call');
    }
  }

  // Get call details
  async getCall(callId) {
    try {
      const response = await this.client.get(`/call/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get call recording URL
  async getRecording(callId) {
    try {
      const response = await this.client.get(`/call/${callId}/recording`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recording:', error.response?.data || error.message);
      return null;
    }
  }

  // Process webhook from vapi.ai
  processWebhook(webhookData) {
    const { type, call } = webhookData;
    
    const processed = {
      type,
      callId: call?.id,
      status: call?.status,
      duration: call?.duration,
      endedReason: call?.endedReason,
      transcript: call?.transcript,
      summary: call?.summary,
      recordingUrl: call?.recordingUrl,
      cost: call?.cost
    };

    // Extract appointment information from transcript or function calls
    if (webhookData.functionCall?.name === 'scheduleAppointment') {
      processed.appointmentData = webhookData.functionCall.parameters;
    }

    return processed;
  }

  // Analyze conversation sentiment
  analyzeSentiment(transcript) {
    if (!transcript) return 'Neutral';

    const positiveWords = ['yes', 'interested', 'great', 'good', 'perfect', 'sure', 'definitely', 'absolutely'];
    const negativeWords = ['no', 'not interested', 'busy', 'later', 'dont', "don't", 'never'];

    const lowerTranscript = transcript.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerTranscript.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerTranscript.includes(word)).length;

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  // Determine call outcome from transcript
  determineOutcome(transcript) {
    if (!transcript) return 'Other';

    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('appointment') || lowerTranscript.includes('site visit') || lowerTranscript.includes('when can')) {
      return 'Appointment Booked';
    }
    if (lowerTranscript.includes('interested') || lowerTranscript.includes('tell me more')) {
      return 'Interested';
    }
    if (lowerTranscript.includes('not interested') || lowerTranscript.includes('no thank')) {
      return 'Not Interested';
    }
    if (lowerTranscript.includes('call back') || lowerTranscript.includes('later')) {
      return 'Callback';
    }

    return 'Other';
  }
}

module.exports = new VapiService();