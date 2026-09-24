import React from 'react';
import { X, Download, Sparkles, Maximize2 } from 'lucide-react';

export default function ImageModal({ image, onClose }) {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `lifetime-nanobanana-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '850px', background: 'rgba(13, 16, 21, 0.95)', border: '1px solid var(--border-medium)', padding: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="gold-badge">Nano Banana 2</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{image.title || 'Generated Social Asset'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
              <Download size={14} />
              <span>Download High-Res PNG</span>
            </button>
            <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            maxHeight: '75vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#07090b',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}
        >
          <img
            src={image.url}
            alt={image.title || 'Nano Banana generation'}
            style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }}
          />
        </div>

        {image.prompt && (
          <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>Nano Banana Prompt: </strong>
            {image.prompt}
          </div>
        )}
      </div>
    </div>
  );
}
