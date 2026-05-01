/**
 * PredictionCard.jsx — Skill: Enhanced Model Insights
 * =====================================================
 * Skills System: Reusable card showing prediction metrics and human-readable insights.
 */
export default function PredictionCard({ metrics, forecast, lp }) {
  if (!metrics) return null;

  const getMetricHelp = (name) => {
    switch (name) {
      case 'RMSE': return 'Root Mean Squared Error: Measures how far the predictions are from actual values (Lower is better).';
      case 'MAE': return 'Mean Absolute Error: The average size of the prediction errors (Lower is better).';
      case 'R2': return 'Confidence Score (R²): How well the model fits the data. 1.0 is a perfect fit, below 0 is a poor fit.';
      case 'MAPE': return 'Avg. Percentage Error: On average, how many percent the prediction is off.';
      default: return '';
    }
  };

  const lastPrice = lp?.Close || 0;
  const forecastEnd = forecast?.[forecast.length - 1] || 0;
  const priceDiff = forecastEnd - lastPrice;
  const pricePct = lastPrice > 0 ? ((priceDiff / lastPrice) * 100).toFixed(1) : '0';

  return (
    <div className="fade-in">
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', fontStyle: 'italic' }}>
        Higher <strong>Confidence</strong> and lower <strong>Error</strong> indicate a more reliable forecast.
      </div>
      
      <div className="m-grid" style={{ marginBottom: '15px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="m-box" title={getMetricHelp('R2')}>
          <div className="n" style={{ color: metrics.r2 > 0.6 ? 'var(--green)' : 'var(--amber)' }}>
            {(metrics.r2 * 100).toFixed(0)}%
          </div>
          <div className="lb">Model Confidence (R²)</div>
        </div>
        <div className="m-box" title={getMetricHelp('MAPE')}>
          <div className="n" style={{ color: metrics.mape < 10 ? 'var(--green)' : 'var(--red)' }}>
            {metrics.mape?.toFixed(1)}%
          </div>
          <div className="lb">Deviation (MAPE)</div>
        </div>
        <div className="m-box" title={getMetricHelp('RMSE')}>
          <div className="n" style={{ color: 'var(--accent)' }}>{metrics.rmse?.toFixed(1)}</div>
          <div className="lb">Error Margin (RMSE)</div>
        </div>
        <div className="m-box" title={getMetricHelp('MAE')}>
          <div className="n" style={{ color: 'var(--amber)' }}>{metrics.mae?.toFixed(1)}</div>
          <div className="lb">Avg. Variance (MAE)</div>
        </div>
      </div>

      <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>30-Day Outlook</span>
          <span className={`card-badge ${priceDiff > 0 ? 'b-green' : 'b-red'}`}>
            {priceDiff > 0 ? '↗ BULLISH' : '↘ BEARISH'}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Price</span>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>₹{lastPrice.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)', opacity: 0.5 }}>→</div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Forecasted</span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: priceDiff > 0 ? 'var(--green)' : 'var(--red)' }}>
              ₹{forecastEnd.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '0.78rem', textAlign: 'center', color: priceDiff > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
          {priceDiff > 0 ? 'Expected gain of' : 'Expected loss of'} {Math.abs(pricePct)}% over the next month.
        </div>
      </div>
    </div>
  );
}
