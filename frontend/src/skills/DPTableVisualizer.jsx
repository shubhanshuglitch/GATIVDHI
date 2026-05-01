/**
 * DPTableVisualizer.jsx — Skill: Enhanced Trade Strategy Visualizer
 * =================================================================
 * Skills System: Transforms technical DP table into a human-readable
 * trade roadmap with buy/sell steps and profit analysis.
 */
import React, { useState } from 'react';

export default function DPTableVisualizer({ dpData }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [step, setStep] = useState(0);

  if (!dpData || !dpData.dp_table || !dpData.dp_table.length) {
    return <div className="empty">No strategy data available</div>;
  }

  const table = dpData.dp_table;
  const maxCols = Math.min(table[0]?.values?.length || 0, 30);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Optimal Trading Roadmap</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Best Buy/Sell strategy for {dpData.k} allowed transactions</div>
        </div>
        <div className="card-badge b-green" style={{ fontSize: '0.7rem' }}>MAX PROFIT: ₹{dpData.max_profit}</div>
      </div>

      <div className="trade-roadmap">
        {dpData.transactions && dpData.transactions.length > 0 ? (
          dpData.transactions.map((t, i) => (
            <div key={i} className="trade-group">
              <div className="trade-step buy">
                <div className="trade-icon">🛍️</div>
                <div className="trade-info">
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--green)' }}>BUY</span>
                    <span className="trade-date">{t.buy_date || `Day ${t.buy_index}`}</span>
                  </div>
                  <span className="trade-price">₹{t.buy_price?.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ height: '10px', marginLeft: '14px', borderLeft: '2px dashed var(--border)', margin: '4px 14px' }}></div>
              <div className="trade-step sell">
                <div className="trade-icon">💰</div>
                <div className="trade-info">
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--red)' }}>SELL</span>
                    <span className="trade-date">{t.sell_date || `Day ${t.sell_index}`}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <span className="trade-price">₹{t.sell_price?.toFixed(2)}</span>
                    <span className="profit-pill">+{((t.profit/t.buy_price)*100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">No profitable trades found for this period</div>
        )}
      </div>

      <div className="profit-summary">
        <div style={{ display:'flex', flexDirection:'column' }}>
          <span style={{ fontSize:'0.7rem', textTransform:'uppercase', opacity:0.8 }}>Total Strategy Gain</span>
          <span className="profit-val">₹{dpData.max_profit}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'0.65rem', opacity:0.8 }}>ALGORITHM</div>
          <div style={{ fontSize:'0.8rem', fontWeight:700 }}>Dynamic Programming</div>
        </div>
      </div>

      <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '🔼 Hide Technical DP Table' : '🔽 Show Technical DP Table (O(n×k))'}
      </div>

      {showAdvanced && (
        <div className="fade-in" style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>DP Matrix Step-by-Step Visualization</span>
            <code>{dpData.complexity}</code>
          </div>
          
          <div className="btn-group" style={{ marginBottom: '10px' }}>
            <button className="btn btn-sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>←</button>
            <span style={{ padding: '0 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>Day {step}</span>
            <button className="btn btn-sm" onClick={() => setStep(Math.min(maxCols - 1, step + 1))} disabled={step >= maxCols - 1}>→</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="dt">
              <thead>
                <tr>
                  <th>Trans</th>
                  {Array.from({ length: Math.min(maxCols, 15) }, (_, i) => (
                    <th key={i} style={i === step ? { color: 'var(--accent)', background: 'rgba(77,159,255,0.1)' } : {}}>D{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.map((row, ri) => (
                  <tr key={ri}>
                    <td style={{ fontWeight: 700 }}>k={row.transaction}</td>
                    {row.values.slice(0, 15).map((v, ci) => (
                      <td key={ci} style={ci === step ? { background: 'rgba(0,214,143,0.05)', color: 'var(--green)', fontWeight: 800 } : { opacity: ci > step ? 0.3 : 1 }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
