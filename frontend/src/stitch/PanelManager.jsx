/**
 * PanelManager.jsx — Stitch MCP Card v3
 * Matches StockMaster Pro card style with three-dot menu
 */
export default function PanelManager({ title, subtitle, badge, badgeType='blue', loading, error, children, style }) {
  return (
    <div className="card" style={style}>
      <div className="card-head">
        <div className="left">
          <div className="card-t">{title}</div>
          {subtitle && <div className="card-sub">{subtitle}</div>}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {badge && <span className={`card-badge b-${badgeType}`}>{badge}</span>}
          <span className="card-menu">⋮</span>
        </div>
      </div>
      {loading ? <div className="loading"><div className="spinner"/>Loading...</div>
       : error ? <div className="err">{error}</div>
       : children}
    </div>
  );
}
