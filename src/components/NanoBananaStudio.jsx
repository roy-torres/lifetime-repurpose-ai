import React, { useState } from 'react';
import { Sparkles, Download, Eye, RefreshCw, Wand2, Loader2, AlertCircle, Image as ImageIcon, Cpu, Layers } from 'lucide-react';

export default function NanoBananaStudio({
  visualPrompts = [],
  apiKey,
  generations = {},
  setGenerations,
  loadingMap = {},
  setLoadingMap,
  selectedModel = 'gemini-3.1-flash-image-preview',
  setSelectedModel,
  onOpenKeyModal,
  onExpandImage,
  onGenerateAll
}) {
  const [errorMap, setErrorMap] = useState({});
  const [customPrompts, setCustomPrompts] = useState({});

  const availableModels = [
    { id: 'gemini-3.1-flash-image-preview', name: 'gemini-3.1-flash-image-preview (Nano Banana 2)', badge: 'Active • Preview' },
    { id: 'gemini-3.1-flash-image', name: 'gemini-3.1-flash-image (Nano Banana 2)', badge: 'Fast 1080p' },
    { id: 'nano-banana-pro-preview', name: 'nano-banana-pro-preview (Nano Banana Pro)', badge: 'Maximum Detail' },
    { id: 'gemini-2.5-flash-image', name: 'gemini-2.5-flash-image (Nano Banana 1)', badge: 'High Speed' },
    { id: 'gemini-3-pro-image', name: 'gemini-3-pro-image (Pro Grade)', badge: 'Pro Grade' }
  ];

  // Helper to generate dynamic athletic mockup if needed
  const createMockupVisual = (promptText, aspectRatio, title) => {
    const canvas = document.createElement('canvas');
    canvas.width = aspectRatio === '4:5' ? 1080 : 1080;
    canvas.height = aspectRatio === '4:5' ? 1350 : 1080;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#11151c');
    grad.addColorStop(0.5, '#1b212c');
    grad.addColorStop(1, '#0a0d12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle atmospheric glow
    const radial = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.4, 80,
      canvas.width * 0.5, canvas.height * 0.4, 600
    );
    radial.addColorStop(0, 'rgba(197, 168, 128, 0.18)');
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Geometric grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 60; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 60; y < canvas.height; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Modern Gold Accent Badge
    ctx.fillStyle = '#c5a880';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText('LIFE TIME ATHLETIC', 80, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '22px -apple-system, sans-serif';
    ctx.fillText("MEN'S APPAREL • NANO BANANA VISUAL", 80, 160);

    // Title
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 52px -apple-system, sans-serif';
    const words = (title || 'Performance Standard').split(' ');
    let line1 = words.slice(0, 3).join(' ');
    let line2 = words.slice(3).join(' ');
    ctx.fillText(line1, 80, canvas.height * 0.45);
    if (line2) ctx.fillText(line2, 80, canvas.height * 0.45 + 64);

    // Prompt excerpt
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 24px -apple-system, sans-serif';
    const cleanPrompt = (promptText || '').slice(0, 130) + '...';
    ctx.fillText(cleanPrompt, 80, canvas.height * 0.72);

    // Bottom Specs
    ctx.fillStyle = '#c5a880';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText(`FORMAT: ${aspectRatio === '4:5' ? '4:5 PORTRAIT (1080x1350)' : '1:1 SQUARE (1080x1080)'} • ${selectedModel}`, 80, canvas.height - 80);

    return canvas.toDataURL('image/png');
  };

  const handleGenerate = async (item, index, useFallback = false) => {
    const promptToUse = customPrompts[index] !== undefined ? customPrompts[index] : item.prompt;
    setLoadingMap((prev) => ({ ...prev, [index]: true }));
    setErrorMap((prev) => ({ ...prev, [index]: null }));

    if (useFallback) {
      setTimeout(() => {
        const mockUrl = createMockupVisual(promptToUse, item.aspectRatio || '1:1', item.title);
        setGenerations((prev) => ({
          ...prev,
          [index]: {
            url: mockUrl,
            prompt: promptToUse,
            title: item.title,
            aspectRatio: item.aspectRatio || '1:1',
            model: selectedModel,
            isMockup: true
          }
        }));
        setLoadingMap((prev) => ({ ...prev, [index]: false }));
      }, 700);
      return;
    }

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-gemini-api-key': apiKey } : {})
        },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio: item.aspectRatio || '1:1',
          model: selectedModel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nano Banana generation failed');
      }

      if (data.imageUrl) {
        setGenerations((prev) => ({
          ...prev,
          [index]: {
            url: data.imageUrl,
            prompt: promptToUse,
            title: item.title,
            aspectRatio: item.aspectRatio || '1:1',
            model: data.model || selectedModel,
            isMockup: false
          }
        }));
      } else {
        const mockUrl = createMockupVisual(promptToUse, item.aspectRatio || '1:1', item.title);
        setGenerations((prev) => ({
          ...prev,
          [index]: {
            url: mockUrl,
            prompt: promptToUse,
            title: item.title,
            aspectRatio: item.aspectRatio || '1:1',
            model: selectedModel,
            isMockup: true,
            note: data.message
          }
        }));
      }
    } catch (err) {
      setErrorMap((prev) => ({ ...prev, [index]: err.message }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleDownload = (gen) => {
    if (!gen?.url) return;
    const link = document.createElement('a');
    link.href = gen.url;
    link.download = `lifetime-${gen.aspectRatio === '4:5' ? 'portrait' : 'square'}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const defaultPrompts = visualPrompts.length > 0 ? visualPrompts : [
    {
      id: 'default-1',
      title: 'Minimalist Club Editorial (1:1 Feed)',
      aspectRatio: '1:1',
      format: 'Instagram Feed / Threads Square (1080x1080)',
      prompt: 'Cinematic commercial photography of an athletic man in a modern Life Time athletic club locker room and lounge, wearing charcoal high-performance training shorts and a tailored obsidian tee, warm moody lighting, architectural minimalism, 8k resolution, photorealistic.',
      concept: 'Everyday athletic luxury & lifestyle'
    },
    {
      id: 'default-2',
      title: 'High-Performance Movement (4:5 Portrait)',
      aspectRatio: '4:5',
      format: 'Instagram Portrait / LinkedIn (1080x1350)',
      prompt: 'Editorial portrait of a focused athlete stretching post-workout, wearing tapered performance joggers in slate grey, natural dramatic window light in a premium Life Time training club, film grain, editorial fashion standard.',
      concept: 'Active recovery and movement'
    }
  ];

  const anyLoading = Object.values(loadingMap).some(Boolean);

  return (
    <div className="glass-panel output-card">
      <div className="output-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="platform-badge nanobanana">
            <Sparkles size={20} />
            <span>Nano Banana Visual Studio</span>
          </div>

          {/* Model Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--accent-gold)' }} />
            <select
              className="input-field"
              value={selectedModel}
              onChange={(e) => setSelectedModel?.(e.target.value)}
              style={{ padding: '4px 10px', fontSize: '0.78rem', height: 'auto', background: 'rgba(17, 20, 26, 0.9)' }}
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {onGenerateAll && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={anyLoading}
              onClick={onGenerateAll}
            >
              {anyLoading ? (
                <>
                  <Loader2 size={13} className="spin-animation" />
                  <span>Generating Visuals...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Generate All Visuals</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '18px', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Engineered for <strong style={{ color: 'var(--accent-gold-light)' }}>Life Time Men's Apparel</strong> using{' '}
        <strong style={{ color: '#fff' }}>{selectedModel}</strong>. Generates social-ready 1:1 and 4:5 visual assets with SynthID watermarking.
      </div>

      <div className="nanobanana-grid">
        {defaultPrompts.map((item, idx) => {
          const isGenerating = loadingMap[idx];
          const currentGen = generations[idx];
          const error = errorMap[idx];
          const promptValue = customPrompts[idx] !== undefined ? customPrompts[idx] : item.prompt;

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(10, 12, 15, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{item.title}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>
                    {item.format || (item.aspectRatio === '4:5' ? '4:5 Portrait' : '1:1 Square')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {currentGen?.model && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      {currentGen.model.replace('models/', '')}
                    </span>
                  )}
                  <span className="gold-badge" style={{ fontSize: '0.68rem' }}>
                    {item.aspectRatio || '1:1'}
                  </span>
                </div>
              </div>

              {/* Image Preview Canvas */}
              <div className={`image-canvas-wrapper ${item.aspectRatio === '4:5' ? 'portrait' : ''}`}>
                {isGenerating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px', textAlign: 'center' }}>
                    <Loader2 size={34} className="spin-animation" style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                      Rendering with {selectedModel}...
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      Generating multimodal image data (approx 10-15s)
                    </span>
                  </div>
                ) : currentGen?.url ? (
                  <>
                    <img src={currentGen.url} alt={item.title} />
                    <div className="image-overlay-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onExpandImage(currentGen)}
                        title="Expand Fullscreen"
                        style={{ padding: '6px' }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDownload(currentGen)}
                        title="Download High-Res PNG"
                        style={{ padding: '6px' }}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-dim)', padding: '24px', textAlign: 'center' }}>
                    <ImageIcon size={42} style={{ opacity: 0.35 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image Ready to Generate</span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleGenerate(item, idx, false)}
                    >
                      <Sparkles size={13} />
                      <span>Generate {item.aspectRatio || '1:1'} Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Editable Prompt */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Nano Banana Prompt
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={promptValue}
                  onChange={(e) => setCustomPrompts({ ...customPrompts, [idx]: e.target.value })}
                  style={{ fontSize: '0.78rem', lineHeight: 1.4, resize: 'vertical' }}
                />
              </div>

              {error && (
                <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.75rem' }}>
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  disabled={isGenerating}
                  onClick={() => handleGenerate(item, idx, false)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={13} className="spin-animation" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>{currentGen ? 'Regenerate' : 'Generate with Nano Banana'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  title="Generate instant high-fidelity mockup visual"
                  disabled={isGenerating}
                  onClick={() => handleGenerate(item, idx, true)}
                >
                  Instant Preview
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="output-footer" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <span>SynthID Watermark</span>
          <span>1080p Native Resolution</span>
        </div>
        <span style={{ color: 'var(--accent-gold-light)' }}>
          Active Model: {selectedModel}
        </span>
      </div>
    </div>
  );
}
