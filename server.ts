import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

const GEMINI_API_KEY =
  const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI SDK with required telemetry User-Agent
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory wish wall storage (persists across sessions during server uptime, pre-seeded with global wishes)
interface CommunityWish {
  id: string;
  name: string;
  wish: string;
  location?: string;
  color: string;
  createdAt: number;
}

const communityWishes: CommunityWish[] = [
  {
    id: 'w-1',
    name: 'Aarav & Priya',
    wish: 'May the divine light of diyas guide our steps toward peace, prosperity, and endless joy.',
    location: 'Varanasi, India',
    color: '#ff9933',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'w-2',
    name: 'Devraj Sharma',
    wish: 'Praying for health and happiness for my parents and siblings far across the ocean.',
    location: 'London, UK',
    color: '#ffd700',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'w-3',
    name: 'Ananya Roy',
    wish: 'Shubho Bijoya and Shubh Deepavali! May Ma Lakshmi bless all small businesses and dreamers.',
    location: 'Kolkata, India',
    color: '#ff4081',
    createdAt: Date.now() - 3600000 * 1.5,
  },
  {
    id: 'w-4',
    name: 'Rohan Patel',
    wish: 'A green and cruelty-free Diwali with safe street animals and clean skies for everyone.',
    location: 'Toronto, Canada',
    color: '#00e676',
    createdAt: Date.now() - 3600000 * 0.8,
  },
  {
    id: 'w-5',
    name: 'Meera Iyer',
    wish: 'Wishing light over darkness, wisdom over ignorance, and sweet kaju katli for all!',
    location: 'Bengaluru, India',
    color: '#e040fb',
    createdAt: Date.now() - 1800000,
  },
];

// Sanitize helper
function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 300);
}

// Fallback wish generator if Gemini API key is missing or quota exceeded
function getFallbackWish(receiver: string, sender: string, tone: string, language: string): string {
  const name = receiver || 'Friend';
  const from = sender ? ` With love, ${sender}.` : '';

  if (language === 'Hindi') {
    return `दीयों की रोशनी से झिलमिलाता रहे आपका संसार, सुख, समृद्धि और शांति से भरा हो आपका परिवार। आपको और आपके अपनों को दीपावली की हार्दिक शुभकामनाएं!${from}`;
  }
  if (language === 'Hinglish') {
    return `Wishing you a sparkling Diwali ${name}! May aapki life mein khushiyan aur mithai kabhi kam na ho, and Lakshmi Ji blesses you with unlimited success and happiness!${from}`;
  }
  if (tone === 'funny') {
    return `Happy Diwali ${name}! May your calories from laddoos magically vanish, your soan papdi boxes find other innocent victims, and your life shine brighter than a 1000-watt rocket!${from}`;
  }
  if (tone === 'poetic') {
    return `Like the tender flame of a golden diya dispelling ancient darkness, may love, grace, and serenity illuminate every corner of your days. Shubh Deepavali to you, ${name}!${from}`;
  }
  return `May the divine light of Diwali illuminate your path with boundless joy, robust health, and everlasting prosperity. Wishing you and your loved ones a blessed and sparkling Diwali, ${name}!${from}`;
}

// Helper to generate content with primary model and automatic fallback to fast lite model on 503/429
async function safeGenerateContent(params: {
  contents: any;
  systemInstruction?: string;
  preferredModel?: string;
}) {
  if (!ai || !GEMINI_API_KEY) {
    throw new Error('AI not configured');
  }

  const primaryModel = params.preferredModel || 'gemini-3.8-flash';
  const fallbackModel = 'gemini-3.1-flash-lite';

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : undefined,
    });
  } catch (err: any) {
    const isTransient =
      err?.message?.includes('503') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.message?.includes('429') ||
      err?.message?.includes('RESOURCE_EXHAUSTED') ||
      err?.message?.includes('NOT_FOUND');
    if (isTransient && primaryModel !== fallbackModel) {
      console.log(`Primary ${primaryModel} busy. Falling back to ${fallbackModel}...`);
      return await ai.models.generateContent({
        model: fallbackModel,
        contents: params.contents,
        config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : undefined,
      });
    }
    throw err;
  }
}

// 1. Generate Personalised Diwali Greeting with Gemini
app.post('/api/gemini/wish', async (req, res) => {
  const { receiverName, senderName, relationship, tone, language } = req.body;
  const receiver = sanitizeText(receiverName || 'Dear Friend');
  const sender = sanitizeText(senderName || '');
  const rel = sanitizeText(relationship || 'friend');
  const toneStyle = sanitizeText(tone || 'heartfelt');
  const lang = sanitizeText(language || 'English');

  if (!ai || !GEMINI_API_KEY) {
    return res.json({
      greeting: getFallbackWish(receiver, sender, toneStyle, lang),
      isFallback: true,
    });
  }

  try {
    const prompt = `Write a bespoke, memorable Diwali greeting for ${receiver}.
Relationship: ${rel}
Tone: ${toneStyle} (e.g. traditional, funny, heartfelt, corporate, shayari-style, or poetic)
Language: ${lang} (Must be written in this language or script appropriate for the request)
Sender name: ${sender || 'A dear friend'}

Requirements:
- Keep it under 65 words.
- Include a vibrant festive warmth, references to diyas, light, sweetness, or prosperity.
- Output ONLY the finished greeting message, without commentary or quotes.`;

    const response = await safeGenerateContent({
      contents: prompt,
      systemInstruction:
        'You are an eloquent Indian poet and festive greeting specialist crafting bespoke Diwali blessings and wishes.',
    });

    const greeting = response.text ? response.text.trim() : getFallbackWish(receiver, sender, toneStyle, lang);
    res.json({ greeting, isFallback: false });
  } catch (error: any) {
    console.error('Gemini wish generation error:', error?.message || error);
    res.json({
      greeting: getFallbackWish(receiver, sender, toneStyle, lang),
      isFallback: true,
      error: error?.message,
    });
  }
});

// 2. Ask Pandit-ji AI (cultural traditions, puja timings, stories, recipes)
app.post('/api/gemini/pandit', async (req, res) => {
  const { question } = req.body;
  const q = sanitizeText(question || '');

  if (!q) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!ai || !GEMINI_API_KEY) {
    return res.json({
      answer:
        'Shubh Deepavali! Traditionally, Diwali celebrates the triumph of light over darkness and Lord Rama’s return to Ayodhya. For Lakshmi Puja, light diyas facing north or east, offer kheer, batasha, and lotus flowers, and keep your doors open to welcome positive energy!',
      isFallback: true,
    });
  }

  try {
    const response = await safeGenerateContent({
      contents: q,
      systemInstruction:
        'You are Pandit-ji AI, a venerable, warm, and joyful scholar of Indian heritage, Diwali traditions, Lakshmi-Ganesha puja, 5-day festivities, rangoli symbolism, and traditional festive delicacies. Answer warmly in 2-4 sentences with cultural depth and festive joy. Conclude with a warm blessing like "Shubh Deepavali!".',
    });

    res.json({
      answer: response.text ? response.text.trim() : 'May Lakshmi Ma bless your home with prosperity and light! Shubh Deepavali!',
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Pandit-ji AI error:', error?.message || error);
    res.json({
      answer:
        'Lighting diyas symbolizes the dispelling of darkness and ignorance. Place mustard oil or ghee diyas at your threshold to invite peace, wisdom, and auspicious fortune into your home. Shubh Deepavali!',
      isFallback: true,
    });
  }
});

// 2b. Multi-turn Gemini Chatbot with selectable roles & conversation history
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, role, speed } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Choose model based on speed/task requirement
  const model = speed === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

  // System instructions per role
  let systemInstruction =
    'You are Pandit-ji AI, a venerable, joyful, and culturally profound Vedic scholar and Diwali spiritual guide. Guide users on Lakshmi Puja vidhi, auspicious muhurats, chanting shlokas, symbolic rituals, and the deep philosophical triumph of light over darkness. Answer warmly with cultural respect and conclude responses with a blessing like "Shubh Deepavali!".';

  if (role === 'kavi') {
    systemInstruction =
      'You are Kavi-ji, an eloquent Urdu-Hindi shayar and festive Diwali poet. Craft radiant couplets, rhyming greetings, heartfelt poetry, and poetic blessings that touch the soul. Weave references to diyas, starlight, fragrance, and sweet togetherness.';
  } else if (role === 'rasoi') {
    systemInstruction =
      'You are Chef Rasoi-ji, an expert master chef of authentic Indian festive sweets and Diwali delicacies (Kaju Katli, Besan Ladoo, Gulab Jamun, Gujiya, Mathri, Chakli). Provide clear steps, cooking secrets, syrup consistency tips, and festive presentation ideas.';
  } else if (role === 'eco') {
    systemInstruction =
      'You are Green Diwali Guide Prakriti-ji, dedicated to eco-friendly, animal-safe, and sustainable Diwali celebrations. Offer green rangoli tips, natural clay diya care, protecting neighborhood pets and street animals from smoke and noise, and plantable sweets/gifts.';
  }

  if (!ai || !GEMINI_API_KEY) {
    const lastUserMsg = messages[messages.length - 1]?.text || '';
    return res.json({
      reply: `May the auspicious lights of Diwali brighten your path! (Echoing: "${lastUserMsg.slice(0, 50)}") Wishing you joy and prosperity. Shubh Deepavali!`,
      isFallback: true,
    });
  }

  try {
    // Format conversation history for @google/genai
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: sanitizeText(m.text) }],
    }));

    const response = await safeGenerateContent({
      contents,
      systemInstruction,
      preferredModel: model,
    });

    const reply = response.text ? response.text.trim() : 'May Lakshmi Ma bless your path! Shubh Deepavali!';
    res.json({ reply, isFallback: false, modelUsed: model });
  } catch (error: any) {
    console.error('Gemini multi-turn chat error:', error?.message || error);
    res.json({
      reply: 'On this sacred festival of Diwali, may peace, light, and wisdom illuminate every aspect of your life. Shubh Deepavali!',
      isFallback: true,
      error: error?.message,
    });
  }
});

// 3. Wish Wall: GET all wishes
app.get('/api/wishes', (req, res) => {
  res.json({ wishes: communityWishes.slice(0, 40) });
});

// 4. Wish Wall: POST a new wish
app.post('/api/wishes', (req, res) => {
  const { name, wish, location, color } = req.body;
  const cleanName = sanitizeText(name) || 'Anonymous Devotee';
  const cleanWish = sanitizeText(wish);

  if (!cleanWish) {
    return res.status(400).json({ error: 'Wish text cannot be blank' });
  }

  const newWish: CommunityWish = {
    id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    wish: cleanWish,
    location: sanitizeText(location || 'Earth'),
    color: color || '#ff9933',
    createdAt: Date.now(),
  };

  communityWishes.unshift(newWish);
  // Cap at 60 items
  if (communityWishes.length > 60) {
    communityWishes.pop();
  }

  res.json({ success: true, wish: newWish });
});

// 5. YouTube Data API v3 Proxy endpoint (avoids CORS & referrer restrictions)
app.get('/api/youtube/search', async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  const apiKey =
    process.env.VITE_YOUTUBE_API_KEY ||
    process.env.YOUTUBE_API_KEY ||
    'AIzaSyBVDfL7iP3Cbkmd2nXLmtSm4nApiA-EJE4';

  try {
    const enhancedQuery = `${query} music`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&videoSyndicated=true&maxResults=12&q=${encodeURIComponent(
      enhancedQuery
    )}&key=${apiKey}`;

    const apiRes = await fetch(url);
    if (!apiRes.ok) {
      const errBody = await apiRes.json().catch(() => ({}));
      return res.status(apiRes.status).json(errBody);
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err: any) {
    console.error('YouTube search proxy error:', err?.message || err);
    res.status(500).json({ error: 'Failed to proxy YouTube search' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Diwali Digital Diya server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
