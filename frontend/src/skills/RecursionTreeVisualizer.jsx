/**
 * RecursionTreeVisualizer.jsx — Skill: D&C Recursion Tree Display
 * =================================================================
 * Skills System: Shows the recursion tree of Divide & Conquer regression.
 */
export default function RecursionTreeVisualizer({ treeData, segments }) {
  if (!treeData || !treeData.length) return <div className="empty-state">No tree data</div>;

  const maxDepth = Math.max(...treeData.map(n => n.depth));

  return (
    <div className="fade-in">
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
        Depth: {maxDepth + 1} levels | Nodes: {treeData.length} |
        Segments: {segments?.length || 0} |
        Complexity: <code style={{ color: 'var(--accent-blue)' }}>O(n log n)</code>
      </div>

      {/* Tree visualization by depth level */}
      {Array.from({ length: maxDepth + 1 }, (_, depth) => {
        const nodesAtDepth = treeData.filter(n => n.depth === depth);
        return (
          <div key={depth} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', minWidth: '50px' }}>D{depth}:</span>
            {nodesAtDepth.map((n, i) => (
              <span key={i} className={`tree-node ${n.type}`}>
                [{n.start}..{n.end}] ({n.size})
              </span>
            ))}
          </div>
        );
      })}

      {/* Segments info */}
      {segments && segments.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Leaf Segments (Piecewise Regression):</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {segments.slice(0, 10).map((s, i) => (
              <div key={i} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem',
                background: s.trend === 'up' ? 'rgba(0,255,136,0.1)' : 'rgba(255,77,106,0.1)',
                border: `1px solid ${s.trend === 'up' ? 'rgba(0,255,136,0.3)' : 'rgba(255,77,106,0.3)'}`,
                color: s.trend === 'up' ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                [{s.start}..{s.end}] {s.trend === 'up' ? '↗' : '↘'} slope={s.slope}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
