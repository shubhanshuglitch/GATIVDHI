/**
 * RecursionTreeVisualizer.jsx — Skill: Enhanced D&C Recursion Tree Display
 * =================================================================
 * Skills System: Shows the recursion tree of Divide & Conquer regression
 * with human-readable dates and trend analysis.
 */
import React from 'react';

export default function RecursionTreeVisualizer({ treeData, segments, dates, prices }) {
  if (!treeData || !treeData.length) return <div className="empty">No tree data</div>;

  const maxDepth = Math.max(...treeData.map(n => n.depth));

  // Helper to get date range string
  const getDateRange = (start, end) => {
    if (!dates || !dates[start] || !dates[Math.min(end - 1, dates.length - 1)]) return `Idx: ${start}-${end}`;
    const d1 = new Date(dates[start]);
    const d2 = new Date(dates[Math.min(end - 1, dates.length - 1)]);
    return `${d1.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${d2.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  // Helper to get price trend
  const getTrendInfo = (start, end) => {
    if (!prices || prices.length === 0) return { trend: 'neutral', val: '0%' };
    const pStart = prices[start];
    const pEnd = prices[Math.min(end - 1, prices.length - 1)];
    const diff = pEnd - pStart;
    const pct = ((diff / pStart) * 100).toFixed(1);
    return {
      trend: diff > 0 ? 'up' : 'down',
      val: `${diff > 0 ? '+' : ''}${pct}%`
    };
  };

  const levelMeanings = [
    "Macro Trend (Overall)",
    "Semi-Annual Patterns",
    "Quarterly Movements",
    "Monthly Shifts",
    "Bi-Weekly Trends",
    "Weekly Fluctuations",
    "Daily Volatility"
  ];

  return (
    <div className="fade-in" style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Recursive Trend Decomposition</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>How the algorithm breaks down {dates?.length || 0} days of data</div>
        </div>
        <div className="card-badge b-blue" style={{ fontSize: '0.65rem' }}>D&C O(n log n)</div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
        {Array.from({ length: maxDepth + 1 }, (_, depth) => {
          const nodesAtDepth = treeData.filter(n => n.depth === depth);
          return (
            <div key={depth} style={{ display: 'flex', alignItems: 'center', margin: '12px 0', minWidth: 'max-content' }}>
              <div className="tree-level-info">
                <div style={{ fontWeight: 700, marginRight: '6px' }}>L{depth}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>{levelMeanings[depth] || 'Granular Detail'}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {nodesAtDepth.map((n, i) => {
                  const info = getTrendInfo(n.start, n.end);
                  return (
                    <div key={i} className={`tree-node ${n.type} ${info.trend}`}>
                      <span className="date-range">{getDateRange(n.start, n.end)}</span>
                      <span className="trend-val">{info.val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {segments && segments.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📍</span> Piecewise Trend Segments
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {segments.map((s, i) => {
              const info = getTrendInfo(s.start, s.end);
              return (
                <div key={i} style={{
                  padding: '5px 10px', borderRadius: '4px', fontSize: '0.72rem',
                  background: s.trend === 'up' ? 'var(--green-bg)' : 'var(--red-bg)',
                  border: `1px solid ${s.trend === 'up' ? 'rgba(0,214,143,0.2)' : 'rgba(255,82,82,0.2)'}`,
                  color: s.trend === 'up' ? 'var(--green)' : 'var(--red)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span style={{ fontWeight: 700 }}>{s.trend === 'up' ? '↗' : '↘'}</span>
                  <span>{getDateRange(s.start, s.end)}</span>
                  <span style={{ opacity: 0.8 }}>({info.val})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
