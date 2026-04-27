/**
 * ChatBot.jsx — Skill: Stock Query Chatbot
 * ==========================================
 * Skills System: Reusable chatbot interface for stock queries.
 */
import { useState } from 'react';
import { chat } from '../services/api';

export default function ChatBot({ ticker }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! Ask me about ${ticker || 'any stock'}. Try: "What's the price?" or "Should I buy?"` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput(''); setLoading(true);
    try {
      const { data } = await chat({ message: userMsg, ticker: ticker || 'AAPL' });
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="chat-msgs">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role==='user'?'chat-u':'chat-b'}`}>{m.text}</div>
        ))}
        {loading && <div className="chat-msg chat-b" style={{ opacity: 0.5 }}>Thinking...</div>}
      </div>
      <div className="chat-row">
        <input className="chat-in" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask about stocks..." />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
