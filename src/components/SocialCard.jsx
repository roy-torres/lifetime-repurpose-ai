import React, { useState } from 'react';
import { Copy, Check, Share2, Eye, Hash } from 'lucide-react';
import { LinkedInIcon } from './Icons';

export default function SocialCard({ data, image, onExpandImage }) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.fullPost || `${data.hook}\n\n${data.body}\n\n${data.callToAction}\n\n${data.hashtags?.join(' ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = (data.fullPost || '').length;
  const readTimeMinutes = Math.max(1, Math.round(charCount / 800));

  return (
    <div className="glass-panel output-card">
      <div className="output-card-header">
        <div className="platform-badge linkedin">
          <LinkedInIcon size={20} color="#38bdf8" />
          <span>LinkedIn Executive Post</span>
        </div>

        <button
          className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleCopy}
          title="Copy formatted post to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Post</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Image Preview if available */}
      {image?.url && (
        <div
          style={{
            marginBottom: '14px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
            cursor: 'pointer',
            maxHeight: '220px'
          }}
          onClick={() => onExpandImage?.(image)}
          title="Click to expand full resolution image"
        >
          <img src={image.url} alt="Attached LinkedIn visual" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: '6px' }}>
            <span className="gold-badge" style={{ background: 'rgba(10,12,15,0.85)' }}>Nano Banana Visual</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(10,12,15,0.85)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Click to expand</span>
          </div>
        </div>
      )}

      {/* Hook Highlight */}
      {data.hook && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(56, 189, 248, 0.08)',
            borderLeft: '3px solid #38bdf8',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            fontSize: '0.865rem'
          }}
        >
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>
            Above-the-fold Hook (First 140 Chars)
          </div>
          <span style={{ fontWeight: 600, color: '#f0f9ff' }}>{data.hook}</span>
        </div>
      )}

      {/* Formatted Post Content */}
      <div className="output-content-area">
        {data.fullPost || (
          <>
            <p style={{ fontWeight: 600, marginBottom: '16px' }}>{data.hook}</p>
            <p style={{ whiteSpace: 'pre-line', marginBottom: '16px' }}>{data.body}</p>
            <p style={{ fontStyle: 'italic', marginBottom: '16px', color: 'var(--accent-gold-light)' }}>
              {data.callToAction}
            </p>
            <p style={{ color: '#38bdf8' }}>{data.hashtags?.join(' ')}</p>
          </>
        )}
      </div>

      {/* Hashtag Badges */}
      {data.hashtags && data.hashtags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
          {data.hashtags.map((tag, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.72rem',
                background: 'rgba(56, 189, 248, 0.07)',
                color: '#38bdf8',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(56, 189, 248, 0.15)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="output-footer">
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>{charCount} characters</span>
          <span>~{readTimeMinutes} min read</span>
        </div>
        <span style={{ color: 'var(--accent-gold-light)' }}>Optimized for LinkedIn Feed Algorithm</span>
      </div>
    </div>
  );
}
