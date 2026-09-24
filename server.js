import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';
import { SAMPLE_TRANSCRIPTS } from './src/data/sampleTranscripts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Helper to get active Gemini API key
function getEffectiveKey(req) {
  return (
    req.headers['x-gemini-api-key'] ||
    req.body?.apiKey ||
    process.env.GEMINI_API_KEY ||
    ''
  ).trim();
}

// Extract YouTube video ID
function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const match = str.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

// 1. Health & Status
app.get('/api/status', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    status: 'ok',
    hasKey: hasEnvKey,
    textModel: process.env.GEMINI_TEXT_MODEL || 'gemini-3.6-flash',
    imageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview',
    availableImageModels: [
      { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2 Preview (gemini-3.1-flash-image-preview)', badge: 'Recommended', description: 'Latest Nano Banana preview model' },
      { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2 (gemini-3.1-flash-image)', badge: 'Fast 1080p', description: 'High-fidelity generation' },
      { id: 'nano-banana-pro-preview', name: 'Nano Banana Pro (nano-banana-pro-preview)', badge: 'High Detail', description: 'Complex composition & precision apparel details' },
      { id: 'gemini-2.5-flash-image', name: 'Nano Banana 1 (gemini-2.5-flash-image)', badge: 'Ultra Fast', description: 'Fast multimodal generation' },
      { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image (gemini-3-pro-image)', badge: 'Pro', description: 'Advanced world knowledge' }
    ],
    timestamp: new Date().toISOString()
  });
});

// 1.1 Available Models Endpoint
app.get('/api/models', (req, res) => {
  res.json({
    imageModels: [
      { id: 'gemini-3.1-flash-image-preview', name: 'Nano Banana 2 Preview (gemini-3.1-flash-image-preview)', badge: 'Default • Latest' },
      { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2 (gemini-3.1-flash-image)', badge: 'Fast 1080p' },
      { id: 'nano-banana-pro-preview', name: 'Nano Banana Pro (nano-banana-pro-preview)', badge: 'Maximum Detail' },
      { id: 'gemini-2.5-flash-image', name: 'Nano Banana 1 (gemini-2.5-flash-image)', badge: 'High Speed' },
      { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image (gemini-3-pro-image)', badge: 'Pro Grade' }
    ],
    currentImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview'
  });
});

// 2. Save Key to .env
app.post('/api/save-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a valid Gemini API key.' });
  }

  const cleanKey = apiKey.trim();
  process.env.GEMINI_API_KEY = cleanKey;

  const envPath = path.join(__dirname, '.env');
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (/GEMINI_API_KEY=/.test(envContent)) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEY=${cleanKey}\nPORT=3000\nGEMINI_TEXT_MODEL=gemini-3.6-flash\nGEMINI_IMAGE_MODEL=gemini-3.1-flash-image\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    return res.json({ success: true, message: 'API key successfully saved to .env and activated in memory.' });
  } catch (err) {
    console.error('Error saving .env file:', err);
    return res.json({ success: true, message: 'API key activated in runtime memory.' });
  }
});

// 3. Fetch YouTube Transcript
app.post('/api/fetch-transcript', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Please provide a YouTube video URL or ID.' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL or Video ID format.' });
    }

    // Attempt direct extraction via YoutubeTranscript
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcriptItems && transcriptItems.length > 0) {
        const fullTranscript = transcriptItems
          .map((item) => item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return res.json({
          success: true,
          videoId,
          itemCount: transcriptItems.length,
          transcript: fullTranscript
        });
      }
    } catch (ytError) {
      console.warn(`[fetch-transcript] Direct YouTube fetch failed for ${videoId}:`, ytError.message);
    }

    // Resilient Fallback: check known curated transcripts library (handles Vercel/datacenter IP blocks)
    const matchingPreset = SAMPLE_TRANSCRIPTS.find(
      (s) => extractVideoId(s.videoUrl) === videoId || s.id === videoId
    );

    if (matchingPreset && matchingPreset.transcript) {
      console.log(`[fetch-transcript] Serving verified preset transcript fallback for: ${videoId}`);
      return res.json({
        success: true,
        videoId,
        itemCount: 1,
        source: 'verified_cached_fallback',
        transcript: matchingPreset.transcript
      });
    }

    return res.status(500).json({
      error: `Could not retrieve transcript from YouTube. Cloud serverless IPs (such as Vercel) are often blocked by YouTube's anti-bot system. You can paste the transcript text directly into the prompt box, or run locally via 'npm run dev'.`
    });
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error.message);
    return res.status(500).json({
      error: `Could not retrieve transcript: ${error.message || 'Captions may be disabled on this video'}. You can paste the transcript text directly into the prompt box.`
    });
  }
});

// 4. Repurpose Content Endpoint
app.post('/api/repurpose', async (req, res) => {
  try {
    const apiKey = getEffectiveKey(req);
    if (!apiKey) {
      return res.status(401).json({
        error: 'Gemini API Key is missing. Add GEMINI_API_KEY to your .env file or input it in the studio header.'
      });
    }

    const { transcript, tone = 'executive-performance', apparelFocus = "Life Time Men's Apparel" } = req.body;
    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({
        error: 'Transcript is too short. Please provide a substantive YouTube video transcript.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const configuredTextModel = process.env.GEMINI_TEXT_MODEL || 'gemini-3.6-flash';
    const candidateModels = [configuredTextModel, 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.5-flash'];
    const uniqueTextModels = [...new Set(candidateModels)];

    const systemInstruction = `
You are the Chief Brand & Content Strategist for Life Time (https://shop.lifetime.life/apparel-accessories/men-s-apparel).
Life Time represents the pinnacle of the "Healthy Way of Life" — elite athletic luxury, functional high-performance materials, gym-to-street versatility, discipline, and longevity.
You specialize in repurposing long-form YouTube video transcripts into high-performing, platform-native content across:
1. LinkedIn (Professional, thought leadership, discipline meets career longevity, formatting with white space)
2. Threads (Punchy, casual, authentic, bite-sized thread structure)
3. Instagram (Compelling caption hook, carousel slide breakdown for high saves, curated performance hashtags)
4. Nano Banana AI Image Prompts (2 hyper-specific cinematic visual prompts engineered for Google's Nano Banana image models, depicting Life Time Men's athletic style in real luxury club/training settings)

Rules:
- NEVER output generic corporate fitness fluff. Keep it authentic, sharp, and value-packed.
- Always output clean valid JSON adhering exactly to the requested schema.
- Naturally connect insights from the video to physical discipline, movement, recovery, or high-performance apparel (breathable technical tees, four-way stretch shorts, tailored joggers, modern athleisure).
`;

    const prompt = `
Repurpose the following YouTube video transcript for Life Time Men's Apparel audience.

Tone requested: ${tone}
Apparel / Lifestyle context: ${apparelFocus}

TRANSCRIPT:
"""
${transcript.slice(0, 30000)}
"""

Return a pure JSON object with the following structure:
{
  "summary": "1-2 sentence core message of the video",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
  "linkedin": {
    "hook": "1-2 line magnetic hook visible before 'see more' (under 140 chars)",
    "body": "Spacious, bulleted insights connecting athletic discipline to life & performance with clean whitespace",
    "callToAction": "A thoughtful question to stimulate conversation",
    "hashtags": ["#LifeTimeFitness", "#MensApparel", "#HighPerformance", "#ActiveLifestyle"],
    "fullPost": "Complete copy-paste ready LinkedIn post"
  },
  "threads": {
    "hook": "Snappy, punchy opener (<280 chars)",
    "threadItems": [
      "1/ Hook and counter-intuitive perspective",
      "2/ Actionable insight or habit",
      "3/ Life Time athletic gear tip or mindset principle",
      "4/ Concluding takeaway or question"
    ],
    "fullPost": "Complete formatted thread ready for posting"
  },
  "instagram": {
    "hook": "Eye-catching opening line with emoji",
    "caption": "Engaging storytelling caption",
    "carouselSlides": [
      { "slide": 1, "title": "Bold Title", "content": "What this carousel solves" },
      { "slide": 2, "title": "The Problem / Shift", "content": "Core insight" },
      { "slide": 3, "title": "The Execution", "content": "Actionable step" },
      { "slide": 4, "title": "The Gear & Standard", "content": "Life Time Men's Apparel context" },
      { "slide": 5, "title": "Save This", "content": "Call to action" }
    ],
    "callToAction": "Save this post for your next training session and tap the link in bio to shop the collection.",
    "hashtags": ["#LifeTimeFitness", "#MensApparel", "#FitnessStyle", "#GymToStreet", "#AthleticLuxury", "#TrainingGear", "#Longevity"],
    "fullPost": "Complete ready-to-copy Instagram caption"
  },
  "visualPrompts": [
    {
      "id": "visual-1",
      "title": "Editorial Athletic Club Lifestyle",
      "aspectRatio": "1:1",
      "format": "Instagram Feed / Threads Square (1080x1080)",
      "prompt": "Detailed editorial prompt describing an athletic male model in Life Time luxury athletic club, wearing modern charcoal training shorts and tailored moisture-wicking tee, cinematic lighting, ultra-realistic",
      "concept": "Lifestyle and apparel focus"
    },
    {
      "id": "visual-2",
      "title": "Performance Action & Movement",
      "aspectRatio": "4:5",
      "format": "Instagram Portrait / LinkedIn (1080x1350)",
      "prompt": "Detailed editorial prompt of an athlete focused in mid-training or recovery lounge, technical slate joggers, warm dramatic natural lighting, 8k commercial photography",
      "concept": "High-intensity training & recovery"
    }
  ]
}
`;

    let lastError = null;
    let responseText = null;
    let successfulModel = null;

    for (const currentModel of uniqueTextModels) {
      try {
        console.log(`[Repurpose] Attempting content generation via ${currentModel}`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        responseText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          successfulModel = currentModel;
          console.log(`[Repurpose] Successfully generated content via ${currentModel}`);
          break;
        }
      } catch (modelErr) {
        console.warn(`[Repurpose] Model ${currentModel} error:`, modelErr.message);
        lastError = modelErr;
      }
    }

    if (!responseText) {
      throw lastError || new Error('All text generation models failed.');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse structured JSON from model response.');
      }
    }

    res.json({
      success: true,
      model: successfulModel,
      data: parsed
    });
  } catch (error) {
    console.error('Error during repurposing:', error);
    res.status(500).json({
      error: error.message || 'An error occurred during Gemini repurposing.'
    });
  }
});

// 5. Generate Image via Nano Banana (Gemini 3.1 Flash Image / Nano Banana 2)
app.post('/api/generate-image', async (req, res) => {
  try {
    const apiKey = getEffectiveKey(req);
    if (!apiKey) {
      return res.status(401).json({ error: 'Gemini API Key is missing.' });
    }

    const { prompt, aspectRatio = '1:1', model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetModel = model || process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview';
    const fallbackModels = [targetModel, 'gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image', 'nano-banana-pro-preview'];
    const uniqueModels = [...new Set(fallbackModels)];

    let lastError = null;

    for (const currentModel of uniqueModels) {
      try {
        console.log(`[Nano Banana] Attempting generation via ${currentModel} with aspectRatio ${aspectRatio}`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
              aspectRatio: aspectRatio === '4:5' ? '4:5' : aspectRatio === '16:9' ? '16:9' : '1:1',
              imageSize: '1K'
            }
          }
        });

        // Extract inline image data
        let base64Image = null;
        let mimeType = 'image/jpeg';
        let responseText = '';

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/jpeg';
          } else if (part.text) {
            responseText += part.text;
          }
        }

        if (base64Image) {
          console.log(`[Nano Banana] Successfully generated image via ${currentModel}! Bytes: ${base64Image.length}`);
          return res.json({
            success: true,
            model: currentModel,
            aspectRatio,
            imageUrl: `data:${mimeType};base64,${base64Image}`,
            caption: responseText.trim()
          });
        }

        console.warn(`[Nano Banana] Model ${currentModel} returned text only:`, responseText);
      } catch (modelErr) {
        console.warn(`[Nano Banana] Model ${currentModel} failed:`, modelErr.message);
        lastError = modelErr;
      }
    }

    // If all models failed, return clear error
    return res.status(502).json({
      error: `Nano Banana generation notice: ${lastError?.message || 'Could not generate image data'}. Ensure your Google AI Studio API key has access to image generation modalities.`
    });
  } catch (error) {
    console.error('Error in /api/generate-image:', error);
    res.status(500).json({ error: error.message || 'Image generation failed.' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[Dev] Vite middleware integrated successfully with HMR.');
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`✨ Life Time Men's Apparel Repurposing Studio is LIVE!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`🔑 Gemini Key in .env: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'PENDING'}`);
    console.log(`==================================================\n`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
