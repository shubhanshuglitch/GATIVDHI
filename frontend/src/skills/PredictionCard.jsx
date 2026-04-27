/**
 * PredictionCard.jsx — Skill: Model Prediction Display
 * =====================================================
 * Skills System: Reusable card showing prediction metrics (RMSE, MAE, R², MAPE).
 */
export default function PredictionCard({ model, metrics, forecast }) {
  if (!metrics) return null;
  return (
    <div className="fade-in">
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">RMSE</div>
          <div className="metric-value blue">{metrics.rmse?.toFixed(2)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">MAE</div>
          <div className="metric-value amber">{metrics.mae?.toFixed(2)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">R²</div>
          <div className={`metric-value ${metrics.r2 > 0.5 ? 'green' : 'red'}`}>{metrics.r2?.toFixed(4)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">MAPE</div>
          <div className="metric-value">{metrics.mape?.toFixed(2)}%</div>
        </div>
      </div>
      {forecast && forecast.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          📅 {forecast.length}-day forecast: <strong style={{ color: forecast[forecast.length-1] > forecast[0] ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {forecast[forecast.length-1] > forecast[0] ? '📈 Upward' : '📉 Downward'} trend
          </strong>
        </div>
      )}
    </div>
  );
}
