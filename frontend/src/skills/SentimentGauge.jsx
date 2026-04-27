/**
 * SentimentGauge.jsx — Skill: Sentiment Score Display
 * ====================================================
 * Skills System: Radial gauge showing aggregate sentiment score.
 */
export default function SentimentGauge({ score, label, summary }) {
  const pct = ((score + 1) / 2) * 100; // -1..+1 → 0..100%
  const color = score > 0.1 ? 'var(--accent-green)' : score < -0.1 ? 'var(--accent-red)' : 'var(--accent-amber)';

  return (
    <div className="gauge-container fade-in">
      <div className="gauge-value" style={{ color }}>{(score * 100).toFixed(0)}</div>
      <div className="gauge-label">{label || 'Sentiment Score'}</div>
      <div className="progress-bar" style={{ width: '100%', marginTop: '12px' }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {summary && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--accent-green)' }}>👍 {summary.positive}</span>
          <span style={{ color: 'var(--text-muted)' }}>😐 {summary.neutral}</span>
          <span style={{ color: 'var(--accent-red)' }}>👎 {summary.negative}</span>
        </div>
      )}
    </div>
  );
}
