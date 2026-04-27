/**
 * GridOrchestrator.jsx — Stitch MCP: Responsive Grid Manager
 * ============================================================
 * Stitch MCP Usage: Manages the responsive panel grid layout.
 * Handles dynamic column sizing based on content type and screen size.
 */
export default function GridOrchestrator({ children, columns = 'auto' }) {
  const style = columns === 'full'
    ? { display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }
    : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' };

  return <div style={style}>{children}</div>;
}

export function FullWidthPanel({ children }) {
  return <div className="panel-grid-full">{children}</div>;
}
