import React, { useState, useEffect, useRef } from 'react';

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: '#0a0a0a',
  bg2: '#111111',
  bg3: '#1a1a1a',
  border: '#3d1f00',
  amber: '#ff7700',
  amberDim: '#a64d00',
  green: '#00e676',
  red: '#ff1744',
  text: '#ffdcb8',
  textDim: '#8c5933',
  textMid: '#bf7945',
  mono: "'Courier New', monospace",
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Stock {
  ticker: string;
  last: number;
  chg: number;
  pct: number;
  vol: string;
  w52: string;
}

interface LogEntry {
  time: string;
  ticker: string;
  msg: string;
  isNew: boolean;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const INITIAL_STOCKS: Stock[] = [
  { ticker: 'AAPL', last: 191.64, chg: +3.36, pct: +1.79, vol: '58.2M', w52: '142-199' },
  { ticker: 'NVDA', last: 872.22, chg: +7.51, pct: +0.87, vol: '41.7M', w52: '466-974' },
  { ticker: 'MSFT', last: 417.47, chg: +1.24, pct: +0.30, vol: '22.1M', w52: '309-430' },
  { ticker: 'TSLA', last: 171.22, chg: -2.42, pct: -1.39, vol: '88.4M', w52: '138-271' },
  { ticker: 'AMZN', last: 198.89, chg: +4.17, pct: +2.14, vol: '33.6M', w52: '153-201' },
];

const INITIAL_LOGS: LogEntry[] = [
  { time: '19:34:21', ticker: 'TSLA', msg: 'MODEL UPDATE · BEARISH SIGNAL', isNew: true },
  { time: '19:33:58', ticker: 'AMZN', msg: 'PRICE TARGET REVISED +3.2%', isNew: true },
  { time: '19:33:12', ticker: 'NVDA', msg: 'EARNINGS BEAT DETECTED', isNew: true },
  { time: '19:31:44', ticker: 'AAPL', msg: 'SUPPORT LEVEL TESTED', isNew: false },
];

const STATS = [
  { label: 'PRECISION AVG', value: '86.3%', pos: true },
  { label: 'COMPANIES', value: '1,001', pos: false },
  { label: 'PREDICTIONS', value: '6,847', pos: false },
  { label: 'AI SIGNALS', value: '12 NEW', pos: true },
  { label: 'AVG RETURN', value: '+11.4%', pos: true },
  { label: 'WIN RATE', value: '73.2%', pos: false },
];

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const W = 500, H = 60;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;
  const px = (i: number) => (i / (data.length - 1)) * W;
  const py = (v: number) => H - ((v - mn) / range) * (H - 6) - 3;
  const lineD = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const fillD = `${lineD} L${W},${H} L0,${H} Z`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ft-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.amber} stopOpacity={0.2} />
          <stop offset="100%" stopColor={T.amber} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#ft-fill)" />
      <path d={lineD} fill="none" stroke={T.amber} strokeWidth="1.5" />
    </svg>
  );
}

// ─── STOCK ROW ────────────────────────────────────────────────────────────────
function StockRow({ stock, selected, onSelect }: {
  stock: Stock; selected: boolean; onSelect: (t: string) => void;
}) {
  const [flash, setFlash] = useState<'up' | 'dn' | ''>('');
  const prev = useRef(stock.last);
  useEffect(() => {
    if (stock.last > prev.current) setFlash('up');
    else if (stock.last < prev.current) setFlash('dn');
    prev.current = stock.last;
    const t = setTimeout(() => setFlash(''), 500);
    return () => clearTimeout(t);
  }, [stock.last]);

  const isUp = stock.chg >= 0;
  const clr = isUp ? T.green : T.red;
  const sign = isUp ? '+' : '';
  const arrow = isUp ? '▲' : '▼';
  const fc = flash === 'up' ? T.green : flash === 'dn' ? T.red : T.text;
  const cell: React.CSSProperties = { padding: '5px 10px', borderBottom: `1px solid #161616` };

  return (
    <tr onClick={() => onSelect(stock.ticker)} style={{ background: selected ? '#1a1400' : 'transparent', cursor: 'pointer' }}>
      <td style={{ ...cell, color: T.amber, fontWeight: 'bold', letterSpacing: '0.5px' }}>{stock.ticker}</td>
      <td style={{ ...cell, color: fc, transition: 'color 0.3s' }}>{stock.last.toFixed(2)}</td>
      <td className="ft-hide-mobile" style={{ ...cell, color: clr }}>{arrow} {sign}{stock.chg.toFixed(2)}</td>
      <td style={{ ...cell, color: clr }}>{sign}{stock.pct.toFixed(2)}%</td>
      <td className="ft-hide-mobile" style={{ ...cell, color: T.textDim }}>{stock.vol}</td>
      <td className="ft-hide-mobile" style={{ ...cell, color: T.textDim, fontSize: '10px' }}>{stock.w52}</td>
    </tr>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RetroTerminalV2() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [chart, setChart] = useState<number[]>(
    Array.from({ length: 52 }, (_, i) => 30 + i * 0.4 + (Math.random() - 0.5) * 8)
  );
  const [clock, setClock] = useState('');
  const [blink, setBlink] = useState(true);
  const [selected, setSelected] = useState('AMZN');
  const [activeTab, setActiveTab] = useState('WATCHLIST');

  useEffect(() => {
    const pad = (x: number) => String(x).padStart(2, '0');
    const tick = () => { const n = new Date(); setClock(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())} EDT`); };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  useEffect(() => { const id = setInterval(() => setBlink(v => !v), 1200); return () => clearInterval(id); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const d = (Math.random() - 0.5) * s.last * 0.0015;
        const nl = s.last + d, nc = s.chg + d * 0.05;
        return { ...s, last: nl, chg: nc, pct: (nc / nl) * 100 };
      }));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setChart(prev => { const last = prev[prev.length - 1]; return [...prev.slice(1), Math.max(15, Math.min(85, last + (Math.random() - 0.48) * 4))]; });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tickers = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOG'];
    const msgs = ['BULLISH SIGNAL', 'PRICE TARGET UP', 'VOLUME SPIKE', 'SUPPORT HIT', 'RESISTANCE BREAK', 'MODEL UPDATED'];
    const pad = (x: number) => String(x).padStart(2, '0');
    const id = setInterval(() => {
      if (Math.random() > 0.65) {
        const n = new Date();
        setLogs(prev => [{
          time: `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`,
          ticker: tickers[Math.floor(Math.random() * tickers.length)],
          msg: msgs[Math.floor(Math.random() * msgs.length)],
          isNew: true,
        }, ...prev.slice(0, 5)].map((l, i) => ({ ...l, isNew: i === 0 })));
      }
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const sel = stocks.find(s => s.ticker === selected) ?? stocks[0];
  const TABS = ['WATCHLIST', 'PORTFOLIO', 'ALERTS', 'NEWS'];

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0, // Forces exactly 100% of parent
      background: 'transparent',
      border: 'none',
      fontFamily: T.mono,
      fontSize: '11px',
      color: T.text,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: 0,
      pointerEvents: 'auto',
    }}>

      {/* TOP BAR — flexShrink 0 */}
      <div style={{
        background: '#D4AF37', color: '#000', padding: '4px 10px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontWeight: 'bold', fontSize: '10px', letterSpacing: '0.5px',
        borderTopLeftRadius: '14px', borderTopRightRadius: '14px',
      }}>
        {/* Left Side (hidden on mobile to save space) */}
        <div className="ft-hide-mobile" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '1px' }}>
          <span style={{ color: T.red, opacity: blink ? 1 : 0.4, transition: 'opacity 0.3s', fontSize: '9px' }}>●</span>
          <span style={{ opacity: 0.8 }}>MARKETS OPEN</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>FINTREND AI</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ fontWeight: 'normal' }}>EQUITY WATCHLIST</span>
        </div>
        <div style={{ flex: 1, textAlign: 'right', letterSpacing: '1px' }}>
          {clock}
        </div>
      </div>

      {/* TICKER SCROLL — flexShrink 0 */}
      <div style={{ background: '#0d0d00', borderBottom: `1px solid ${T.border}`, padding: '3px 0', overflow: 'hidden', whiteSpace: 'nowrap', flexShrink: 0 }}>
        <div style={{ display: 'inline-block', animation: 'ft-scroll 28s linear infinite', fontSize: '10px' }}>
          {[...stocks, ...stocks].map((s, i) => (
            <span key={i} style={{ color: T.textMid }}>
              <span style={{ color: T.amber, marginLeft: '20px', marginRight: '4px' }}>{s.ticker}</span>
              {s.last.toFixed(2)}
              <span style={{ color: s.chg >= 0 ? T.green : T.red, marginLeft: '4px' }}>{s.chg >= 0 ? '+' : ''}{s.chg.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* MAIN GRID — flex 1, minHeight 0 prevents overflow */}
      <div className="ft-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT PANEL: 4-row grid — header / tabs / table(1fr) / chart(fixed) */}
        <div className="ft-left-panel" style={{ borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

          {/* Price header */}
          <div style={{ padding: '4px 10px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'baseline', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: T.textDim }}>{sel.ticker} US</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{sel.last.toFixed(2)}</span>
            <span style={{ fontSize: '10px', color: sel.chg >= 0 ? T.green : T.red }}>
              {sel.chg >= 0 ? '▲' : '▼'} {sel.chg >= 0 ? '+' : ''}{sel.chg.toFixed(2)} ({sel.pct >= 0 ? '+' : ''}{sel.pct.toFixed(2)}%)
            </span>
            <span style={{ color: T.textDim, fontSize: '9px', marginLeft: 'auto' }}>USD · NASDAQ</span>
          </div>

          {/* Chart — Compacted & Moved Up */}
          <div style={{ borderBottom: `1px solid ${T.border}`, padding: '4px 10px', boxSizing: 'border-box', overflow: 'hidden', flexShrink: 0, height: '45px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: T.textDim, marginBottom: '2px' }}>
              <span>{sel.ticker} · INTRADAY · 1D</span>
              <span>H:{(sel.last * 1.004).toFixed(2)} L:{(sel.last * 0.994).toFixed(2)} C:{sel.last.toFixed(2)}</span>
            </div>
            <div style={{ height: '26px' }}>
              <Sparkline data={chart} />
            </div>
          </div>

          {/* Tabs */}
          <div className="ft-tabs" style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.bg2, flexShrink: 0 }}>
            {TABS.map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '3px 10px', fontSize: '9px', cursor: 'pointer', letterSpacing: '0.5px',
                color: activeTab === tab ? T.amber : T.textDim,
                borderRight: `1px solid ${T.border}`,
                borderBottom: activeTab === tab ? `2px solid ${T.amber}` : '2px solid transparent',
                background: activeTab === tab ? T.bg : 'transparent',
              }}>
                {tab}
              </div>
            ))}
          </div>

          {/* Table — STATIC */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: T.bg3, position: 'sticky', top: 0 }}>
                  {['TICKER', 'LAST', 'CHG', 'CHG%', 'VOL', '52W'].map(h => (
                    <th key={h} className={(h === 'CHG' || h === 'VOL' || h === '52W') ? 'ft-hide-mobile' : ''} style={{ padding: '2px 8px', textAlign: 'left', fontSize: '8px', color: T.textDim, letterSpacing: '0.5px', borderBottom: `1px solid ${T.border}`, fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.map(s => <StockRow key={s.ticker} stock={s} selected={s.ticker === selected} onSelect={setSelected} />)}
              </tbody>
            </table>
          </div>

        </div>{/* end LEFT */}

        {/* RIGHT PANEL */}
        <div className="ft-right-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

          {/* Log header */}
          <div style={{
            padding: '4px 8px', background: T.bg3, borderBottom: `1px solid ${T.border}`,
            fontSize: '9px', color: T.textDim, letterSpacing: '0.5px',
            display: 'flex', justifyContent: 'space-between', flexShrink: 0
          }}>
            <span>// SYSTEM LOG</span>
            <span style={{ color: T.amber }}>{logs.length} EVENTS</span>
          </div>

          {/* Logs */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {logs.map((l, i) => (
              <div key={i} style={{
                padding: '3px 8px', fontSize: '9px', borderBottom: `1px solid #141414`,
                display: 'flex', gap: '5px', color: l.isNew ? T.textMid : T.textDim,
                opacity: Math.max(0.2, 1 - i * 0.15),
              }}>
                <span style={{ color: T.amberDim, minWidth: '45px', fontSize: '8px' }}>{l.time}</span>
                <span style={{ color: T.green, minWidth: '28px' }}>{l.ticker}</span>
                <span style={{ fontSize: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.msg}</span>
              </div>
            ))}
          </div>

          {/* Stats — always at bottom */}
          <div className="ft-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: T.border, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            {[
              { label: 'PRECISION AVG', value: '86.3%', pos: true },
              { label: 'COMPANIES', value: '1,001', pos: false },
              { label: 'PREDICTIONS', value: '6,847', pos: false },
              { label: 'AI SIGNALS', value: '12 NEW', pos: true },
              { label: 'AVG RETURN', value: '+11.4%', pos: true },
              { label: 'WIN RATE', value: '73.2%', pos: false },
            ].map(s => (
              <div key={s.label} style={{ background: T.bg, padding: '5px 8px' }}>
                <div style={{ fontSize: '8px', color: T.textDim, letterSpacing: '0.5px', marginBottom: '1px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: s.pos ? T.green : T.text }}>{s.value}</div>
              </div>
            ))}
          </div>

        </div>{/* end RIGHT */}

      </div>{/* end MAIN GRID */}

      {/* FOOTER — flexShrink 0 */}
      <div className="ft-footer" style={{
        background: T.bg2, borderTop: `1px solid ${T.border}`, padding: '3px 10px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: T.textDim,
        borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px',
      }}>
        <span>LAPT 1 / BBG · <span style={{ color: T.amber }}>F1</span> HELP · <span style={{ color: T.amber }}>F5</span> REFRESH · <span style={{ color: T.amber }}>F8</span> AI</span>
        <span style={{ color: T.green, opacity: blink ? 1 : 0.3, transition: 'opacity 0.3s' }}>● MARKETS OPEN</span>
        <span>NYC · LON · TOK · HKG</span>
      </div>

      <style>{`
        @keyframes ft-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        
        @media (max-width: 768px) {
          .ft-main-grid { display: flex !important; flex-direction: column !important; }
          .ft-hide-mobile { display: none !important; }
          .ft-right-panel { display: none !important; }
          .ft-tabs { display: none !important; }
          .ft-footer { display: none !important; }
          .ft-left-panel { border-right: none !important; border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; overflow: hidden; }
        }
      `}</style>
    </div>
  );
}