/**
 * SlidingWindowVisualizer.jsx — Skill: Animated Sliding Window
 * ==============================================================
 * Skills System: Step-by-step sliding window animation for SMA computation.
 */
import { useState, useEffect } from 'react';

export default function SlidingWindowVisualizer({ swData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = swData?.steps || [];
  const totalSteps = steps.length;

  useEffect(() => {
    if (!playing || currentStep >= totalSteps - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 300);
    return () => clearTimeout(timer);
  }, [playing, currentStep, totalSteps]);

  if (!steps.length) return <div className="empty-state">No visualization data</div>;

  const step = steps[currentStep] || steps[0];
  const displayValues = steps.slice(0, Math.min(40, totalSteps));

  return (
    <div className="fade-in">
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        Window Size: {swData.window_size} |
        Time: <code style={{ color: 'var(--accent-blue)' }}>O(n)</code> |
        Per Step: <code style={{ color: 'var(--accent-green)' }}>O(1)</code>
      </div>

      {/* Controls */}
      <div className="btn-group" style={{ marginBottom: '10px' }}>
        <button className="btn btn-sm btn-secondary" onClick={() => { setCurrentStep(0); setPlaying(false); }}>⏮</button>
        <button className="btn btn-sm btn-secondary" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>←</button>
        <button className="btn btn-sm btn-primary" onClick={() => setPlaying(!playing)}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}>→</button>
        <span style={{ padding: '5px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Step {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Value array with window highlight */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '10px' }}>
        {displayValues.map((s, i) => {
          const inWindow = i >= step.window_start && i <= step.window_end && i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} style={{
              padding: '4px 6px', borderRadius: '4px', fontSize: '0.7rem', minWidth: '38px', textAlign: 'center',
              background: isCurrent ? 'rgba(0,212,255,0.3)' : inWindow ? 'rgba(0,255,136,0.15)' : 'var(--bg-glass)',
              border: `1px solid ${isCurrent ? 'var(--accent-blue)' : inWindow ? 'rgba(0,255,136,0.3)' : 'var(--border-glass)'}`,
              color: isCurrent ? 'var(--accent-blue)' : inWindow ? 'var(--accent-green)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              {s.new_value}
            </div>
          );
        })}
      </div>

      {/* Step info */}
      <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', fontSize: '0.78rem' }}>
        <div>📍 Position: <strong>{step.step}</strong> | New: <strong style={{ color: 'var(--accent-blue)' }}>{step.new_value}</strong>
          {step.removed_value !== null && <> | Removed: <strong style={{ color: 'var(--accent-red)' }}>{step.removed_value}</strong></>}
        </div>
        <div>Window: [{step.window_start}..{step.window_end}] | Sum: {step.window_sum}
          {step.average !== null && <> | <strong style={{ color: 'var(--accent-green)' }}>Avg: {step.average}</strong></>}
        </div>
      </div>
    </div>
  );
}
