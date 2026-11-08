import { GoogleGenAI, Type } from '@google/genai';
import {
  IncidentCategory,
  PriorityLevel,
  IncidentClassificationResult,
  classifyIncidentDeterministic,
} from '../utils/incidentLogic';

let genAI: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

/**
 * AI-powered incident classification using Gemini 3.8 Flash
 * with graceful deterministic fallback
 */
export async function classifyIncidentWithAI(
  description: string,
  location?: string,
  userSelectedCategory?: string
): Promise<IncidentClassificationResult> {
  const ai = getGeminiClient();

  if (!ai) {
    // API Key not present; use deterministic fallback immediately
    return classifyIncidentDeterministic(description, userSelectedCategory);
  }

  try {
    const prompt = `You are the AI Incident Classification Engine for Godavari Raksha, the public safety coordination platform for Godavari Pushkaralu 2027 in Andhra Pradesh.
Analyze the following emergency report submitted by a pilgrim or volunteer:

Incident Description: "${description}"
Location: "${location || 'Godavari Ghat Area'}"
User-tagged category: "${userSelectedCategory || 'Unspecified'}"

Categorize this emergency strictly into one of:
- Medical emergency
- Missing person
- Crowd congestion
- Fire emergency
- Accident
- Public safety threat
- Lost child
- Other emergency

Assign a priority level strictly from:
- Critical (immediate threat to life, drowning, cardiac arrest, active stampede crush, raging fire)
- High (lost child, severe injury, extreme bottleneck, high current drift)
- Medium (slip and fall fracture, property dispute, moderate congestion)
- Low (sanitation issue, minor inquiries)

Recommend the ideal response team from:
- Medical First Responders (108)
- River Rescue & SDRF Boat Unit
- Police & Crowd Management Taskforce
- Fire & Disaster Rescue Services
- Lost & Found Unit
- Municipal Disaster Engineering Cell`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 2500)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an emergency dispatch AI analyst. Output strictly formatted JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: 'Exact category name from the provided list',
            },
            priority: {
              type: Type.STRING,
              description: 'Critical, High, Medium, or Low',
            },
            summary: {
              type: Type.STRING,
              description: 'A crisp 1-2 sentence emergency summary',
            },
            safetyConcerns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-4 specific physical and crowd hazards',
            },
            recommendedTeam: {
              type: Type.STRING,
              description: 'Appropriate specialized response team name',
            },
          },
          required: ['category', 'priority', 'summary', 'safetyConcerns', 'recommendedTeam'],
        },
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        category: (parsed.category as IncidentCategory) || 'Other emergency',
        priority: (parsed.priority as PriorityLevel) || 'Medium',
        summary: parsed.summary || description.slice(0, 100),
        safetyConcerns: Array.isArray(parsed.safetyConcerns) ? parsed.safetyConcerns : [],
        recommendedTeam: parsed.recommendedTeam || 'Police & Crowd Management Taskforce',
        isFallback: false,
      };
    }
  } catch (error) {
    console.warn('[Gemini AI] Classification call failed, switching to deterministic fallback:', error);
  }

  // Deterministic fallback if API fails
  return classifyIncidentDeterministic(description, userSelectedCategory);
}

/**
 * Multilingual AI Safety Assistant
 */
export async function generateSafetyAssistantResponse(
  message: string,
  preferredLanguage: 'English' | 'Telugu' | 'Hindi' = 'English',
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<{ reply: string; isFallback: boolean; emergencyDisclaimer: string }> {
  const disclaimer = 'IMPORTANT: For immediate life-threatening danger, dial 112 (Police) or 108 (Ambulance) directly. This assistant provides guidance and cannot dispatch emergency crews autonomously.';
  const ai = getGeminiClient();

  if (!ai) {
    return {
      reply: getFallbackAssistantReply(message, preferredLanguage),
      isFallback: true,
      emergencyDisclaimer: disclaimer,
    };
  }

  try {
    const formattedHistory = history.slice(-6).map((item) => ({
      role: item.role,
      parts: [{ text: item.text }],
    }));

    const systemInstruction = `You are the Official AI Multilingual Safety Assistant for Godavari Raksha (Godavari Pushkaralu 2027, Andhra Pradesh).
Primary mission: Guide pilgrims, tourists, and volunteers on:
- How to submit an emergency report on the app
- Finding nearest medical posts, police help desks, drinking water, and ghat facilities in Rajahmundry & Kovvur
- River bathing safety guidelines (stay inside iron chains, follow SDRF boat advisories)
- Reporting lost children and elderly persons at Pushkaralu Lost & Found desks
- Understanding report status codes (Submitted, Under Review, Verified, Assigned, In Progress, Resolved)

LANGUAGE RULE: Answer primarily in ${preferredLanguage}. If the user writes in Telugu (తెలుగు) or Hindi (हिंदी), respond fluently in that language with warmth and absolute clarity.
SAFETY CRITICAL RULE: Never fabricate nonexistent emergency numbers or fake hospital addresses. Official numbers: Ambulance: 108, Police & Emergency: 112, Fire: 101, Pushkaralu Child Help: 0883-2464400.
Always remind the pilgrim to call 112 / 108 for instant life threats.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      history: formattedHistory,
      config: {
        systemInstruction,
      },
    });

    const chatTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI Assistant timeout')), 2500)
    );

    const chatPromise = chat.sendMessage({
      message,
    });

    const response = await Promise.race([chatPromise, chatTimeout]);

    const reply = response.text || getFallbackAssistantReply(message, preferredLanguage);
    return {
      reply,
      isFallback: false,
      emergencyDisclaimer: disclaimer,
    };
  } catch (err) {
    console.warn('[Gemini AI] Safety assistant call failed:', err);
    return {
      reply: getFallbackAssistantReply(message, preferredLanguage),
      isFallback: true,
      emergencyDisclaimer: disclaimer,
    };
  }
}

function getFallbackAssistantReply(query: string, language: string): string {
  const q = query.toLowerCase();

  if (language === 'Telugu' || q.includes('telugu') || /[\u0C00-\u0C7F]/.test(query)) {
    if (q.includes('పిల్ల') || q.includes('తప్పి') || q.includes('lost') || q.includes('child')) {
      return 'గోదావరి పుష్కరాలలో తప్పిపోయిన పిల్లలు లేదా వృద్ధుల సమాచారం కోసం: వెంటనే కలెక్టరేట్ గ్రౌండ్స్‌లోని సెంట్రల్ లాస్ట్ & ఫౌండ్ సెంటర్‌ను లేదా సమీప పోలీస్ హెల్ప్ డెస్క్‌ను సంప్రదించండి. హెల్ప్‌లైన్: 0883-2464400 లేదా 112. యాప్‌లో "Missing Persons" విభాగంలో ఫోటో మరియు వివరాలతో వెంటనే కేసు నమోదు చేయవచ్చు.';
    }
    if (q.includes('ఆసుపత్రి') || q.includes('వైద్య') || q.includes('medical') || q.includes('doctor')) {
      return 'సమీప వైద్య శిబిరాలు: 1) పుష్కర్ ఘాట్ గేట్-2 వద్ద 24 గంటల ఎమర్జెన్సీ మెడికల్ పోస్ట్, 2) కోటిలింగాల ఘాట్ వద్ద మొబైల్ ఫస్ట్ ఎయిడ్, 3) రాజమండ్రి ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH - దావాజీపేట). అత్యవసర అంబులెన్స్ కొరకు 108 కి కాల్ చేయండి.';
    }
    return 'నమస్కారం! నేను గోదావరి రక్ష AI సహాయకుడిని. పుష్కరాలలో స్నాన ఘాట్ల భద్రత, వైద్య శిబిరాలు, తప్పిపోయిన వారి వివరాలు లేదా ఎమర్జెన్సీ రిపోర్ట్ ఎలా చేయాలో నన్ను అడగవచ్చు. ప్రాణాంతక అత్యవసర పరిస్థితి ఉంటే దయచేసి నేరుగా 112 లేదా 108 కు డయల్ చేయండి.';
  }

  if (language === 'Hindi' || q.includes('hindi') || /[\u0900-\u097F]/.test(query)) {
    if (q.includes('बच्चा') || q.includes('खोया') || q.includes('lost') || q.includes('child')) {
      return 'गोदावरी पुष्करालु में लापता बच्चों या बुजुर्गों की सूचना के लिए: तुरंत कलेक्ट्रेट ग्राउंड्स पर सेंट्रल लॉस्ट एंड फाउंड सेंटर या निकटतम पुलिस हेल्प डेस्क से संपर्क करें। हेल्पलाइन: 0883-2464400 या 112। आप इस ऐप के "Missing Persons" टैब में तुरंत रिपोर्ट दर्ज कर सकते हैं।';
    }
    if (q.includes('अस्पताल') || q.includes('दवा') || q.includes('medical') || q.includes('doctor')) {
      return 'निकटतम चिकित्सा सहायता केंद्र: 1) पुष्कर घाट गेट 2 पर 24 घंटे आपातकालीन चिकित्सा शिविर, 2) कोटिलिंगाला घाट पर प्राथमिक चिकित्सा शिविर, 3) राजकीय सामान्य अस्पताल (GGH) राजमुंदरी। आपात स्थिति में तुरंत 108 पर कॉल करें।';
    }
    return 'नमस्ते! मैं गोदावरी रक्षा एआई सुरक्षा सहायक हूँ। पुष्करालु स्नान सुरक्षा, खोए-पाए व्यक्तियों की सहायता, अस्पताल और आपातकालीन रिपोर्ट दर्ज करने में मैं आपकी मदद कर सकता हूँ। गंभीर आपातकाल में तुरंत 112 या 108 डायल करें।';
  }

  // English Default
  if (q.includes('report') || q.includes('emergency')) {
    return 'To report an active emergency: Tap the red "Report Emergency" button at the top. Select the incident category (Medical, Lost Child, River Accident, Fire, Crowd Congestion), enable GPS or choose your Ghat location, add a brief description, and submit. You will receive an instant Tracking ID.';
  }
  if (q.includes('child') || q.includes('lost') || q.includes('missing')) {
    return 'For missing persons or lost children: Visit the "Missing Persons" module in this app to submit full descriptions and photos. Immediately inform the Central Lost & Found Registration Center at District Collectorate Grounds (Phone: 0883-2464400) or dial 112 for police PA announcements across all ghats.';
  }
  if (q.includes('hospital') || q.includes('medical') || q.includes('doctor') || q.includes('ambulance')) {
    return 'Nearest medical facilities for Pushkaralu: 1) Government General Hospital (GGH) Rajahmundry (24/7 Trauma Care, 650 beds), 2) Pushkar Ghat Central Medical Post (Gate 2), 3) Kotilingala Mobile First Aid, 4) Kovvur Goshpada Kshetram Medical Tent. For urgent ambulance dispatch, dial 108 immediately.';
  }
  if (q.includes('water') || q.includes('river') || q.includes('bath') || q.includes('safe')) {
    return 'River Bathing Safety Rules: Always bathe strictly within the yellow safety chain barricades. Do not cross into deep river whirlpools. Keep children under arm\'s reach at all times. Watch for SDRF rescue boat whistles. In case of water distress, shout for river marshals and dial 112.';
  }

  return 'Welcome to Godavari Raksha! I can assist you with emergency reporting, navigating to medical and police help posts, Pushkaralu holy dip river safety guidelines, and tracking missing persons. How can I help ensure your safety today? (For immediate life hazards, please dial 112 or 108 directly).';
}
