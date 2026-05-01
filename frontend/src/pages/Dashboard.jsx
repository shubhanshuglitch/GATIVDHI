import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../stitch/DashboardLayout';
import PanelManager from '../stitch/PanelManager';
import PriceChart from '../skills/PriceChart';
import PredictionCard from '../skills/PredictionCard';
import SentimentGauge from '../skills/SentimentGauge';
import RiskMeter from '../skills/RiskMeter';
import ChatBot from '../skills/ChatBot';
import ComplexityChart from '../skills/ComplexityChart';
import DPTableVisualizer from '../skills/DPTableVisualizer';
import RecursionTreeVisualizer from '../skills/RecursionTreeVisualizer';
import SlidingWindowVisualizer from '../skills/SlidingWindowVisualizer';
import * as api from '../services/api';

export default function Dashboard() {
  const [ticker, setTicker] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [period, setPeriod] = useState('1y');
  const [predModel, setPredModel] = useState('arima');
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [recLoading, setRecLoading] = useState(false);
  const [sentiment, setSentiment] = useState(null);
  const [sentLoading, setSentLoading] = useState(false);
  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [algoTab, setAlgoTab] = useState('dp');
  const [dpData, setDpData] = useState(null);
  const [dcData, setDcData] = useState(null);
  const [swData, setSwData] = useState(null);
  const [algoLoading, setAlgoLoading] = useState(false);
  const [compData, setCompData] = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const [complexityData, setComplexityData] = useState(null);
  const [complexLoading, setComplexLoading] = useState(false);
  const [backtest, setBacktest] = useState(null);
  const [btLoading, setBtLoading] = useState(false);
  const [numTrades, setNumTrades] = useState(2);

  // Search
  const doSearch = useCallback(async (q) => {
    if (q.length < 1) { setSearchResults([]); return; }
    try { const { data } = await api.searchStocks(q); setSearchResults(data.results || []); setShowSearch(true); } catch { setSearchResults([]); }
  }, []);
  useEffect(() => { const t = setTimeout(() => doSearch(searchQuery), 300); return () => clearTimeout(t); }, [searchQuery, doSearch]);
  
  // Keyboard Shortcut (Slash to Search)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.querySelector('.tb-search input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const selectTicker = async (sym) => {
    setTicker(sym); setShowSearch(false); setSearchQuery(sym); setSearchResults([]);
    setPrediction(null); setDpData(null); setDcData(null); setSwData(null); setCompData(null); setBacktest(null);
    try { const { data } = await api.getStock(sym, period); setStockData(data); } catch {}
  };

  const changePeriod = async (p) => { setPeriod(p); if (!ticker) return; try { const { data } = await api.getStock(ticker, p); setStockData(data); } catch {} };

  useEffect(() => {
    if (!ticker) return;
    setRecLoading(true); api.getRecommendation(ticker).then(r => setRecommendation(r.data)).catch(() => {}).finally(() => setRecLoading(false));
    setSentLoading(true); api.getSentiment(ticker).then(r => setSentiment(r.data)).catch(() => {}).finally(() => setSentLoading(false));
    setRiskLoading(true); api.getRisk(ticker).then(r => setRisk(r.data)).catch(() => {}).finally(() => setRiskLoading(false));
  }, [ticker]);

  const runPrediction = async (m) => { if (!ticker) return; setPredLoading(true); setPredModel(m);
    try { const fn = m==='arima'?api.predictARIMA:m==='lstm'?api.predictLSTM:api.predictHybrid; setPrediction((await fn({ticker,period:'2y',forecast_days:30,epochs:5})).data);
    } catch(e) { setPrediction({error:e.message}); } finally { setPredLoading(false); } };

  const runAlgo = async (t) => { if (!ticker) return; setAlgoLoading(true); setAlgoTab(t);
    try { if (t==='dp') setDpData((await api.algoBestTrade({ticker,period:'1y',max_transactions:numTrades})).data);
      else if (t==='dc') setDcData((await api.algoRegression({ticker,period:'1y'})).data);
      else setSwData((await api.algoVisualizeSW({ticker,period:'1y'})).data);
    } catch {} finally { setAlgoLoading(false); } };

  const runComparison = async () => { if (!ticker) return; setCompLoading(true); try { setCompData((await api.algoCompare({ticker,period:'1y'})).data); } catch {} finally { setCompLoading(false); } };
  const runComplexity = async () => { setComplexLoading(true); try { setComplexityData((await api.algoComplexity({max_size:5000})).data); } catch {} finally { setComplexLoading(false); } };
  const runBacktest = async () => { if (!ticker) return; setBtLoading(true); try { setBacktest((await api.backtest({ticker,period:'1y'})).data); } catch {} finally { setBtLoading(false); } };

  const searchComp = (
    <div className="tb-search">
      <span className="si">🔍</span>
      <input placeholder="Search stocks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length && setShowSearch(true)} onBlur={() => setTimeout(() => setShowSearch(false), 200)} />
      <div className="search-shortcut">/</div>
      {showSearch && (searchQuery.length > 0) && (
        <div className="search-dropdown">
          {searchResults.length > 0 ? (
            searchResults.map((s,i) => (
              <div key={i} className="sd-item" onClick={() => selectTicker(s.symbol)}>
                <div style={{ display:'flex', flexDirection:'column' }}>
                  <span className="sym">{s.symbol}</span>
                  <span className="name">{s.name}</span>
                </div>
                <span className="card-badge b-blue" style={{ fontSize:'0.6rem' }}>{s.exchange}</span>
              </div>
            ))
          ) : (
            <div className="empty" style={{ padding:'1rem', fontSize:'0.8rem' }}>
              No stocks found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );

  const lp = stockData?.data?.[stockData.data.length - 1];
  const prevP = stockData?.data?.[stockData.data.length - 2];
  const chg = lp && prevP ? lp.Close - prevP.Close : 0;
  const pct = prevP ? ((chg / prevP.Close) * 100).toFixed(2) : '0';

  return (
    <DashboardLayout ticker={ticker} searchComponent={searchComp}>
      {(activeTab) => {
        if (!ticker) return (
          <div className="empty" style={{ paddingTop: '5rem' }}>
            <div className="icon">📊</div>
            <h2 style={{ marginBottom: 4 }}>Welcome to GATIVIDHI</h2>
            <p style={{ color: 'var(--text-secondary)' }}>AI-Driven Stock Market Prediction & Algorithm Analysis</p>
            <p style={{ marginTop: 6, fontSize: '0.82rem' }}>Search for a stock above to get started</p>
          </div>
        );

        /* ═══ DASHBOARD — Price & History ═══ */
        if (activeTab === 'dashboard') return (<>
          {lp && <div style={{ display:'flex', gap:14, alignItems:'baseline', marginBottom:10, flexWrap:'wrap' }}>
            <h2 style={{ fontSize:'1.3rem' }}>{ticker}</h2>
            <span style={{ fontSize:'1.7rem', fontWeight:800 }}>₹{lp.Close?.toFixed(2)}</span>
            <span style={{ color: chg>=0?'var(--green)':'var(--red)', fontWeight:600 }}>{chg>=0?'+':''}{chg.toFixed(2)} ({pct}%)</span>
          </div>}
          <div className="btn-group" style={{ marginBottom:10 }}>
            {['1mo','3mo','6mo','1y','2y','5y'].map(p => <button key={p} className={`btn btn-sm ${period===p?'active':''}`} onClick={() => changePeriod(p)}>{p}</button>)}
          </div>

          {/* ── Quick Insights Card ── */}
          {(recommendation || sentiment || risk) && (
            <div className="card" style={{ marginBottom:10, background:'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)', borderLeft:'3px solid var(--accent)' }}>
              <div className="card-head">
                <div className="left">
                  <div className="card-t">💡 Quick Insights for {ticker}</div>
                  <div className="card-sub">AI-generated summary — not financial advice</div>
                </div>
                <span className="card-menu">⋮</span>
              </div>

              {/* Summary sentence */}
              <p style={{ fontSize:'0.88rem', lineHeight:1.6, marginBottom:10, color:'var(--text-primary)' }}>
                {ticker} is showing a{' '}
                <strong style={{ color: recommendation?.action?.includes('Buy') ? 'var(--green)' : recommendation?.action?.includes('Sell') ? 'var(--red)' : 'var(--amber)' }}>
                  {recommendation?.action || 'Hold'}
                </strong> signal
                {recommendation?.confidence ? ` with ${(recommendation.confidence*100).toFixed(0)}% confidence` : ''}.
                {' '}News sentiment is{' '}
                <strong style={{ color: sentiment?.aggregate?.label === 'Positive' ? 'var(--green)' : sentiment?.aggregate?.label === 'Negative' ? 'var(--red)' : 'var(--text-secondary)' }}>
                  {sentiment?.aggregate?.label || 'Neutral'}
                </strong>
                {sentiment?.aggregate?.score ? ` (score: ${sentiment.aggregate.score})` : ''}.
                {' '}Risk level is{' '}
                <strong style={{ color: risk?.risk_level === 'High' ? 'var(--red)' : risk?.risk_level === 'Low' ? 'var(--green)' : 'var(--amber)' }}>
                  {risk?.risk_level || 'Medium'}
                </strong>
                {risk?.volatility ? ` with ${(risk.volatility*100).toFixed(1)}% volatility` : ''}.
              </p>

              {/* Indicator pills */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {recommendation && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-sm)', background: recommendation.action?.includes('Buy') ? 'var(--green-bg)' : recommendation.action?.includes('Sell') ? 'var(--red-bg)' : 'var(--amber-bg)', border: `1px solid ${recommendation.action?.includes('Buy') ? 'rgba(0,214,143,0.2)' : recommendation.action?.includes('Sell') ? 'rgba(255,82,82,0.2)' : 'rgba(255,170,0,0.2)'}` }}>
                    <span style={{ fontSize:'1rem' }}>{recommendation.action?.includes('Buy') ? '🟢' : recommendation.action?.includes('Sell') ? '🔴' : '🟡'}</span>
                    <div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px' }}>Signal</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color: recommendation.action?.includes('Buy') ? 'var(--green)' : recommendation.action?.includes('Sell') ? 'var(--red)' : 'var(--amber)' }}>{recommendation.action}</div>
                    </div>
                  </div>
                )}
                {sentiment && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-sm)', background: sentiment.aggregate?.label === 'Positive' ? 'var(--green-bg)' : sentiment.aggregate?.label === 'Negative' ? 'var(--red-bg)' : 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize:'1rem' }}>{sentiment.aggregate?.label === 'Positive' ? '📰' : sentiment.aggregate?.label === 'Negative' ? '📉' : '📊'}</span>
                    <div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px' }}>News Mood</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color: sentiment.aggregate?.label === 'Positive' ? 'var(--green)' : sentiment.aggregate?.label === 'Negative' ? 'var(--red)' : 'var(--text-secondary)' }}>{sentiment.aggregate?.label} ({sentiment.aggregate?.score})</div>
                    </div>
                  </div>
                )}
                {risk && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-sm)', background: risk.risk_level === 'High' ? 'var(--red-bg)' : risk.risk_level === 'Low' ? 'var(--green-bg)' : 'var(--amber-bg)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize:'1rem' }}>{risk.risk_level === 'High' ? '⚠️' : risk.risk_level === 'Low' ? '🛡️' : '⚡'}</span>
                    <div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px' }}>Risk</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color: risk.risk_level === 'High' ? 'var(--red)' : risk.risk_level === 'Low' ? 'var(--green)' : 'var(--amber)' }}>{risk.risk_level}</div>
                    </div>
                  </div>
                )}
                {recommendation?.indicators?.rsi && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-sm)', background:'var(--bg-elevated)', border:'1px solid var(--border-light)' }}>
                    <span style={{ fontSize:'1rem' }}>📐</span>
                    <div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px' }}>RSI</div>
                      <div style={{ fontSize:'0.85rem', fontWeight:700, color: recommendation.indicators.rsi > 70 ? 'var(--red)' : recommendation.indicators.rsi < 30 ? 'var(--green)' : 'var(--text-primary)' }}>{recommendation.indicators.rsi.toFixed(1)} {recommendation.indicators.rsi > 70 ? '(Overbought)' : recommendation.indicators.rsi < 30 ? '(Oversold)' : '(Normal)'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Top reasons */}
              {recommendation?.reasons?.length > 0 && (
                <div style={{ marginTop:10, padding:'8px 10px', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-light)' }}>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:4 }}>Why this signal?</div>
                  {recommendation.reasons.slice(0,3).map((r,i) => (
                    <div key={i} style={{ fontSize:'0.78rem', color:'var(--text-secondary)', padding:'2px 0', display:'flex', gap:5 }}>
                      <span style={{ color:'var(--accent)' }}>•</span> {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <PanelManager title="Price History">
            {stockData && <PriceChart labels={stockData.data.map(d=>d.Date)} datasets={[{label:'Close',data:stockData.data.map(d=>d.Close),fill:true},{label:'SMA 20',data:stockData.data.map(d=>d.SMA_20),color:'#ffaa00',borderWidth:1}]} height={300}/>}
          </PanelManager>
          <div className="skills-sec" style={{ marginTop:10 }}>
            <div className="skills-lbl">Key Statistics</div>
            <div className="skills-row">
              <PanelManager title="Volume & OHLC">
                {lp && <div className="m-row">
                  <div className="m-item"><span className="l">Open</span><span className="v">₹{lp.Open?.toFixed(2)}</span></div>
                  <div className="m-item"><span className="l">High</span><span className="v" style={{color:'var(--green)'}}>₹{lp.High?.toFixed(2)}</span></div>
                  <div className="m-item"><span className="l">Low</span><span className="v" style={{color:'var(--red)'}}>₹{lp.Low?.toFixed(2)}</span></div>
                  <div className="m-item"><span className="l">Volume</span><span className="v">{(lp.Volume/1e6).toFixed(1)}M</span></div>
                </div>}
              </PanelManager>
              <PanelManager title="Technical Indicators">
                {lp && <div className="m-row">
                  <div className="m-item"><span className="l">RSI (14)</span><span className="v">{lp.RSI_14?.toFixed(1)}</span></div>
                  <div className="m-item"><span className="l">SMA 20</span><span className="v">₹{lp.SMA_20?.toFixed(2)}</span></div>
                  <div className="m-item"><span className="l">SMA 50</span><span className="v">₹{lp.SMA_50?.toFixed(2)}</span></div>
                  <div className="m-item"><span className="l">EMA 12</span><span className="v">₹{lp.EMA_12?.toFixed(2)}</span></div>
                </div>}
              </PanelManager>
              <PanelManager title="Recent History">
                <table className="dt"><thead><tr><th>Date</th><th>Close</th><th>Chg%</th><th>Vol</th></tr></thead>
                  <tbody>{stockData?.data?.slice(-6).reverse().map((d,i)=>{const p2=stockData.data[stockData.data.length-6+(5-i)-1];const c2=p2?((d.Close-p2.Close)/p2.Close*100).toFixed(2):'—';
                    return <tr key={i}><td>{d.Date?.slice(5)}</td><td>₹{d.Close?.toFixed(2)}</td><td style={{color:c2>0?'var(--green)':c2<0?'var(--red)':''}}>{c2}%</td><td>{(d.Volume/1e6).toFixed(1)}M</td></tr>})}</tbody>
                </table>
              </PanelManager>
            </div>
          </div>
        </>);

        /* ═══ ML PREDICTIONS ═══ */
        if (activeTab === 'predictions') return (
          <div className="split">
            <div className="col-main">
              <PanelManager title="LSTM Model Prediction" loading={predLoading}>
                <div style={{ display:'flex', gap:10, marginBottom:8, alignItems:'center' }}>
                  <div className="btn-group">
                    {['arima','lstm','hybrid'].map(m => <button key={m} className={`btn btn-sm ${predModel===m?'active':''}`} onClick={() => runPrediction(m)}>{m.toUpperCase()}</button>)}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:'auto' }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Max Trades:</span>
                    <input type="number" min="1" max="10" value={numTrades} onChange={e => setNumTrades(parseInt(e.target.value)||1)} 
                      style={{ width:40, background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:4, padding:'2px 5px', fontSize:'0.75rem' }} />
                  </div>
                </div>
                {!prediction && stockData && <PriceChart labels={stockData.data.map(d=>d.Date)} datasets={[{label:'Actual Price',data:stockData.data.map(d=>d.Close),fill:true}]} title={`${ticker} — Historical`}/>}
                {prediction && !prediction.error && <PriceChart labels={[...(prediction.dates||[]),...Array.from({length:prediction.forecast_days||30},(_,i)=>`F+${i+1}`)]}
                  datasets={[{label:'Actual Price',data:prediction.test_actual||[]},{label:'Predicted Price',data:[...Array((prediction.dates?.length||0)-(prediction.test_predictions||prediction.hybrid_predictions||[]).length).fill(null),...(prediction.test_predictions||prediction.hybrid_predictions||[]),...(prediction.future_forecast||prediction.hybrid_future||[])],color:'var(--red)'}]} title="Forecasting"/>}
                {prediction?.error && <div className="err">{prediction.error}</div>}
              </PanelManager>
              <div className="skills-sec"><div className="skills-lbl">Skills</div>
                <div className="skills-row">
                  <PanelManager title="Model Accuracy & Outlook (Explainable AI)">
                    {prediction?.metrics ? <PredictionCard metrics={prediction.metrics||prediction.metrics_hybrid} forecast={prediction.future_forecast||prediction.hybrid_future} lp={lp}/> : <div className="empty" style={{padding:'1rem'}}>Run a prediction first</div>}
                  </PanelManager>
                  <PanelManager title="Backtesting" subtitle="Simulated P/L" loading={btLoading}>
                    {!backtest ? <div className="empty"><button className="btn btn-primary" onClick={runBacktest}>Simulate</button></div> : (
                      <div className="m-grid">{[['₹'+backtest.final_value,'Final','--green'],[backtest.total_return_pct+'%','Return',backtest.total_return_pct>0?'--green':'--red'],[backtest.buy_hold_return_pct+'%','Market Avg (Hold)',backtest.buy_hold_return_pct>0?'--green':'--red']].map(([v,l,c],i)=>
                        <div key={i} className="m-box"><div className="n" style={{color:`var(${c})`}}>{v}</div><div className="lb">{l}</div></div>)}</div>
                    )}
                  </PanelManager>
                </div>
              </div>
            </div>
            <div className="col-side">
              <PanelManager title="Sentiment Analysis" subtitle="Powered by Reusable Skill" loading={sentLoading}>
                {sentiment && <>
                  <SentimentGauge score={sentiment.aggregate?.score||0} label={sentiment.aggregate?.label} summary={sentiment.summary}/>
                  <div style={{marginTop:8,maxHeight:140,overflowY:'auto'}}>{sentiment.articles?.slice(0,4).map((a,i)=>(
                    <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" style={{display:'flex',justifyContent:'space-between',padding:'4px 7px',margin:'2px 0',borderRadius:4,background:'var(--bg-elevated)',border:'1px solid var(--border-light)',fontSize:'0.7rem',textDecoration:'none',color:'var(--text-primary)'}}>
                      <span style={{flex:1}}>{a.headline} ↗</span><span style={{color:a.label==='Positive'?'var(--green)':a.label==='Negative'?'var(--red)':'var(--text-muted)',marginLeft:4,fontWeight:600}}>{a.compound?.toFixed(2)}</span></a>
                  ))}</div>
                </>}
              </PanelManager>
              <PanelManager title="Reinforcement Learning Agent" subtitle={`Backtested ${ticker} data`} loading={btLoading}>
                {!backtest ? <div className="empty"><button className="btn btn-primary" onClick={runBacktest}>Train Agent</button></div> : (
                  <div className="m-row">
                    <div className="m-item"><span className="l">Strategy Return</span><span className="v" style={{color:backtest.total_return_pct>0?'var(--green)':'var(--red)'}}>{backtest.total_return_pct}%</span></div>
                    <div className="m-item"><span className="l">vs Buy & Hold</span><span className="v">{backtest.buy_hold_return_pct}%</span></div>
                    <div className="m-item"><span className="l">Trades</span><span className="v">{backtest.trades?.length||0}</span></div>
                  </div>
                )}
              </PanelManager>
            </div>
          </div>
        );

        /* ═══ DAA LAB ═══ */
        if (activeTab === 'daa') return (
          <div className="split">
            <div className="col-main">
              <PanelManager title={algoTab==='dp'?'DP Stock Profit (O(n))':algoTab==='dc'?'Divide & Conquer Regression':algoTab==='sw'?'Trend Smoothing Engine':'Algorithm Visualizer'} loading={algoLoading}>
                <div style={{ display:'flex', gap:10, marginBottom:8, alignItems:'center' }}>
                  <div className="btn-group">
                    {[['dp','DP (Buy/Sell)'],['dc','D&C (Regression)'],['sw','Sliding Window']].map(([id,lb])=>
                      <button key={id} className={`btn btn-sm ${algoTab===id?'active':''}`} onClick={()=>runAlgo(id)}>{lb}</button>)}
                  </div>
                  {algoTab==='dp' && (
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:'auto' }}>
                      <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Allowed Trades:</span>
                      <input type="number" min="1" max="10" value={numTrades} onChange={e => setNumTrades(parseInt(e.target.value)||1)} 
                        style={{ width:40, background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:4, padding:'2px 5px', fontSize:'0.75rem' }} />
                    </div>
                  )}
                </div>
                {algoTab==='dp'&&dpData&&<>
                  <div className="m-grid" style={{marginBottom:10}}>
                    <div className="m-box" style={{ borderColor: 'rgba(255,170,0,0.2)' }}>
                      <div className="n" style={{color:'var(--amber)'}}>{dpData.naive?.execution_time_ms}ms</div>
                      <div className="lb">Legacy (Naive)</div>
                    </div>
                    <div className="m-box" style={{ borderColor: 'rgba(0,214,143,0.2)' }}>
                      <div className="n" style={{color:'var(--green)'}}>{dpData.single?.execution_time_ms}ms</div>
                      <div className="lb">Gatividhi Opt.</div>
                    </div>
                    <div className="m-box">
                      <div className="n" style={{color:'var(--accent)'}}>₹{dpData.single?.max_profit}</div>
                      <div className="lb">Target Profit</div>
                    </div>
                  </div>
                  <DPTableVisualizer dpData={dpData.k_transactions}/>
                </>}
                {algoTab==='dc'&&dcData&&<><PriceChart labels={dcData.dates||[]} datasets={[{label:'Actual',data:dcData.actual_prices},{label:'D&C Prediction',data:dcData.predictions,color:'var(--green)'}]}/><RecursionTreeVisualizer treeData={dcData.recursion_tree} segments={dcData.segments} dates={dcData.dates} prices={dcData.actual_prices}/></>}
                {algoTab==='sw'&&swData&&<SlidingWindowVisualizer swData={swData}/>}
                {!dpData&&!dcData&&!swData&&!algoLoading&&<div className="empty">Select an algorithm above</div>}
              </PanelManager>
              <div className="skills-sec"><div className="skills-lbl">Skills</div>
                <div className="skills-row">
                  <PanelManager title="Performance Analysis">
                    {dpData||dcData||swData ? <div className="m-row">
                      <div className="m-item"><span className="l">Processing Style</span><span className="v">{algoTab==='dp'?'Efficiency Optimized (DP)':algoTab==='dc'?'Recursive Breakdown (D&C)':'Live Rolling Average'}</span></div>
                      <div className="m-item"><span className="l">Speed Rating</span><span className="v" style={{color:'var(--green)'}}>{algoTab==='dc'?'Fast (O(N log N))':'Ultra Fast (O(N))'}</span></div>
                      <div className="m-item"><span className="l">Data Handling</span><span className="v">{algoTab==='dp'?'Batch Analysis':algoTab==='dc'?'Hierarchical':'Sequential'}</span></div>
                    </div> : <div className="empty" style={{padding:'0.8rem'}}>Run an algorithm first</div>}
                  </PanelManager>
                  <PanelManager title="Step-by-Step Visualization">
                    {algoTab==='dp'&&dpData?<DPTableVisualizer dpData={dpData.k_transactions}/>:algoTab==='dc'&&dcData?<RecursionTreeVisualizer treeData={dcData.recursion_tree} segments={dcData.segments} dates={dcData.dates} prices={dcData.actual_prices}/>:algoTab==='sw'&&swData?<SlidingWindowVisualizer swData={swData}/>:<div className="empty" style={{padding:'0.8rem'}}>Run algorithm first</div>}
                  </PanelManager>
                </div>
              </div>
            </div>
            <div className="col-side">
              <PanelManager title="Technical Specs" subtitle="Algorithm Characteristics">
                {dpData||dcData||swData ? <div className="m-row">
                  <div className="m-item"><span className="l">Efficiency</span><span className="v" style={{color:'var(--accent)'}}>{algoTab==='dp'?'Optimal':algoTab==='dc'?'High':'Excellent'}</span></div>
                  <div className="m-item"><span className="l">Memory Footprint</span><span className="v">{algoTab==='dp'?'Low (O(1))':algoTab==='dc'?'Medium (O(log N))':'Minimal (O(1))'}</span></div>
                </div> : <div className="empty" style={{padding:'1rem'}}>Run an algorithm</div>}
              </PanelManager>
              <PanelManager title="Chat Assistant"><ChatBot ticker={ticker}/></PanelManager>
            </div>
          </div>
        );

        /* ═══ ANALYSIS ═══ */
        if (activeTab === 'analysis') return (
          <div className="split">
            <div className="col-main">
              <PanelManager title="Algorithm Comparison" badge="COMPARE" badgeType="purple" loading={compLoading}>
                {!compData ? <div className="empty"><button className="btn btn-primary" onClick={runComparison}>Compare All Algorithms</button></div> : <>
                  <ComplexityChart comparisonData={compData.comparisons}/>
                  <table className="dt" style={{marginTop:8}}><thead><tr><th>Algorithm</th><th>Type</th><th>Time</th><th>O()</th></tr></thead>
                    <tbody>{compData.comparisons?.map((c,i)=><tr key={i}><td style={{fontWeight:600}}>{c.name}</td><td><span className={`card-badge b-${c.type==='ML Model'?'purple':'green'}`}>{c.type}</span></td><td>{c.execution_time_ms}ms</td><td style={{color:'var(--accent)',fontFamily:'monospace'}}>{c.time_complexity}</td></tr>)}</tbody></table>
                </>}
              </PanelManager>
              <PanelManager title="Complexity Benchmark" badge="BIG-O" loading={complexLoading}>
                {!complexityData ? <div className="empty"><button className="btn btn-primary" onClick={runComplexity}>Run Benchmark</button><p style={{marginTop:4,fontSize:'0.75rem'}}>Sizes: 50, 100, 250, 500, 1K, 2K</p></div> :
                  <div>{Object.entries(complexityData.algorithms||{}).map(([n,a])=><div key={n} style={{marginBottom:8}}><div style={{fontSize:'0.8rem',fontWeight:600}}>{n.replace(/_/g,' ')} — <code style={{color:'var(--accent)'}}>{a.theoretical}</code></div><div style={{display:'flex',gap:3,marginTop:3,flexWrap:'wrap'}}>{a.data?.map((d,i)=><div key={i} className="m-box" style={{minWidth:60,padding:'3px 5px'}}><div className="n" style={{fontSize:'0.8rem'}}>{d.time_ms}ms</div><div className="lb">n={d.size}</div></div>)}</div></div>)}</div>}
              </PanelManager>
            </div>
            <div className="col-side">
              <PanelManager title="Performance Analysis" subtitle="Powered by Skill">{compData ? <ComplexityChart comparisonData={compData.comparisons}/> : <div className="empty" style={{padding:'1rem'}}>Run comparison</div>}</PanelManager>
              <PanelManager title="Chat Assistant"><ChatBot ticker={ticker}/></PanelManager>
            </div>
          </div>
        );
        return null;
      }}
    </DashboardLayout>
  );
}
