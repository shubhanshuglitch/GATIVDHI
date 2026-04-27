/**
 * DashboardLayout.jsx — Stitch MCP Layout Orchestrator v3
 * Matches StockMaster Pro: Sidebar + Topbar + Split content
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardLayout({ children, ticker, searchComponent }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
          <button className="sb-icon" title="Help">❓</button>
          <button className="sb-icon" title="Settings">⚙</button>
        </div>
      </aside>

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
