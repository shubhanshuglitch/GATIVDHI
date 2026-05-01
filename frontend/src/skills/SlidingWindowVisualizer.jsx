/**
 * SlidingWindowVisualizer.jsx — Skill: Enhanced Rolling Average Visualizer
 * ========================================================================
 * Skills System: Transforms technical sliding window into a "Trend Smoother"
 * that explains how the moving average removes market noise.
 */
import React, { useState, useEffect } from 'react';

export default function SlidingWindowVisualizer({ swData }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = swData?.steps || [];
  const totalSteps = steps.length;

  useEffect(() => {
    if (!playing || currentStep >= totalSteps - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), 250);
    return () => clearTimeout(timer);
  }, [playing, currentStep, totalSteps]);

  if (!steps.length) return <div className="empty">No live data available</div>;

  const step = steps[currentStep] || steps[0];
  // Limit display to a reasonable chunk for UI
  const startIdx = Math.max(0, currentStep - 15);
  const endIdx = Math.min(totalSteps, startIdx + 30);
  const displaySteps = steps.slice(startIdx, endIdx);

  return (
    <div className="fade-in sw-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Trend Smoothing</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>How the algorithm filters out daily price noise</div>
        </div>
        <div className="card-badge b-purple" style={{ fontSize: '0.7rem' }}>WINDOW: {swData.window_size} DAYS</div>
      </div>

      <div className="sw-narrative">
        The "Sliding Window" algorithm calculates a <strong>Rolling Average</strong> by efficiently updating the sum as it moves. 
        It adds the newest price and removes the oldest price in <strong>constant time</strong>.
      </div>

      <div className="sw-strip">
        {displaySteps.map((s, i) => {
          const globalIdx = startIdx + i;
          const inWindow = globalIdx >= step.window_start && globalIdx <= step.window_end && globalIdx <= currentStep;
          const isCurrent = globalIdx === currentStep;
          const isOut = globalIdx < step.window_start && globalIdx < currentStep;
          
          return (
            <div key={globalIdx} className={`sw-cell ${isCurrent ? 'focus' : inWindow ? 'active' : isOut ? 'out' : ''}`}>
              {s.new_value?.toFixed(0)}
            </div>
          );
        })}
      </div>

      <div className="btn-group" style={{ justifyContent: 'center' }}>
        <button className="btn btn-sm" onClick={() => { setCurrentStep(0); setPlaying(false); }}>⏮ Reset</button>
        <button className="btn btn-sm btn-primary" onClick={() => setPlaying(!playing)} style={{ minWidth: '100px' }}>
          {playing ? '⏸ Pause' : '▶ Play Animation'}
        </button>
        <button className="btn btn-sm" onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}>Next Step ⏭</button>
      </div>

      <div className="sw-insight">
        <div className="insight-box">
          <div className="val">₹{step.new_value?.toFixed(2)}</div>
          <div className="lbl">Incoming Price</div>
        </div>
        <div className="insight-box">
          <div className="val" style={{ color: 'var(--green)' }}>₹{step.average?.toFixed(2)}</div>
          <div className="lbl">Smoothed Trend</div>
        </div>
      </div>

      <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Calculation Strategy:</span>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Incremental Update</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Engine Speed:</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>Instant (O(1))</span>
        </div>
      </div>
    </div>
  );
}
