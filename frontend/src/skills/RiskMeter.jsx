/**
 * RiskMeter.jsx — Skill: Risk Score Visualization
 * =================================================
 * Skills System: Displays risk score with color-coded meter and details.
 */
export default function RiskMeter({ riskData }) {
  if (!riskData) return null;
  const { risk_score, risk_level, volatility_annual, sharpe_ratio, max_drawdown_pct, suggestion } = riskData;
  const color = risk_score < 30 ? 'var(--accent-green)' : risk_score < 60 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div className="fade-in">
      <div className="gauge-container" style={{ marginBottom: '1rem' }}>
        <div className="gauge-value" style={{ color, fontSize: '3rem' }}>{risk_score}</div>
        <div className="gauge-label">{risk_level} Risk</div>
        <div className="progress-bar" style={{ width: '100%', marginTop: '10px' }}>
          <div className="progress-fill" style={{ width: `${risk_score}%`, background: color }} />
        </div>
      </div>
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">Annual Vol</div>
          <div className="metric-value">{(volatility_annual * 100).toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Sharpe</div>
          <div className={`metric-value ${sharpe_ratio > 1 ? 'green' : sharpe_ratio > 0 ? 'amber' : 'red'}`}>
            {sharpe_ratio?.toFixed(2)}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Max DD</div>
          <div className="metric-value red">{max_drawdown_pct?.toFixed(1)}%</div>
        </div>
      </div>
      {suggestion && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          💡 {suggestion}
        </div>
      )}
    </div>
  );
}
