import { useState, useEffect, useRef } from "react";

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Stock {
  sym: string;
  base: number;
}

interface FxPair {
  pair: string;
  base: number;
}

interface LiveStock extends Stock {
  price: number;
  chg: number;
  pct: number;
}

interface LiveFx extends FxPair {
  price: number;
  chg: number;
  pct: number;
}

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const STOCKS: Stock[] = [
  { sym: "AAPL", base: 213.45 },
  { sym: "NVDA", base: 892.10 },
  { sym: "MSFT", base: 415.88 },
  { sym: "TSLA", base: 187.22 },
  { sym: "AMZN", base: 198.33 },
  { sym: "META", base: 512.30 },
  { sym: "GOOGL", base: 172.44 },
  { sym: "BRK/B", base: 411.20 },
];

const FX_PAIRS: FxPair[] = [
  { pair: "EUR/USD", base: 1.0821 },
  { pair: "USD/JPY", base: 154.32 },
  { pair: "GBP/USD", base: 1.2435 },
  { pair: "USD/CHF", base: 0.9012 },
  { pair: "AUD/USD", base: 0.6543 },
  { pair: "USD/CAD", base: 1.3801 },
  { pair: "NZD/USD", base: 0.5988 },
  { pair: "USD/CNH", base: 7.2401 },
];

const TICKER_ITEMS = [
  "SPX 5842.31 +0.34%", "AAPL 213.45 +1.2%", "TSLA 187.22 -0.8%",
  "NVDA 892.10 +2.1%", "AMZN 198.33 +0.5%", "EURUSD 1.0821 -0.12%",
  "USDJPY 154.32 +0.3%", "GBPUSD 1.2435 +0.08%", "BTC 67341 +3.2%",
  "XAU 2389.4 +0.7%", "WTI 82.14 -0.4%", "DXY 104.23 +0.15%",
  "QQQ 448.22 +0.9%", "VIX 14.33 -2.1%", "TNX 4.512 +0.03",
  "MSFT 415.88 +0.6%", "GOOGL 172.44 +0.4%", "META 512.30 +1.8%",
];

const CHART_ROWS = 10; // Reduced from 14
const CHART_COLS = 40; // Reduced from 52
const BAR_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

// ── HELPERS ────────────────────────────────────────────────────────────────
const rand = (spread: number) => (Math.random() - 0.5) * spread;
const sign = (n: number) => n >= 0 ? "+" : "";
const fmt2 = (n: number) => n.toFixed(2);
const fmt4 = (n: number) => n.toFixed(4);
const fmt3 = (n: number) => n.toFixed(3);
const pad = (s: string, n: number) => s.padStart(n);

function generateChartSeed(): number[] {
  const data: number[] = [];
  let v = 5800 + Math.random() * 100;
  for (let i = 0; i < CHART_COLS; i++) {
    v += (Math.random() - 0.47) * 12;
    data.push(v);
  }
  return data;
}

function buildLiveStocks(): LiveStock[] {
  return STOCKS.map(s => {
    const chg = rand(3);
    return { ...s, price: s.base + chg, chg, pct: (chg / s.base) * 100 };
  });
}

function buildLiveFx(): LiveFx[] {
  return FX_PAIRS.map(f => {
    const chg = rand(0.006);
    return { ...f, price: f.base + chg, chg, pct: (chg / f.base) * 100 };
  });
}

// ── SUB-COMPONENTS ─────────────────────────────────────────────────────────

/** CRT overlay layers - now scoped to relative parent */
function CRTOverlays() {
  return (
    <>
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
      }} />
      {/* vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9,
        background: "radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.5) 100%)",
      }} />
      {/* sweep line */}
      <div style={{
        position: "absolute", left: 0, width: "100%", height: 2, zIndex: 8,
        background: "linear-gradient(to bottom,transparent,rgba(255,102,0,0.1),transparent)",
        animation: "bloom-sweep 6s linear infinite",
      }} />
    </>
  );
}

/** Scrolling ticker band */
function TickerBar() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      gridColumn: "1 / -1", height: 16, background: "#1a0800",
      border: "1px solid rgba(255,102,0,0.33)", overflow: "hidden",
      display: "flex", alignItems: "center",
    }}>
      <div style={{ whiteSpace: "nowrap", animation: "bloom-tickerMove 18s linear infinite", fontSize: 8, color: "#ffcc00" }}>
        {items.map((t, i) => {
          const up = !t.includes("-");
          return (
            <span key={i} style={{ color: up ? "#00ff88" : "#ff3344", marginRight: 18 }}>
              {t}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** ASCII bar chart */
function AsciiChart({ data }: { data: number[] }) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const grid: (string | null)[][] = Array.from({ length: CHART_ROWS }, () =>
    Array(CHART_COLS).fill(null)
  );

  for (let c = 0; c < CHART_COLS; c++) {
    const norm = (data[c] - min) / range;
    const row = CHART_ROWS - 1 - Math.floor(norm * (CHART_ROWS - 1));
    const barChar = BAR_CHARS[Math.floor(norm * 7)];
    const up = c === 0 || data[c] >= data[c - 1];
    grid[row][c] = up ? `up|${barChar}` : `dn|${barChar}`;
  }

  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;
  const diff = last - prev;
  const pct = ((diff / prev) * 100).toFixed(2);
  const up = diff >= 0;
  const arrow = up ? "▲" : "▼";

  return (
    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, lineHeight: 1.2 }}>
      {grid.map((row, ri) => {
        const price = max - (ri / (CHART_ROWS - 1)) * range;
        return (
          <div key={ri} style={{ display: "flex" }}>
            <span style={{ color: "rgba(255,102,0,0.33)", fontSize: 7, minWidth: 32 }}>
              {price.toFixed(0).padStart(5)}│
            </span>
            {row.map((cell, ci) => {
              if (!cell) return <span key={ci}> </span>;
              const [dir, ch] = cell.split("|");
              return (
                <span key={ci} style={{
                  color: dir === "up" ? "#00ff88" : "#ff3344",
                  textShadow: dir === "up" ? "0 0 4px rgba(0,255,136,0.4)" : "0 0 4px rgba(255,51,68,0.4)",
                }}>
                  {ch}
                </span>
              );
            })}
          </div>
        );
      })}
      <div style={{ color: "rgba(255,102,0,0.33)", fontSize: 7 }}>
        {"     └" + "─".repeat(CHART_COLS)}
      </div>
      <div style={{ color: up ? "#00ff88" : "#ff3344", fontSize: 8, marginTop: 1 }}>
        &nbsp;&nbsp;LAST {fmt2(last)} {arrow}{Math.abs(diff).toFixed(2)} ({arrow}{Math.abs(Number(pct))}%)
      </div>
    </div>
  );
}

/** Equities list panel */
function EquitiesPanel({ stocks }: { stocks: LiveStock[] }) {
  return (
    <div style={{ border: "1px solid rgba(255,102,0,0.2)", padding: 4, overflow: "hidden" }}>
      <div style={{ fontSize: 7, color: "#ffaa00", letterSpacing: 1, borderBottom: "1px solid rgba(255,102,0,0.13)", marginBottom: 3, textShadow: "0 0 6px rgba(255,170,0,0.53)" }}>
        ▸ EQUITIES
      </div>
      {stocks.map(s => (
        <div key={s.sym} style={{ fontSize: 8, display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
          <span style={{ color: "#ffaa00" }}>{s.sym.padEnd(5)}</span>
          <span style={{ color: s.chg >= 0 ? "#00ff88" : "#ff3344", textShadow: s.chg >= 0 ? "0 0 5px rgba(0,255,136,0.4)" : "0 0 5px rgba(255,51,68,0.4)" }}>
            {pad(fmt2(s.price), 7)}&nbsp;
            <span style={{ fontSize: 7 }}>{sign(s.chg)}{s.pct.toFixed(2)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** FX rates panel */
function FxPanel({ pairs }: { pairs: LiveFx[] }) {
  return (
    <div style={{ border: "1px solid rgba(255,102,0,0.2)", padding: 4, overflow: "hidden" }}>
      <div style={{ fontSize: 7, color: "#ffaa00", letterSpacing: 1, borderBottom: "1px solid rgba(255,102,0,0.13)", marginBottom: 3, textShadow: "0 0 6px rgba(255,170,0,0.53)" }}>
        ▸ FX RATES
      </div>
      {pairs.map(f => (
        <div key={f.pair} style={{ fontSize: 8, display: "flex", justifyContent: "space-between", marginBottom: 1 }}>
          <span style={{ color: "#ffaa00" }}>{f.pair}</span>
          <span style={{ color: f.chg >= 0 ? "#00ff88" : "#ff3344", textShadow: f.chg >= 0 ? "0 0 5px rgba(0,255,136,0.4)" : "0 0 5px rgba(255,51,68,0.4)" }}>
            {fmt4(f.price)}&nbsp;
            <span style={{ fontSize: 7 }}>{sign(f.chg)}{fmt3(f.pct)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Status bar */
function StatusBar({ blink }: { blink: boolean }) {
  return (
    <div style={{
      border: "1px solid rgba(255,102,0,0.2)", height: 18,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 4px", fontSize: 7, color: "rgba(255,102,0,0.53)",
      gridColumn: "1 / -1",
    }}>
      <span>F1:HELP&nbsp; F2:MSG&nbsp; F3:SRCH&nbsp; F9:NEWS</span>
      <span style={{ opacity: blink ? 1 : 0, transition: "opacity 0.1s" }}>█</span>
      <span>
        MENU&gt;&nbsp;
        <span style={{ color: "#ffcc00" }}>GP&lt;GO&gt;&nbsp; MOST&lt;GO&gt;</span>
      </span>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function BloombergTerminal() {
  const [clock, setClock] = useState("");
  const [blink, setBlink] = useState(true);
  const [mktVis, setMktVis] = useState(true);
  const [chart, setChart] = useState<number[]>([]);
  const [stocks, setStocks] = useState<LiveStock[]>([]);
  const [fx, setFx] = useState<LiveFx[]>([]);

  const chartRef = useRef<number[]>([]);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setClock(`${hh}:${mm}:${ss} EDT`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cursor blink
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 550);
    return () => clearInterval(id);
  }, []);

  // Market status blink
  useEffect(() => {
    const id = setInterval(() => setMktVis(v => !v), 1200);
    return () => clearInterval(id);
  }, []);

  // Chart init + live update
  useEffect(() => {
    chartRef.current = generateChartSeed();
    setChart([...chartRef.current]);

    const id = setInterval(() => {
      const d = chartRef.current;
      const last = d[d.length - 1];
      d.shift();
      d.push(last + (Math.random() - 0.47) * 8);
      setChart([...d]);
    }, 600);
    return () => clearInterval(id);
  }, []);

  // Equities live
  useEffect(() => {
    setStocks(buildLiveStocks());
    const id = setInterval(() => setStocks(buildLiveStocks()), 2000);
    return () => clearInterval(id);
  }, []);

  // FX live
  useEffect(() => {
    setFx(buildLiveFx());
    const id = setInterval(() => setFx(buildLiveFx()), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bloomberg-terminal-container" style={{
      width: "100%",
      height: "100%",
      maxWidth: "none",
      margin: "0 auto",
      position: "relative",
      backgroundColor: "transparent",
      padding: "2px",
      /* borderRadius: "8px",*/
      /*border: "1px solid rgba(255,255,255,0.05)", */
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

        .bloomberg-terminal-container {
          font-family: 'Share Tech Mono', monospace;
          color: #ff6600;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.6s ease;
        }

        .bloomberg-terminal-container:hover {
          transform: scale(1.02);
          border-color: transparent !important;
        }

        .orbit-panel {
          transform: none;
        }

        @keyframes bloom-sweep {
          0% { top: -1%; }
          100% { top: 101%; }
        }
        @keyframes bloom-tickerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div style={{
        position: "relative",
        zIndex: 5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}>
        {/* ── HEADER ── */}
        <div style={{
          fontFamily: "'VT323', monospace", fontSize: 11, color: "#ff6600",
          letterSpacing: 1, display: "flex", justifyContent: "space-between",
          width: "100%", borderBottom: "1px solid rgba(255,102,0,0.27)",
          paddingBottom: 2, textShadow: "0 0 4px rgba(255,102,0,0.67)",
          marginBottom: 6
        }}>
          <span>{clock}</span>
          <span>EQUITY | FX | RATES | CMDTY</span>
        </div>

        {/* ── Main panel (3D Orbit) ── */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", flex: 1, minHeight: 0 }}>
          <div className="orbit-panel" style={{
            position: "relative", width: "100%", maxWidth: "none", height: "100%",
            minHeight: 0,
          }}>
            <div style={{
              width: "100%", height: "100%",
              border: "1px solid rgba(255,102,0,0.33)",
              background: "#0a0a0a",
              padding: 4, fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9, lineHeight: 1.3, color: "#ff6600",
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              gridTemplateRows: "auto 1fr auto",
              gap: 4,
            }}>

              <TickerBar />

              {/* Chart panel */}
              <div style={{
                gridRow: 2, gridColumn: 1,
                border: "1px solid rgba(255,102,0,0.2)", padding: 4, overflow: "hidden",
              }}>
                <div style={{ fontSize: 7, color: "#ffaa00", letterSpacing: 1, borderBottom: "1px solid rgba(255,102,0,0.13)", marginBottom: 2, textShadow: "0 0 6px rgba(255,170,0,0.53)" }}>
                  ▸ SPX INDEX [GP]
                </div>
                <AsciiChart data={chart} />
              </div>

              <div style={{ gridRow: 2, gridColumn: 2 }}>
                <EquitiesPanel stocks={stocks} />
              </div>

              <div style={{ gridRow: 2, gridColumn: 3 }}>
                <FxPanel pairs={fx} />
              </div>

              <div style={{ gridRow: 3, gridColumn: "1 / -1" }}>
                <StatusBar blink={blink} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          fontSize: 8, color: "rgba(255,102,0,0.4)", letterSpacing: 1,
          width: "100%", display: "flex", justifyContent: "space-between",
          borderTop: "1px solid rgba(255,102,0,0.13)", paddingTop: 2,
          marginTop: 6
        }}>
          <span>LAPT&nbsp; 1&nbsp; /&nbsp; BBG</span>
          <span style={{ color: "#00ff88", opacity: mktVis ? 1 : 0.3, transition: "opacity 0.2s" }}>
            ● MARKETS OPEN
          </span>
          <span>NYC LON TOK HKG</span>
        </div>
      </div>

      <CRTOverlays />
    </div>
  );
}
