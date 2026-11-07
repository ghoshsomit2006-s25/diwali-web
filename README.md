# Diwali Digital Diya 🪔✨

An interactive, personalised Diwali greeting web application built with React, Vite, Tailwind CSS, Canvas, and procedural Web Audio API.

> **GDG on Campus JIS University × AWS Student Builder Group JIS University**  
> Built for the Diwali Digital Diya Contest.

---

## 🌟 Key Features

1. **Realistic Diya Ignition & Auspicious Reveal**
   - Starts in darkness with an unlit clay diya. Tapping ignites a flickering flame with a rich whoosh sound effect and triggers a wave of illuminating light.
   - Unlocks interactive browser audio and reveals the glowing Sanskrit blessing *॥ शुभ दीपावली ॥*.

2. **Personalized Greetings with Gemini AI**
   - Enter sender, receiver, and custom message, or generate bespoke wishes with Google Gemini (`gemini-3.8-flash`).
   - Supports tailored relationships (*friend, family, mentor, partner*), tones (*heartfelt, poetic, funny, traditional, shayari*), and languages (*English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati*).
   - Typewriter animated text preview.
   - One-click shareable URLs with encoded parameters (`?to=...&from=...&msg=...&theme=...`).
   - One-click share via WhatsApp, Web Share API, Copy Link, and PNG image card download (`html2canvas`).

3. **11 Sacred Ekadashi Diyas**
   - Clickable row of authentic mitti diyas representing sacred virtues (*Health, Wealth, Wisdom, Peace, Love, etc.*).
   - "Light Them All" cascading wave.
   - Kindling all 11 diyas triggers a grand celebration with fireworks bursts and Vedic blessings.

4. **Interactive 8/12-Fold Symmetrical Rangoli Creator**
   - Mandala-style drawing canvas with real-time radial mirror symmetry.
   - Festive color powder palette (*Gold, Marigold, Kumkum Red, Gulabi Pink, Peacock Blue, Emerald Green*).
   - Procedural "Auto-Generate Sacred Rangoli" algorithmic lotus generator.
   - Download as PNG or attach directly onto your greeting card.

5. **Physics-Based Canvas Fireworks Engine**
   - Full-screen fireworks with realistic gravity, air drag, and fading trails.
   - Multiple burst shapes: *Peony, Ring, Parametric Heart, Spiral, Willow*.
   - 30-Second Choreographed Auto Fireworks Show synced with festive raga music.
   - Golden sparkle cursor trails and respects `prefers-reduced-motion`.

6. **Festive Sound Effects & Full-Song YouTube Background Music**
   - Synthesized short sound effects: Diya ignition whoosh, temple bell (ghanti) chime, firework whistle & boom, and golden coin clinks with an SFX mute toggle.
   - Integrated YouTube Music-style background player with IFrame API for full song playback without login or 30-second limits.
   - Debounced search with YouTube Data API v3, Media Session API support, queue management, loop modes, and direct URL pasting.

7. **Make-a-Wish Diya & Live Global Wish Wall**
   - Type a personal prayer or wish and release a glowing sky lantern (*Akash Diya*) into the night sky.
   - Global Wish Wall populated in real-time with prayers from across the world.

8. **Five-Day Diwali Timeline & Lore Quiz**
   - Illustrated guide to Dhanteras, Naraka Chaturdashi, Lakshmi Puja, Govardhan Puja, and Bhai Dooj.
   - 5-question interactive festive trivia quiz with instant explanations and score badges.

9. **Ask Pandit-ji AI & Easter Eggs**
   - Interactive chat assistant for puja vidhi, timing, rangoli symbolism, and traditional sweets recipes.
   - Easter egg: Type `lakshmi` anywhere or click the full moon to trigger a shower of golden coins!

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/diwali-digital-diya.git
cd diwali-digital-diya

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env
# (Optional for YouTube Search API):
# VITE_YOUTUBE_API_KEY="YOUR_YOUTUBE_DATA_API_KEY"

# Run development server (Express + Vite)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🎵 YouTube Music-Style Player Setup

The app features full-song, continuous background music powered by the YouTube IFrame Player API:
- **Zero Login Required**: Plays full songs without 30-second previews.
- **Continuous Background Playback**: Keeps playing as users light diyas, draw rangolis, or launch fireworks.
- **Loop Modes**: Defaults to looping so music never stops by itself (Loop One / Loop Queue / Off).
- **Direct Link Support**: Paste any YouTube / YouTube Music URL (`youtube.com/watch?v=`, `youtu.be/`, `music.youtube.com/watch?v=`, `?list=`) to play immediately without an API key.
- **5 Festive Quick-Pick Chips**: One-tap access to curated Diwali songs, Lakshmi Aarti, Bollywood Festive, Bengali Festive, and Chill Instrumental.

### Creating a YouTube Data API v3 Key (For In-App Search):
1. Visit the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select your Google Cloud project or create a new one.
3. Click **Enable APIs and Services** and enable the **YouTube Data API v3**.
4. Click **Create Credentials** -> **API Key**.
5. Recommended: Click **Edit API Key** and under **Application Restrictions**, select **Websites (HTTP referrers)** and add:
   - `http://localhost:3000/*`
   - `https://*.run.app/*`
   - Your custom domain (if applicable)
6. Under **API Restrictions**, restrict the key to **YouTube Data API v3**.
7. In your `.env` file, set:
   ```env
   VITE_YOUTUBE_API_KEY="your_youtube_api_key_here"
   ```
8. Restart your dev server or reload the app. Search will now query YouTube Data API v3 directly with intelligent debouncing and memory caching!

---

## ☁️ Deployment Instructions

### Option 1: AWS Deployment

#### Method A: AWS Amplify (Recommended for Fast Deployment)
1. In the AWS Management Console, navigate to **AWS Amplify**.
2. Click **Host web app** and connect your Git repository (GitHub / CodeCommit).
3. Build Settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
4. Set environment variable `GEMINI_API_KEY` in the Amplify App Settings > Environment Variables.
5. Deploy and access your production URL.

#### Method B: AWS S3 + CloudFront (Static Frontend) + AWS Lambda / App Runner (Backend)
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Upload the `dist/` directory contents to an Amazon S3 bucket configured for static website hosting:
   ```bash
   aws s3 sync dist/ s3://your-diwali-diya-bucket --delete
   ```
3. Create an Amazon CloudFront distribution pointing to your S3 bucket as origin with SSL/TLS certificate via ACM.
4. For the Gemini API backend proxy, deploy `server.ts` as an AWS Lambda function using AWS Serverless Application Model (SAM) or deploy to AWS App Runner container service.

---

### Option 2: Firebase Hosting Deployment

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Initialize Firebase in the root folder:
   ```bash
   firebase init
   ```
   - Select **Hosting: Configure files for Firebase Hosting**.
   - What do you want to use as your public directory? Enter `dist`.
   - Configure as a single-page app (rewrite all urls to /index.html)? Enter `Yes`.
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
4. For backend endpoints on Firebase, export your Express server as a Firebase Cloud Function in `functions/index.js` and add rewrites in `firebase.json`:
   ```json
   "rewrites": [
     {
       "source": "/api/**",
       "function": "api"
     },
     {
       "source": "**",
       "destination": "/index.html"
     }
   ]
   ```

---

## 📜 License & Credits

- Licensed under Apache 2.0.
- Proudly presented for the **Diwali Digital Diya Contest** organized by **GDG on Campus JIS University** & **AWS Student Builder Group JIS University**.
