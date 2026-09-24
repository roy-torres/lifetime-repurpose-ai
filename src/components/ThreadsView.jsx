import React, { useState } from 'react';
import { Copy, Check, MessageSquare, ListOrdered, Share2 } from 'lucide-react';

export default function ThreadsView({ data }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!data) return null;

  const items = data.threadItems || (data.fullPost ? [data.fullPost] : []);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(data.fullPost || items.join('\n\n---\n\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyItem = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="glass-panel output-card">
      <div className="output-card-header">
        <div className="platform-badge threads">
          <MessageSquare size={20} />
          <span>Threads Series</span>
        </div>

        <button
          className={`btn btn-sm ${copiedAll ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleCopyAll}
          title="Copy entire thread to clipboard"
        >
          {copiedAll ? (
            <>
              <Check size={14} />
              <span>Copied All!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Full Thread</span>
            </>
          )}
        </button>
      </div>

      {data.hook && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderLeft: '3px solid #ffffff',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            fontSize: '0.865rem'
          }}
        >
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
            Primary Hook Post
          </div>
          <span style={{ fontWeight: 600 }}>{data.hook}</span>
        </div>
      )}

      {/* Sequential Thread Items */}
      <div style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
        {items.map((item, idx) => {
          const charLen = item.length;
          const isOverLimit = charLen > 500;
          return (
            <div key={idx} className="thread-item-box">
              <div className="thread-item-number">
                <span>Thread Post {idx + 1} of {items.length}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopyItem(item, idx)}
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={12} style={{ color: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                {item}
              </p>

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', fontSize: '0.7rem', color: isOverLimit ? '#ef4444' : 'var(--text-dim)' }}>
                {charLen} / 500 chars
              </div>
            </div>
          );
        })}
      </div>

      <div className="output-footer">
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>{items.length} Thread Parts</span>
          <span>Snappy & Conversational</span>
        </div>
        <span style={{ color: 'var(--accent-gold-light)' }}>Formatted for Meta Threads Feed</span>
      </div>
    </div>
  );
}
