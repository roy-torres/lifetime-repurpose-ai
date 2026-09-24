import React, { useState } from 'react';
import {
  X,
  Key,
  ExternalLink,
  Check,
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  Flame,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
  hasEnvKey,
  imageModel = 'gemini-3.1-flash-image-preview'
}) {
  const isKeyActive = Boolean(hasEnvKey || currentKey);
  const [showOverride, setShowOverride] = useState(!isKeyActive);
  const [inputKey, setInputKey] = useState(currentKey || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/save-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inputKey.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save API key');

      onSaveKey(inputKey.trim());
      setMessage('API Key successfully saved and active in runtime & .env!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo-mark" style={{ width: 38, height: 38 }}>
              <Cpu size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                AI Engine & Architecture
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Life Time Men's Apparel Studio • Pipeline Specifications
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px' }} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Live System Status Banner */}
        <div className="system-status-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="live-status-dot" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d178' }}>
                {isKeyActive ? 'AI Production Pipeline Online' : 'Awaiting API Key Activation'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                {isKeyActive
                  ? 'Friction-Free Review Mode: Connected to Gemini 2.5 Flash & Nano Banana.'
                  : 'Please connect a Google Gemini API key to activate the studio.'}
              </div>
            </div>
          </div>
          <span className="gold-badge" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
            {isKeyActive ? 'Verified Ready' : 'Setup Required'}
          </span>
        </div>

        {/* Architecture Specs Grid */}
        <div className="arch-grid">
          <div className="arch-card">
            <div className="arch-card-header">
              <Sparkles size={15} />
              <span>Multi-Format Text Engine</span>
            </div>
            <p>
              Google <strong>Gemini 2.5 Flash / 3.6 Flash</strong> analyzes video transcripts up to 30,000 characters, transforming raw speech into platform-native LinkedIn, Threads, and Instagram posts.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-header">
              <ImageIcon size={15} />
              <span>Nano Banana 2 Visuals</span>
            </div>
            <p>
              <strong>{imageModel}</strong> synthesizes 1080p photorealistic lifestyle photography tailored to Life Time luxury club settings and athletic wear.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-header">
              <Flame size={15} />
              <span>Brand Persona Calibration</span>
            </div>
            <p>
              Prompt engineering strictly aligned with Life Time's <em>Healthy Way of Life</em> ethos: athletic luxury, modern technical fabrics, and gym-to-street versatility.
            </p>
          </div>

          <div className="arch-card">
            <div className="arch-card-header">
              <Layers size={15} />
              <span>Full-Stack Architecture</span>
            </div>
            <p>
              React 18 frontend with Vite, Node.js Express serverless proxy, YouTube caption ingestion, and client-side demo fallbacks for zero downtime.
            </p>
          </div>
        </div>

        {/* Developer Override Collapsible */}
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          {isKeyActive && (
            <button
              type="button"
              onClick={() => setShowOverride(!showOverride)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
                transition: 'color 0.2s ease',
                width: '100%',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Key size={13} />
                <span>Developer Settings: Custom API Key Override</span>
              </span>
              {showOverride ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {showOverride && (
            <form onSubmit={handleSave} style={{ marginTop: isKeyActive ? '14px' : '0' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Override Gemini API Key
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Paste custom Gemini API key (AIza...)"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                  Supplying a key here overrides the server default for your session.
                </p>
              </div>

              {error && (
                <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#34d178', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Check size={15} />
                  <span>{message}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                >
                  <span>Get API key from Google AI Studio</span>
                  <ExternalLink size={12} />
                </a>

                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          )}

          {!showOverride && isKeyActive && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                Close Overview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
