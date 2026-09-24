# Life Time Men's Apparel — Content Repurposing Studio
Powered by **Google Gemini 3.6 Flash** & **Nano Banana 2 (`gemini-3.1-flash-image-preview`)**

[![Deploy with Vercel](https://vercel.com/button)](https://anti-two-flame.vercel.app)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-anti--two--flame.vercel.app-10b981?style=flat&logo=vercel)](https://anti-two-flame.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-roy--torres%2Flifetime--repurpose--ai-black?style=flat&logo=github)](https://github.com/roy-torres/lifetime-repurpose-ai)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)

An AI-powered content repurposing studio engineered for [Life Time Men's Apparel](https://shop.lifetime.life/apparel-accessories/men-s-apparel). Takes long-form YouTube video transcripts and synthesizes platform-native, high-converting social posts for **LinkedIn**, **Threads**, and **Instagram**, coupled with custom editorial activewear imagery generated via Google's **Nano Banana** multimodal image architecture.

👉 **Live Production App:** [https://anti-two-flame.vercel.app](https://anti-two-flame.vercel.app)

---

## Highlights & Features

- **Minimalist Luxury Interface**: Deep obsidian (`#0a0c0f`) aesthetic, warm gold accents (`#c5a880`), frosted glass cards, and smooth micro-animations matching Life Time’s athletic luxury ethos.
- **YouTube Caption Auto-Extractor**: Paste any YouTube video or Shorts link to fetch the full transcript with 1 click, or paste raw transcripts directly into the prompt box.
- **Platform-Native Copywriting Engine**:
  - **LinkedIn Executive Post**: 1–2 line magnetic hook visible above the fold (under 140 chars), spaced bulleted takeaways connecting physical discipline to leadership and life performance, clean whitespace, and targeted hashtags.
  - **Threads Series**: Snappy, conversational opener (<280 chars) followed by 3–4 bite-sized sequential thread pieces, with individual copy buttons for each segment as well as a "Copy Full Thread" button.
  - **Instagram Caption & Carousel**: Storytelling caption with emoji hooks, a **5-Slide Carousel Blueprint** (Hook, Problem, Shift, Life Time Gear in Action, Save CTA), and a curated hashtag tray.
- **Nano Banana Visual Studio (`gemini-3.1-flash-image-preview`)**:
  - Automatically engineers 2 cinematic editorial activewear prompts directly from your video theme.
  - **1:1 Square (1080x1080)** for Instagram Feed & Threads.
  - **4:5 Portrait (1080x1350)** for Instagram Carousel & LinkedIn.
  - **Auto-Generate Visuals**: Automatically renders both image formats in parallel when repurposing content.
  - **Model Selector**: Switch between `gemini-3.1-flash-image-preview`, `gemini-3.1-flash-image`, `nano-banana-pro-preview`, and `gemini-2.5-flash-image` on the fly.
  - Editable prompts, 1-click regenerate, instant preview fallback, fullscreen lightbox, and high-res PNG downloads.
- **In-App Social Card Integration**: Generated visuals appear directly attached to the LinkedIn and Instagram preview cards.
- **Secure `.env` Integration**:
  - Reads `GEMINI_API_KEY` from your local `.env` file (kept private and git-ignored).
  - In-app **API Key Modal** lets you view status and update your key directly without restarting the server.
- **Instant Demo Presets**: Includes 3 curated fitness & athletic apparel transcripts (*5:30 AM Discipline*, *Gym-to-Street Capsule*, *Pickleball & Active Recovery*) and a 1-click "Explore Demo Output" button.

---

## Tech Stack

- **Reasoning LLM**: Google Gemini 3.6 Flash (`gemini-3.6-flash`) with structured JSON schema outputs.
- **Image Generation**: Google Nano Banana 2 (`gemini-3.1-flash-image-preview` / `gemini-3.1-flash-image`) with multimodal image response parts (`responseModalities: ['TEXT', 'IMAGE']`).
- **SDK**: `@google/genai` (Official Google Gen AI SDK v2.24+).
- **Frontend**: React 18 + Vite 6 + Vanilla CSS Design System with custom tokens & glassmorphism.
- **Backend & Serverless**: Node.js v24 + Express 4 + Vercel Serverless Functions (`api/index.js` with 60s timeout).
- **Deployment**: Vercel CI/CD via GitHub integration.

---

## Project Structure

```text
.
├── api/
│   └── index.js                  # Serverless function entrypoint for Vercel
├── server.js                     # Fullstack Express server + Gemini & Nano Banana endpoints + Vite middleware
├── vercel.json                   # Vercel routing rewrites & 60s function timeout config
├── .env.example                  # Template environment variables
├── .gitignore                    # Prevents secret keys, dist, and node_modules from being committed
├── package.json                  # Dependencies & run scripts
├── vite.config.js                # Vite build config
├── index.html                    # SEO tags & Google Fonts (Outfit & Plus Jakarta Sans)
└── src/
    ├── main.jsx                  # React application entry
    ├── App.jsx                   # Central studio controller & layout
    ├── index.css                 # Minimalist athletic luxury CSS design tokens
    ├── components/
    │   ├── Header.jsx            # Branding, Life Time shop link & key status
    │   ├── ApiKeyModal.jsx       # In-app key configuration with .env persistence
    │   ├── PromptingBox.jsx      # YouTube prompt input, URL caption fetcher & tone controls
    │   ├── ResultsView.jsx       # Tabbed and split dashboard for all platforms
    │   ├── SocialCard.jsx        # LinkedIn preview with attached visual & 1-click copy
    │   ├── ThreadsView.jsx       # Multi-part Threads series with individual copy
    │   ├── InstagramView.jsx     # Caption & 5-slide carousel blueprint with visual tray
    │   ├── NanoBananaStudio.jsx  # Gemini 3.1 Flash Image generator with model selector
    │   ├── ImageModal.jsx        # Fullscreen high-res image lightbox & download
    │   └── Icons.jsx             # Official vector SVG platform logos
    └── data/
        └── sampleTranscripts.js  # Curated workout & apparel transcripts for instant testing
```

---

## Quickstart (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/roy-torres/lifetime-repurpose-ai.git
cd lifetime-repurpose-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your Google AI Studio API key:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
PORT=3000
GEMINI_TEXT_MODEL=gemini-3.6-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
```

### 3. Run the Studio
```bash
npm run dev
```

Open your browser to:
👉 **`http://localhost:3000`**

---

## Vercel Deployment

This project is configured for seamless deployment to **Vercel** via serverless architecture:

1. **Push to GitHub**: Push your repository to GitHub.
2. **Import into Vercel**: Connect the repository to your Vercel account.
3. **Set Environment Variables** in the Vercel Dashboard:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - `GEMINI_TEXT_MODEL`: `gemini-3.6-flash`
   - `GEMINI_IMAGE_MODEL`: `gemini-3.1-flash-image-preview`
4. **Deploy**: Vercel will automatically build the Vite frontend (`dist/`) and route `/api/*` through the serverless function in `api/index.js` with a 60-second execution window.

---

## License
MIT
