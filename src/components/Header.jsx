import React from 'react';
import { Sparkles, Key, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Header({ hasKey, onOpenKeyModal }) {
  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-logo-mark" title="Life Time Men's Apparel Studio">
          <Sparkles size={22} />
        </div>
        <div className="brand-titles">
          <h1>
            LIFE TIME
            <span className="gold-badge">Men's Apparel Studio</span>
          </h1>
          <p>
            AI Content Repurposing Engine • YouTube Transcripts to LinkedIn, Threads & Instagram with Nano Banana Visuals
          </p>
        </div>
      </div>

      <div className="header-actions">
        <a
          href="https://shop.lifetime.life/apparel-accessories/men-s-apparel"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          title="Visit Official Life Time Men's Apparel Shop"
        >
          <span>LT Shop</span>
          <ExternalLink size={14} />
        </a>

        <button
          onClick={onOpenKeyModal}
          className={`btn btn-sm ${hasKey ? 'btn-secondary status-badge-btn' : 'btn-primary'}`}
          title={hasKey ? 'View AI Engine & Architecture Specs' : 'Configure Google Gemini API Key'}
        >
          {hasKey ? (
            <>
              <span className="live-status-dot" />
              <span>AI Engine Active</span>
              <span className="model-chip">Gemini 2.5</span>
            </>
          ) : (
            <>
              <Key size={14} />
              <span>Set Gemini Key</span>
              <AlertCircle size={14} style={{ color: '#ef4444' }} />
            </>
          )}
        </button>
      </div>
    </header>
  );
}
