import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import PromptingBox from './components/PromptingBox';
import ResultsView from './components/ResultsView';
import ImageModal from './components/ImageModal';
import { SAMPLE_TRANSCRIPTS, SAMPLE_OUTPUT } from './data/sampleTranscripts';
import { Sparkles, AlertCircle, ArrowUpRight, Flame } from 'lucide-react';

export default function App() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPTS[0].transcript);
  const [tone, setTone] = useState('executive-performance');
  const [apparelFocus, setApparelFocus] = useState(SAMPLE_TRANSCRIPTS[0].apparelFocus);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(() => localStorage.getItem('lifetime_gemini_key') || '');
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  // Nano Banana Visual States
  const [generatedImages, setGeneratedImages] = useState({});
  const [imageLoadingMap, setImageLoadingMap] = useState({});
  const [selectedImageModel, setSelectedImageModel] = useState('gemini-3.1-flash-image-preview');
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);

  // Check backend .env key status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasEnvKey(Boolean(data.hasKey));
        if (data.imageModel) {
          setSelectedImageModel(data.imageModel);
        }
      })
      .catch((err) => console.warn('Could not check server status:', err));
  }, []);

  const handleSaveKey = (newKey) => {
    setLocalApiKey(newKey);
    localStorage.setItem('lifetime_gemini_key', newKey);
    setHasEnvKey(true);
  };

  // Generate All Visuals via Nano Banana in Parallel
  const handleGenerateAllVisuals = async (prompts) => {
    if (!prompts || prompts.length === 0) return;

    const activeKey = localApiKey.trim();
    prompts.forEach((_, idx) => {
      setImageLoadingMap((prev) => ({ ...prev, [idx]: true }));
    });

    const promises = prompts.map(async (item, idx) => {
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(activeKey ? { 'x-gemini-api-key': activeKey } : {})
          },
          body: JSON.stringify({
            prompt: item.prompt,
            aspectRatio: item.aspectRatio || '1:1',
            model: selectedImageModel
          })
        });

        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setGeneratedImages((prev) => ({
            ...prev,
            [idx]: {
              url: data.imageUrl,
              prompt: item.prompt,
              title: item.title,
              aspectRatio: item.aspectRatio || '1:1',
              model: data.model || selectedImageModel,
              isMockup: false
            }
          }));
        } else {
          console.warn('[App] Image generation returned fallback or notice:', data.message || data.error);
        }
      } catch (err) {
        console.error(`[App] Error generating visual ${idx}:`, err);
      } finally {
        setImageLoadingMap((prev) => ({ ...prev, [idx]: false }));
      }
    });

    await Promise.allSettled(promises);
  };

  const handleLoadSampleOutput = () => {
    setResults(SAMPLE_OUTPUT);
    setError(null);
    setTimeout(() => {
      window.scrollTo({ top: 580, behavior: 'smooth' });
    }, 100);

    // If autoGenerate is active, generate visuals for the sample prompts!
    if (autoGenerateImages && SAMPLE_OUTPUT.visualPrompts) {
      handleGenerateAllVisuals(SAMPLE_OUTPUT.visualPrompts);
    }
  };

  const handleRepurpose = async () => {
    if (!transcript.trim()) {
      setError('Please provide a YouTube video transcript to repurpose.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages({});

    try {
      const activeKey = localApiKey.trim();
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeKey ? { 'x-gemini-api-key': activeKey } : {})
        },
        body: JSON.stringify({
          transcript,
          tone,
          apparelFocus,
          apiKey: activeKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setKeyModalOpen(true);
        }
        throw new Error(data.error || 'Failed to repurpose transcript');
      }

      setResults(data.data);

      // Smooth scroll down to results
      setTimeout(() => {
        window.scrollTo({ top: 580, behavior: 'smooth' });
      }, 100);

      // Automatically trigger Nano Banana image generation if toggle is on
      if (autoGenerateImages && data.data.visualPrompts?.length > 0) {
        handleGenerateAllVisuals(data.data.visualPrompts);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        hasKey={hasEnvKey || Boolean(localApiKey)}
        onOpenKeyModal={() => setKeyModalOpen(true)}
      />

      {/* Hero Intro Tagline */}
      <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '780px', margin: '0 auto 36px auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="gold-badge">
            <Flame size={12} />
            Life Time Athletic Men's Apparel
          </span>
        </div>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Repurpose Video Content Into Social Precision.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Transform long-form YouTube transcripts into perfectly tailored posts for <strong>LinkedIn</strong>, <strong>Threads</strong>, and <strong>Instagram</strong>, paired with native editorial fitness visuals generated via <strong>Google's Nano Banana</strong>.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto 24px auto',
            padding: '14px 18px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          {(!hasEnvKey && !localApiKey) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setKeyModalOpen(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              Configure Gemini Key
            </button>
          )}
        </div>
      )}

      {/* Prompting Box */}
      <PromptingBox
        transcript={transcript}
        setTranscript={setTranscript}
        onRepurpose={handleRepurpose}
        onLoadSampleOutput={handleLoadSampleOutput}
        loading={loading}
        tone={tone}
        setTone={setTone}
        apparelFocus={apparelFocus}
        setApparelFocus={setApparelFocus}
        autoGenerateImages={autoGenerateImages}
        setAutoGenerateImages={setAutoGenerateImages}
      />

      {/* Loading Skeleton Indicator */}
      {loading && !results && (
        <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', margin: '36px 0' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="brand-logo-mark spin-animation" style={{ width: 48, height: 48 }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Repurposing With Gemini & Nano Banana...</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Structuring LinkedIn, Threads, and Instagram posts, and preparing {selectedImageModel} visual assets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {results && (
        <ResultsView
          data={results}
          apiKey={localApiKey}
          generations={generatedImages}
          setGenerations={setGeneratedImages}
          loadingMap={imageLoadingMap}
          setLoadingMap={setImageLoadingMap}
          selectedModel={selectedImageModel}
          setSelectedModel={setSelectedImageModel}
          onGenerateAll={() => handleGenerateAllVisuals(results?.visualPrompts)}
          onOpenKeyModal={() => setKeyModalOpen(true)}
          onExpandImage={(img) => setExpandedImage(img)}
        />
      )}

      {/* Modals */}
      <ApiKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        currentKey={localApiKey}
        onSaveKey={handleSaveKey}
        hasEnvKey={hasEnvKey}
        imageModel={selectedImageModel}
      />

      <ImageModal
        image={expandedImage}
        onClose={() => setExpandedImage(null)}
      />
    </div>
  );
}
