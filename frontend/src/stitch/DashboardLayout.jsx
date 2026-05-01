/**
 * DashboardLayout.jsx — Stitch MCP Layout Orchestrator v3
 * Matches StockMaster Pro: Sidebar + Topbar + Split content
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardLayout({ children, ticker, searchComponent }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'

  // Apply theme to body
  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-theme', newTheme === 'light');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'predictions', label: 'ML Predictions' },
    { id: 'daa', label: 'Algorithm Predictions' },
    { id: 'analysis', label: 'Analysis' },
  ];

  return (
    <div className="app-shell">
      {/* Left sidebar */}
      <aside className="sidebar">
        <button className="sb-icon active" title="Dashboard" onClick={() => setActiveTab('dashboard')}>⊞</button>
        <div className="sb-sep" />
        <button className={`sb-icon ${activeTab==='dashboard'?'active':''}`} title="Dashboard" onClick={() => setActiveTab('dashboard')}>📊</button>
        <button className={`sb-icon ${activeTab==='predictions'?'active':''}`} title="ML Predictions" onClick={() => setActiveTab('predictions')}>🤖</button>
        <button className={`sb-icon ${activeTab==='daa'?'active':''}`} title="DAA Lab" onClick={() => setActiveTab('daa')}>⚙️</button>
        <button className={`sb-icon ${activeTab==='analysis'?'active':''}`} title="Analysis" onClick={() => setActiveTab('analysis')}>📈</button>
        <div className="sb-bottom">
          <div className="sb-sep" />
          <button className="sb-icon" title="Help" onClick={() => setShowHelp(true)}>❓</button>
          <button className="sb-icon" title="Settings" onClick={() => setShowSettings(true)}>⚙</button>
        </div>
      </aside>

      {/* Overlay Modals */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <div className="card-head">
              <div className="left">
                <span className="card-t">GATIVIDHI Help Guide</span>
                <span className="card-sub">Quick platform walkthrough</span>
              </div>
              <button className="btn btn-sm" onClick={() => setShowHelp(false)}>✕</button>
            </div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', display:'flex', flexDirection:'column', gap:10 }}>
              <p><strong>📊 Dashboard:</strong> Real-time price tracking and Quick AI insights.</p>
              <p><strong>🤖 ML Predictions:</strong> AI forecasting using ARIMA, LSTM, and Hybrid models.</p>
              <p><strong>⚙️ DAA Lab:</strong> Advanced algorithm visualizations (DP, D&C, Sliding Window).</p>
              <p><strong>📈 Analysis:</strong> Performance benchmarks and time-complexity comparisons.</p>
              <div className="sw-narrative" style={{ marginTop:5 }}>
                Tip: Press <code>/</code> anywhere to quickly focus the search bar.
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth:'300px' }}>
            <div className="card-head">
              <div className="left">
                <span className="card-t">User Settings</span>
                <span className="card-sub">Preferences & UI toggles</span>
              </div>
              <button className="btn btn-sm" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="m-row">
              <div className="m-item" style={{ cursor:'pointer' }} onClick={toggleTheme}>
                <span className="l">Appearance Mode</span>
                <span className="v" style={{ color:'var(--accent)', fontWeight:700 }}>{theme.toUpperCase()}</span>
              </div>
              <div className="m-item" style={{ cursor:'pointer' }} onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}>
                <span className="l">Default Currency</span>
                <span className="v" style={{ color:'var(--accent)', fontWeight:700 }}>{currency} ({currency === 'INR' ? '₹' : '$'})</span>
              </div>
              <div className="m-item">
                <span className="l">Advanced Technical View</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%', marginTop:10 }} onClick={() => setShowSettings(false)}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="tb-brand"><span className="logo">📊</span> GATIVIDHI</div>
          {ticker && (
            <div className="tb-tickers">
              <div className="ticker-pill"><span>{ticker}</span></div>
            </div>
          )}
          <nav className="tb-nav">
            {tabs.map(t => (
              <button key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </nav>
          {searchComponent}
          {user ? (
            <div className="tb-user" onClick={logout} title={`${user.name} — logout`}>{user.name?.[0]?.toUpperCase()||'U'}</div>
          ) : (
            <Link to="/login" className="tb-user" style={{ textDecoration: 'none', color: '#fff' }} title="Sign in">S</Link>
          )}
        </header>
        <div className="content">
          {typeof children === 'function' ? children(activeTab) : children}
        </div>
      </div>
    </div>
  );
}
