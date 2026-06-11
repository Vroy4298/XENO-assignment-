// AI Service — GPT-4 integration with smart mock fallback
// WHY: If OPENAI_API_KEY is missing, we return deterministic mock data
// so the entire app works for development/demo without an API key.
// Swapping in the real key instantly activates GPT-4 with no code changes.

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-key-here') {
  const OpenAI = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── GPT-4 Segmentation Prompt ───────────────────────────────────────────────
const SEGMENT_SYSTEM_PROMPT = `You are a MongoDB query expert for a fashion brand CRM called Drape.
Given a natural language filter, return ONLY a valid JSON object with two fields:
1. "mongoQuery": a MongoDB filter object for the Customer collection
2. "suggestedName": a short 3-5 word segment name

Customer fields available:
- name (String)
- city (String) — one of: Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune
- totalSpend (Number) — total ₹ spent
- lastOrderDate (Date) — date of last purchase
- tags (Array of String) — values like: high-value, repeat-buyer, new-customer, lapsed, sale-shopper, ethnic-lover

Example input: "customers from Mumbai who spent more than 10000"
Example output: {"mongoQuery": {"city": "Mumbai", "totalSpend": {"$gte": 10000}}, "suggestedName": "Mumbai High Spenders"}

Return ONLY valid JSON. No explanation, no markdown.`;

// ─── GPT-4 Message Draft Prompt ──────────────────────────────────────────────
const MESSAGE_SYSTEM_PROMPT = `You are a creative marketing copywriter for Drape, a premium Indian D2C fashion brand.
Write a single, personalized campaign message based on the segment description.
Keep it under 160 characters for SMS, or 300 characters for WhatsApp/Email.
Make it warm, fashionable, and include a call to action.
Return ONLY the message text, no quotes, no explanation.`;

// ─── Smart Mock: keyword-based MongoDB query builder ─────────────────────────
// WHY: Parses the most common segmentation patterns so demo works without GPT-4
function mockSegmentQuery(query) {
  const q = query.toLowerCase();
  const filter = {};

  // Spend-based filters
  const spendMatch = q.match(/spent?\s*(more|over|above|greater)\s*than\s*[₹rs]?\s*(\d+)/i) ||
                     q.match(/spend\s*(>|>=)\s*[₹rs]?\s*(\d+)/i);
  if (spendMatch) filter.totalSpend = { $gte: Number(spendMatch[2]) };

  const spendLessMatch = q.match(/spent?\s*(less|under|below)\s*than\s*[₹rs]?\s*(\d+)/i);
  if (spendLessMatch) filter.totalSpend = { $lte: Number(spendLessMatch[2]) };

  // High-value shorthand
  if (q.includes('high value') || q.includes('high-value') || q.includes('vip')) {
    filter.totalSpend = { $gte: 15000 };
  }

  // City filter
  const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune'];
  for (const city of cities) {
    if (q.includes(city.toLowerCase())) {
      filter.city = city;
      break;
    }
  }

  // Lapsed / inactive
  if (q.includes('lapsed') || q.includes('inactive') || q.includes('haven\'t ordered')) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    filter.lastOrderDate = { $lt: ninetyDaysAgo };
  }

  // New customers
  if (q.includes('new customer') || q.includes('first time') || q.includes('new-customer')) {
    filter.tags = 'new-customer';
  }

  // Repeat buyers
  if (q.includes('repeat') || q.includes('loyal')) {
    filter.tags = 'repeat-buyer';
  }

  // Sale shoppers
  if (q.includes('sale') || q.includes('discount')) {
    filter.tags = 'sale-shopper';
  }

  // Generate a name from the query
  const suggestedName = query.length > 40 ? query.substring(0, 40) + '...' : query;

  return { mongoQuery: filter, suggestedName };
}

// Mock message drafts per channel
function mockDraftMessage(segmentDescription, channel) {
  const isWhatsapp = channel === 'whatsapp';
  const isEmail = channel === 'email';

  if (segmentDescription.toLowerCase().includes('high') || segmentDescription.toLowerCase().includes('vip')) {
    return isEmail
      ? `As one of Drape's most valued customers, you get FIRST ACCESS to our new collection. Shop now and enjoy 15% off — exclusively for you. 🌟`
      : `Hey! 👗 You're a Drape VIP! Exclusive early access to our new collection is LIVE. Shop now & get 15% off. Only for you! drape.in/vip`;
  }
  if (segmentDescription.toLowerCase().includes('lapsed') || segmentDescription.toLowerCase().includes('inactive')) {
    return `We miss you at Drape! 💫 It's been a while — come back and discover styles made for you. Use code COMEBACK20 for 20% off your next order.`;
  }
  if (segmentDescription.toLowerCase().includes('new')) {
    return `Welcome to Drape! 🎉 Your style journey starts here. Explore our new arrivals and enjoy free shipping on your first order. drape.in/new`;
  }
  return `Hey! New drops just landed at Drape 🛍️ Fresh kurtas, ethnic sets & western wear — curated just for you. Shop now & style up! drape.in/new-arrivals`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function generateSegmentQuery(naturalLanguageQuery) {
  if (!openai) {
    console.log('[AI] No API key — using mock segment generator');
    return mockSegmentQuery(naturalLanguageQuery);
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SEGMENT_SYSTEM_PROMPT },
        { role: 'user', content: naturalLanguageQuery },
      ],
      temperature: 0.2,
    });

    const raw = response.choices[0].message.content.trim();
    return JSON.parse(raw);
  } catch (err) {
    console.error('[AI] GPT-4 segment error, falling back to mock:', err.message);
    return mockSegmentQuery(naturalLanguageQuery);
  }
}

async function draftCampaignMessage(segmentDescription, channel) {
  if (!openai) {
    console.log('[AI] No API key — using mock message drafter');
    return mockDraftMessage(segmentDescription, channel);
  }

  try {
    const channelGuidance = channel === 'sms'
      ? 'Keep it under 160 characters.'
      : 'Keep it under 300 characters.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: MESSAGE_SYSTEM_PROMPT },
        { role: 'user', content: `Segment: ${segmentDescription}\nChannel: ${channel}. ${channelGuidance}` },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error('[AI] GPT-4 draft error, falling back to mock:', err.message);
    return mockDraftMessage(segmentDescription, channel);
  }
}

module.exports = { generateSegmentQuery, draftCampaignMessage };
