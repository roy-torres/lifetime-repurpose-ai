import React, { useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Loader2, PlayCircle, Layers, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { YouTubeIcon } from './Icons';
import { SAMPLE_TRANSCRIPTS } from '../data/sampleTranscripts';

export default function PromptingBox({
  transcript,
  setTranscript,
  onRepurpose,
  onLoadSampleOutput,
  loading,
  tone,
  setTone,
  apparelFocus,
  setApparelFocus,
  autoGenerateImages = true,
  setAutoGenerateImages
}) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFetchYoutube = async (e) => {
    if (e) e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setFetchingUrl(true);
    setFetchError(null);

    const normalizedUrl = youtubeUrl.trim();

    // 1. Instant client-side match for verified presets (prevents Vercel cloud datacenter IP blocks)
    const extractId = (str) => {
      if (!str) return null;
      if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
      const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      return match ? match[1] : null;
    };

    const inputId = extractId(normalizedUrl);
    const matchedSample = SAMPLE_TRANSCRIPTS.find((s) => {
      const sampleId = extractId(s.videoUrl);
      return (sampleId && inputId && sampleId === inputId) || (s.id && normalizedUrl.includes(s.id));
    });

    if (matchedSample && matchedSample.transcript) {
      setTranscript(matchedSample.transcript);
      if (matchedSample.apparelFocus && setApparelFocus) {
        setApparelFocus(matchedSample.apparelFocus);
      }
      setActiveSampleId(matchedSample.id);
      setFetchingUrl(false);
      return;
    }

    try {
      const res = await fetch('/api/fetch-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve YouTube transcript');

      setTranscript(data.transcript);
      setActiveSampleId(null);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleSelectSample = (sample) => {
    setActiveSampleId(sample.id);
    setTranscript(sample.transcript);
    setYoutubeUrl(sample.videoUrl);
    setApparelFocus(sample.apparelFocus);
    setFetchError(null);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  return (
    <div className="glass-panel prompt-box-card">
      <div className="prompt-header">
        <div className="prompt-header-title">
          <div className="brand-logo-mark" style={{ width: 34, height: 34 }}>
            <Wand2 size={16} />
          </div>
          <div>
            <h2>YouTube Video Transcript Prompt Box</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Paste a YouTube video transcript below or fetch directly via video link
            </p>
          </div>
        </div>

        {/* Preset sample pills */}
        <div className="preset-pills">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '4px' }}>
            Quick Samples:
          </span>
          {SAMPLE_TRANSCRIPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={`preset-pill ${activeSampleId === sample.id ? 'active' : ''}`}
              onClick={() => handleSelectSample(sample)}
            >
              <PlayCircle size={12} />
              <span>{sample.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* YouTube URL Fetch Bar */}
      <form onSubmit={handleFetchYoutube} className="url-fetch-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <YouTubeIcon size={18} color="#ef4444" />
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=... or Shorts)"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={fetchingUrl || !youtubeUrl.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          {fetchingUrl ? (
            <>
              <Loader2 size={15} className="spin-animation" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <RefreshCw size={15} />
              <span>Extract Captions</span>
            </>
          )}
        </button>
      </form>

      {fetchError && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '14px'
          }}
        >
          {fetchError}
        </div>
      )}

      {/* Main Transcript Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          className="textarea-field"
          placeholder="Paste your YouTube video transcript here...
          
Example:
'Hey guys, today I want to break down what actually separates people who stay consistently in peak physical shape for years from those who jump from trend to trend. It really comes down to the friction in your morning routine...'"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setActiveSampleId(null);
          }}
          rows={7}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.74rem',
            color: 'var(--text-dim)',
            background: 'rgba(10, 12, 15, 0.75)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            pointerEvents: 'none'
          }}
        >
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <SlidersHorizontal size={14} />
          <span>{showAdvanced ? 'Hide Brand Customization' : 'Brand & Tone Settings'}</span>
        </button>

        {transcript && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setTranscript('');
              setActiveSampleId(null);
              setYoutubeUrl('');
            }}
          >
            Clear Box
          </button>
        )}
      </div>

      {/* Collapsible Customization Options */}
      {showAdvanced && (
        <div
          style={{
            marginTop: '14px',
            padding: '16px',
            background: 'rgba(10, 12, 15, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Brand Voice & Tone
            </label>
            <select
              className="input-field"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ width: '100%', padding: '9px 12px' }}
            >
              <option value="executive-performance">Executive Athletic (Luxury, disciplined, high-value)</option>
              <option value="gym-to-street">Athletic Luxury (Gym-to-street versatility & lifestyle)</option>
              <option value="direct-snappy">Punchy & Relatable (High energy, hot takes, raw habits)</option>
              <option value="longevity-science">Longevity & Science (Recovery protocols & functional performance)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Apparel Focus (shop.lifetime.life)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Technical shorts, tailored joggers, training tees"
              value={apparelFocus}
              onChange={(e) => setApparelFocus(e.target.value)}
              style={{ width: '100%', padding: '9px 12px' }}
            />
          </div>
        </div>
      )}

      {/* Main Repurpose Action Controls */}
      <div className="prompt-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="gold-badge">Gemini 3.6 Flash</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              + Nano Banana 2
            </span>
          </div>

          {setAutoGenerateImages && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
              <input
                type="checkbox"
                checked={autoGenerateImages}
                onChange={(e) => setAutoGenerateImages(e.target.checked)}
                style={{ accentColor: 'var(--accent-gold)', width: 14, height: 14, cursor: 'pointer' }}
              />
              <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
              <span>Auto-generate images (1:1 & 4:5)</span>
            </label>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onLoadSampleOutput && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onLoadSampleOutput}
              title="Explore full output with sample repurposed social content & visuals"
            >
              <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
              <span>Explore Demo Output</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={onRepurpose}
            disabled={loading || !transcript.trim()}
            style={{ minWidth: '240px', padding: '12px 24px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Repurposing Content...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Repurpose with Gemini</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
