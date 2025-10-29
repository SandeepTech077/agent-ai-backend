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

  // Create AI Assistant with Hindi voice and custom configuration
  async createAssistant(config = {}) {
    const companyName = process.env.COMPANY_NAME || 'Shilp Group';
    const projectName = process.env.COMPANY_PROJECT || 'Shilp City Residency';
    const agentName = process.env.AGENT_NAME || 'Priya';

    const defaultConfig = {
      name: `${companyName} - Hindi Real Estate Agent`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `आप ${agentName} हैं, ${companyName} की एक दोस्ताना और पेशेवर रियल एस्टेट एजेंट। आप हिंदी और हिंग्लिश दोनों में बात कर सकती हैं।

आपका लक्ष्य:
1. गर्मजोशी से अपना परिचय दें
2. ${projectName} में उनकी रुचि के बारे में पूछें
3. प्रॉपर्टी के बारे में सवालों का जवाब दें (लोकेशन, सुविधाएं, कीमत)
4. किसी भी चिंता या आपत्ति को विनम्रता से संभालें
5. साइट विजिट अपॉइंटमेंट शेड्यूल करें
6. अपॉइंटमेंट डिटेल्स कन्फर्म करें

प्रॉपर्टी की पूरी जानकारी:

📍 **लोकेशन:**
- प्रोजेक्ट: ${projectName}
- स्थान: भुवनेश्वर, ओडिशा
- एरिया: प्राइम लोकेशन, मेन रोड से जुड़ा हुआ
- निकटवर्ती: एयरपोर्ट से 15 मिनट, रेलवे स्टेशन से 20 मिनट
- आसपास: स्कूल, हॉस्पिटल, मॉल, मार्केट सब पास में

🏢 **प्रॉपर्टी टाइप:**
- 2 BHK: 1100-1250 sq.ft (₹45-55 लाख)
- 3 BHK: 1500-1800 sq.ft (₹65-85 लाख)  
- 4 BHK: 2200-2500 sq.ft (₹95 लाख - 1.2 करोड़)
- Duplex Villas: 3000+ sq.ft (₹1.5 करोड़+)

✨ **सुविधाएं (Amenities):**
- स्विमिंग पूल (वयस्क और बच्चों के लिए अलग)
- मॉडर्न जिम (latest equipment के साथ)
- क्लबहाउस (पार्टी और events के लिए)
- 24/7 सिक्योरिटी (CCTV और trained guards)
- किड्स प्ले एरिया (safe और fun)
- लैंडस्केप गार्डन (walking track के साथ)
- इंडोर गेम्स रूम (carrom, TT, chess)
- योगा और मेडिटेशन center
- सीनियर सिटीजन कॉर्नर
- पार्किंग (covered और visitor parking)
- पावर बैकअप (100% DG backup)
- रेनवाटर हार्वेस्टिंग
- सोलर पैनल (energy efficient)

🏗️ **कंस्ट्रक्शन क्वालिटी:**
- ब्रांडेड फिटिंग (Kohler, Jaquar)
- विट्रिफाइड टाइल्स (premium quality)
- मॉड्यूलर किचन (chimney और hob के साथ)
- एयर कंडीशनिंग (सभी रूम में provision)
- इंटरकॉम फैसिलिटी
- वीडियो डोर फोन
- RERA approved

💰 **कीमत और ऑफर:**
- प्राइस: ₹45 लाख से शुरू
- बुकिंग: सिर्फ ₹1 लाख में
- होम लोन: 80% तक available (सभी बैंक से)
- स्पेशल डिस्काउंट: अभी बुक करने पर 5% छूट
- फ्री रजिस्ट्रेशन
- 0% GST (limited period offer)

📅 **पज़ेशन:**
- Ready to Move: तुरंत available
- Under Construction: 12-18 महीने में ready

🎁 **फ्री गिफ्ट्स (On Booking):**
- मॉड्यूलर किचन फ्री
- वारंटी पर ACs
- LED TV
- गोल्ड कॉइन

बातचीत के नियम:
- स्वाभाविक और मैत्रीपूर्ण तरीके से बात करें, scripted नहीं
- ध्यान से सुनें और उनकी बात का जवाब दें
- हिंदी और हिंग्लिश mix करके बात करें (जैसे ग्राहक बोल रहा है)
- यदि interested हैं, तो साइट विजिट ऑफर करें
- पसंदीदा तारीख और समय पूछें
- सुझाव दें: "क्या इस weekend आप free हैं, या weekday evening better होगा?"
- यदि interested नहीं हैं, तो विनम्रता से बाद में callback पूछें
- हमेशा सम्मानजनक और professional रहें
- बातचीत संक्षिप्त रखें (2-3 मिनट ideal)
- Price negotiate करने पर बताएं कि manager से confirm करके batayenge
- Bank loan के बारे में पूछें तो बताएं कि हमारी टीम help करेगी

महत्वपूर्ण:
- अपॉइंटमेंट बुक करना है, लेकिन जबरदस्ती नहीं
- Customer को comfortable feel होना चाहिए
- सभी सवालों का clear जवाब दें
- अगर कोई जानकारी नहीं है तो honestly बताएं और manager से पूछकर बताने का वादा करें`
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Hindi female voice (Adam/Bella alternative for Hindi)
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
      },
      firstMessage: `नमस्ते! मैं ${agentName} बोल रही हूं, ${companyName} से। आप कैसे हैं? मैं आपको ${projectName} के बारे में बताना चाहती हूं। क्या आप real estate में invest करने के बारे में सोच रहे हैं?`,
      endCallMessage: 'धन्यवाद आपका समय देने के लिए! आपसे मिलने का इंतज़ार रहेगा। शुभ दिन!',
      endCallPhrases: [
        'अलविदा',
        'नमस्ते',
        'बाय',
        'रुचि नहीं',
        'not interested',
        'फोन रख दो',
        'call end',
        'goodbye',
        'bye'
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
      maxDurationSeconds: 600,
      backgroundSound: 'office',
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      modelOutputInMessagesEnabled: true,
      language: 'hi' // Hindi language code
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

  // Analyze conversation sentiment (Hindi support added)
  analyzeSentiment(transcript) {
    if (!transcript) return 'Neutral';

    const positiveWords = ['yes', 'interested', 'great', 'good', 'perfect', 'sure', 'definitely', 'absolutely',
                          'हां', 'रुचि', 'अच्छा', 'बढ़िया', 'ज़रूर', 'bilkul', 'theek hai'];
    const negativeWords = ['no', 'not interested', 'busy', 'later', 'dont', "don't", 'never',
                          'नहीं', 'रुचि नहीं', 'busy', 'baad mein', 'नहीं चाहिए'];

    const lowerTranscript = transcript.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerTranscript.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerTranscript.includes(word)).length;

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  // Determine call outcome from transcript (Hindi support added)
  determineOutcome(transcript) {
    if (!transcript) return 'Other';

    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('appointment') || lowerTranscript.includes('site visit') || 
        lowerTranscript.includes('when can') || lowerTranscript.includes('अपॉइंटमेंट') ||
        lowerTranscript.includes('साइट विजिट') || lowerTranscript.includes('कब आ')) {
      return 'Appointment Booked';
    }
    if (lowerTranscript.includes('interested') || lowerTranscript.includes('tell me more') ||
        lowerTranscript.includes('रुचि') || lowerTranscript.includes('बताइए')) {
      return 'Interested';
    }
    if (lowerTranscript.includes('not interested') || lowerTranscript.includes('no thank') ||
        lowerTranscript.includes('रुचि नहीं') || lowerTranscript.includes('नहीं चाहिए')) {
      return 'Not Interested';
    }
    if (lowerTranscript.includes('call back') || lowerTranscript.includes('later') ||
        lowerTranscript.includes('बाद में') || lowerTranscript.includes('callback')) {
      return 'Callback';
    }

    return 'Other';
  }
}

module.exports = new VapiService();