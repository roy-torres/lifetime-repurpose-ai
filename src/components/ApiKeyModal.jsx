import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey, hasEnvKey }) {
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
      setMessage('API Key successfully saved and active in .env!');
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo-mark" style={{ width: 36, height: 36 }}>
              <Key size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>Google Gemini & Nano Banana Key</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Configured securely in your local <code>.env</code> file
              </p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
              Gemini API Key
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Paste Gemini API key here"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              style={{ width: '100%' }}
              autoFocus
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
              Your key is stored directly in your workspace <code>.env</code> file and used for Gemini 2.5 Flash and Nano Banana (<code>gemini-3.1-flash-image</code>).
            </p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#34d178', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Check size={16} />
              <span>{message}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
            >
              <span>Get API key from Google AI Studio</span>
              <ExternalLink size={13} />
            </a>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
