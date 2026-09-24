import React, { useState } from 'react';
import { Copy, Check, Layers, Hash, Bookmark } from 'lucide-react';
import { InstagramIcon } from './Icons';

export default function InstagramView({ data, images = [], onExpandImage }) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [activeTab, setActiveTab] = useState('caption'); // 'caption' | 'carousel'

  if (!data) return null;

  const slides = data.carouselSlides || [];
  const validImages = Object.values(images).filter((img) => img?.url);

  const handleCopyCaption = () => {
    const text = data.fullPost || `${data.hook}\n\n${data.caption}\n\n${data.callToAction}\n\n.\n.\n.\n${data.hashtags?.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(data.hashtags?.join(' ') || '');
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <div className="glass-panel output-card">
      <div className="output-card-header">
        <div className="platform-badge instagram">
          <InstagramIcon size={20} color="#f43f5e" />
          <span>Instagram Caption & Carousel</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${copiedCaption ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleCopyCaption}
            title="Copy entire Instagram caption"
          >
            {copiedCaption ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Caption</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Images Preview */}
      {validImages.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
          {validImages.map((img, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                width: '140px',
                height: '140px',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              onClick={() => onExpandImage?.(img)}
              title="Click to view full image"
            >
              <img src={img.url} alt="Instagram visual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 4,
                  fontSize: '0.65rem',
                  background: 'rgba(10,12,15,0.85)',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  color: 'var(--accent-gold-light)'
                }}
              >
                {img.aspectRatio || '1:1'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tabs for Caption vs Carousel Blueprint */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <button
          type="button"
          className={`tab-btn btn-sm ${activeTab === 'caption' ? 'active' : ''}`}
          onClick={() => setActiveTab('caption')}
        >
          <span>Feed Caption</span>
        </button>
        <button
          type="button"
          className={`tab-btn btn-sm ${activeTab === 'carousel' ? 'active tab-gold' : ''}`}
          onClick={() => setActiveTab('carousel')}
        >
          <Layers size={13} />
          <span>Carousel Slide Blueprint ({slides.length})</span>
        </button>
      </div>

      {activeTab === 'caption' ? (
        <div className="output-content-area">
          {data.fullPost || (
            <>
              <p style={{ fontWeight: 700, marginBottom: '14px', color: '#f43f5e' }}>{data.hook}</p>
              <p style={{ whiteSpace: 'pre-line', marginBottom: '16px' }}>{data.caption}</p>
              <p style={{ fontWeight: 600, color: 'var(--accent-gold-light)', marginBottom: '16px' }}>
                {data.callToAction}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                .
                .
                .
              </p>
              <p style={{ color: '#ec4899', fontSize: '0.85rem' }}>{data.hashtags?.join(' ')}</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <div style={{ padding: '8px 12px', background: 'rgba(197, 168, 128, 0.08)', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.78rem', color: 'var(--accent-gold-light)' }}>
            💡 Use these slide concepts in Canva or Figma for high-converting swipeable carousels.
          </div>
          {slides.map((s, idx) => (
            <div key={idx} className="carousel-slide-card">
              <div className="carousel-slide-title">
                Slide {s.slide || idx + 1}: {s.title}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {s.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Hashtag tray with quick copy */}
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {data.hashtags?.length || 0} Curated Hashtags
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleCopyHashtags}
          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
        >
          {copiedTags ? <Check size={12} style={{ color: '#10b981' }} /> : <Hash size={12} />}
          <span>{copiedTags ? 'Hashtags Copied' : 'Copy Tags Only'}</span>
        </button>
      </div>

      <div className="output-footer">
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>High-Engagement Structure</span>
          <span>Saves & Shares CTA</span>
        </div>
        <span style={{ color: 'var(--accent-gold-light)' }}>Life Time Men's Athletic Aesthetic</span>
      </div>
    </div>
  );
}
