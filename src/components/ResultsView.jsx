import React, { useState } from 'react';
import { LayoutGrid, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { LinkedInIcon, InstagramIcon } from './Icons';
import SocialCard from './SocialCard';
import ThreadsView from './ThreadsView';
import InstagramView from './InstagramView';
import NanoBananaStudio from './NanoBananaStudio';

export default function ResultsView({
  data,
  apiKey,
  generations = {},
  setGenerations,
  loadingMap = {},
  setLoadingMap,
  selectedModel,
  setSelectedModel,
  onGenerateAll,
  onOpenKeyModal,
  onExpandImage
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'linkedin' | 'threads' | 'instagram' | 'nanobanana'

  if (!data) return null;

  return (
    <div style={{ marginTop: '36px' }}>
      {/* Video Summary & Key Takeaways Header */}
      {data.summary && (
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            marginBottom: '24px',
            borderLeft: '4px solid var(--accent-gold)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="gold-badge">Repurposed Video Core Essence</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
            "{data.summary}"
          </p>

          {data.keyTakeaways && data.keyTakeaways.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              {data.keyTakeaways.map((point, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <CheckCircle2 size={13} style={{ color: 'var(--accent-gold)' }} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results View Tabs */}
      <div className="results-nav">
        <div className="tab-group">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <LayoutGrid size={15} />
            <span>All Formats (Split)</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'linkedin' ? 'active' : ''}`}
            onClick={() => setActiveTab('linkedin')}
          >
            <LinkedInIcon size={15} color="#38bdf8" />
            <span>LinkedIn</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'threads' ? 'active' : ''}`}
            onClick={() => setActiveTab('threads')}
          >
            <MessageSquare size={15} />
            <span>Threads</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'instagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('instagram')}
          >
            <InstagramIcon size={15} color="#f43f5e" />
            <span>Instagram</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'nanobanana' ? 'active tab-gold' : ''}`}
            onClick={() => setActiveTab('nanobanana')}
          >
            <Sparkles size={15} style={{ color: 'var(--accent-gold)' }} />
            <span>Nano Banana Visuals</span>
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Click any post to copy instantly
        </div>
      </div>

      {/* Content Rendering based on Tab */}
      {activeTab === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="grid-view">
            <SocialCard
              data={data.linkedin}
              image={generations[0] || generations[1]}
              onExpandImage={onExpandImage}
            />
            <ThreadsView data={data.threads} />
            <InstagramView
              data={data.instagram}
              images={generations}
              onExpandImage={onExpandImage}
            />
          </div>

          <NanoBananaStudio
            visualPrompts={data.visualPrompts}
            apiKey={apiKey}
            generations={generations}
            setGenerations={setGenerations}
            loadingMap={loadingMap}
            setLoadingMap={setLoadingMap}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onGenerateAll={onGenerateAll}
            onOpenKeyModal={onOpenKeyModal}
            onExpandImage={onExpandImage}
          />
        </div>
      ) : activeTab === 'linkedin' ? (
        <div className="single-view">
          <SocialCard
            data={data.linkedin}
            image={generations[0] || generations[1]}
            onExpandImage={onExpandImage}
          />
        </div>
      ) : activeTab === 'threads' ? (
        <div className="single-view">
          <ThreadsView data={data.threads} />
        </div>
      ) : activeTab === 'instagram' ? (
        <div className="single-view">
          <InstagramView
            data={data.instagram}
            images={generations}
            onExpandImage={onExpandImage}
          />
        </div>
      ) : (
        <div className="single-view">
          <NanoBananaStudio
            visualPrompts={data.visualPrompts}
            apiKey={apiKey}
            generations={generations}
            setGenerations={setGenerations}
            loadingMap={loadingMap}
            setLoadingMap={setLoadingMap}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onGenerateAll={onGenerateAll}
            onOpenKeyModal={onOpenKeyModal}
            onExpandImage={onExpandImage}
          />
        </div>
      )}
    </div>
  );
}
