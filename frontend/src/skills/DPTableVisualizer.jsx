/**
 * DPTableVisualizer.jsx — Skill: DP Table Step-by-Step Animation
 * ================================================================
 * Skills System: Visualizes DP table filling for stock buy/sell problem.
 * Shows step-by-step how the algorithm fills the table.
 */
import { useState } from 'react';

export default function DPTableVisualizer({ dpData }) {
  const [step, setStep] = useState(0);

  if (!dpData || !dpData.dp_table || !dpData.dp_table.length) {
    return <div className="empty-state">No DP data available</div>;
  }

  const table = dpData.dp_table;
  const maxCols = Math.min(table[0]?.values?.length || 0, 30); // Limit display

  return (
    <div className="fade-in">
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        Complexity: <code style={{ color: 'var(--accent-blue)' }}>{dpData.complexity || `O(n × k)`}</code>
        {' | '}Max Profit: <strong style={{ color: 'var(--accent-green)' }}>₹{dpData.max_profit}</strong>
      </div>

      {/* Step controls */}
      <div className="btn-group" style={{ marginBottom: '10px' }}>
        <button className="btn btn-sm btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Prev</button>
        <span style={{ padding: '5px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Step {step + 1} / {maxCols}
        </span>
        <button className="btn btn-sm btn-primary" onClick={() => setStep(Math.min(maxCols - 1, step + 1))} disabled={step >= maxCols - 1}>Next →</button>
        <button className="btn btn-sm btn-secondary" onClick={() => setStep(maxCols - 1)}>Last</button>
      </div>

      {/* DP Table Grid */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ fontSize: '0.72rem' }}>
          <thead>
            <tr>
              <th>Trans \ Day</th>
              {Array.from({ length: Math.min(maxCols, 20) }, (_, i) => (
                <th key={i} style={i === step ? { color: 'var(--accent-blue)', fontWeight: 700 } : {}}>D{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, ri) => (
              <tr key={ri}>
                <td style={{ fontWeight: 600 }}>k={row.transaction}</td>
                {row.values.slice(0, 20).map((v, ci) => (
                  <td key={ci} className={ci <= step ? 'dp-cell highlight' : 'dp-cell'}
                    style={ci === step ? { fontWeight: 700, color: 'var(--accent-green)' } : {}}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transactions */}
      {dpData.transactions && dpData.transactions.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Optimal Transactions:</div>
          {dpData.transactions.map((t, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              #{i + 1}: Buy @ ₹{t.buy_price} → Sell @ ₹{t.sell_price} = <span style={{ color: 'var(--accent-green)' }}>+₹{t.profit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
