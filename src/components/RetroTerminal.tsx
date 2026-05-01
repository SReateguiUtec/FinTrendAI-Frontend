import React, { useState, useEffect, useRef } from 'react';

// --- CONFIGURACIÓN COLORES (Dorado LaserFlow) ---
const PRIMARY = "#ff6600";
const PRIMARY_BRIGHT = "#ffaa00";
const DARK_PRIMARY = "rgba(255, 102, 0, 0.3)";
const BG = "transparent";
const UP_COLOR = "#4ade80";
const DOWN_COLOR = "#f87171";

const INITIAL_STOCKS = [
  { sym: "AAPL", price: 190.42, chg: 3.24 },
  { sym: "NVDA", price: 875.20, chg: 7.81 },
  { sym: "MSFT", price: 415.60, chg: 1.05 },
  { sym: "TSLA", price: 172.10, chg: -2.33 },
  { sym: "AMZN", price: 198.85, chg: 4.17 },
];

export default function RetroBloomberg() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY", "DATA LINK_OK"]);
  const [chartData, setChartData] = useState<number[]>(Array.from({ length: 80 }, () => 40 + Math.random() * 20));
  const [time, setTime] = useState("");
  const [mktVis, setMktVis] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }) + " EDT");
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const next = last + (Math.random() - 0.5) * 6;
        newData.push(Math.max(15, Math.min(85, next)));
        return newData;
      });
      if (Math.random() > 0.85) {
        setLogs(p => [`> UPDATE ${INITIAL_STOCKS[Math.floor(Math.random() * 5)].sym}`, ...p].slice(0, 4));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const movement = (Math.random() - 0.5) * (s.price * 0.002);
        return { ...s, price: s.price + movement, chg: s.chg + (movement * 0.1) };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blinkId = setInterval(() => setMktVis(v => !v), 1200);
    return () => clearInterval(blinkId);
  }, []);

  const points = chartData.map((val, i) => `${(i * 1000) / (chartData.length - 1)},${100 - val}`).join(' ');

  return (
    <div style={{
      backgroundColor: BG, color: PRIMARY, fontFamily: "'Share Tech Mono', monospace",
      width: "100%",
      height: "305px",
      padding: "6px", display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative", textTransform: "uppercase",
      fontSize: "9px", boxSizing: "border-box"
    }}>

      {/* SCANLINES CRT */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)",
        backgroundSize: "100% 2px", pointerEvents: "none", zIndex: 10
      }} />

      {/* 1. HEADER */}
      <div style={{
        display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${PRIMARY}`,
        paddingBottom: "2px", marginBottom: "4px", flexShrink: 0
      }}>
        <div style={{ fontWeight: "bold" }}><span style={{ backgroundColor: PRIMARY, color: "#000", padding: "0 3px" }}>BBG</span> FINTREND AI</div>
        <div style={{ fontSize: "8px" }}>{time}</div>
      </div>

      {/* 2. TICKER REORGANIZADO CON COLORES DINÁMICOS */}
      <div style={{
        borderBottom: `1px solid ${DARK_PRIMARY}`,
        paddingBottom: "2px",
        marginBottom: "4px",
        flexShrink: 0,
        overflow: "hidden"
      }}>
        <div style={{
          display: "flex",
          whiteSpace: "nowrap",
          animation: "ticker-anim 25s linear infinite",
          fontSize: "8.5px"
        }}>
          {/* Duplicamos el mapeo para un loop visual infinito sin saltos */}
          {[...stocks, ...stocks].map((s, idx) => {
            const isUp = s.chg >= 0;
            const color = isUp ? UP_COLOR : DOWN_COLOR;

            return (
              <span key={`${s.sym}-${idx}`} style={{ marginRight: "30px", fontWeight: "500" }}>
                {/* Ticker en ámbar/dorado fijo */}
                <span style={{ color: PRIMARY }}>{s.sym}</span>

                {/* Precio y porcentaje con color dinámico */}
                <span style={{ color: color, marginLeft: "5px" }}>
                  {s.price.toFixed(2)} {isUp ? "▲" : "▼"}
                  {Math.abs((s.chg / s.price) * 100).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 3. ÁREA DE DATOS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "6px", flex: 1, minHeight: 0 }}>

        <section style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "4px", flexShrink: 0 }}>
            <thead>
              <tr style={{ textAlign: "left", color: PRIMARY_BRIGHT, fontSize: "8px", borderBottom: `1px solid ${DARK_PRIMARY}` }}>
                <th>TICKER</th>
                <th>LAST</th>
                <th>CHG</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => <StockRow key={s.sym} stock={s} />)}
            </tbody>
          </table>

          {/* GRÁFICO SVG */}
          <div style={{
            flex: 1, minHeight: 0, border: `1px solid ${DARK_PRIMARY}`,
            position: "relative", backgroundColor: "rgba(212, 175, 55, 0.05)"
          }}>
            <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ display: "block" }}>
              <polyline
                fill="none" stroke={PRIMARY} strokeWidth="1.5" vectorEffect="non-scaling-stroke"
                points={points} style={{ transition: "all 0.4s linear" }}
              />
            </svg>
          </div>
        </section>

        {/* LOGS */}
        <aside style={{ border: `1px solid ${DARK_PRIMARY}`, padding: "4px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ color: PRIMARY_BRIGHT, fontSize: "8px", borderBottom: `1px solid ${DARK_PRIMARY}`, marginBottom: "2px", flexShrink: 0 }}>// LOGS</div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            {logs.map((log, i) => (
              <div key={i} style={{ opacity: 1 - (i * 0.25), marginBottom: "2px", fontSize: "8px", whiteSpace: "nowrap" }}>{log}</div>
            ))}
          </div>
        </aside>
      </div>

      {/* 4. FOOTER CENTRADO */}
      <div style={{
        marginTop: "4px", borderTop: `1px solid ${DARK_PRIMARY}`, paddingTop: "3px",
        display: "flex", alignItems: "center", fontSize: "8px", flexShrink: 0
      }}>
        <span style={{ flex: 1, textAlign: "left" }}>LAPT 1 / BBG</span>
        <span style={{ flex: 1, textAlign: "center", color: UP_COLOR, opacity: mktVis ? 1 : 0.3, fontWeight: "bold" }}>
          ● MARKETS OPEN
        </span>
        <span style={{ flex: 1, textAlign: "right" }}>NYC LON TOK</span>
      </div>

      <style>{`
        @keyframes ticker-anim { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .up-f { animation: t-g 0.6s ease-out; }
        .dn-f { animation: t-r 0.6s ease-out; }
        @keyframes t-g { 0% { color: #fff; text-shadow: 0 0 6px ${UP_COLOR}; } 100% { color: ${UP_COLOR}; } }
        @keyframes t-r { 0% { color: #fff; text-shadow: 0 0 6px ${DOWN_COLOR}; } 100% { color: ${DOWN_COLOR}; } }
      `}</style>
    </div>
  );
}

function StockRow({ stock }: { stock: any }) {
  const [flash, setFlash] = useState("");
  const prevPrice = useRef(stock.price);

  useEffect(() => {
    if (stock.price > prevPrice.current) setFlash("up-f");
    else if (stock.price < prevPrice.current) setFlash("dn-f");
    prevPrice.current = stock.price;
    const t = setTimeout(() => setFlash(""), 600);
    return () => clearTimeout(t);
  }, [stock.price]);

  const isUp = stock.chg >= 0;

  return (
    <tr style={{ height: "15px", borderBottom: `1px dashed ${DARK_PRIMARY}` }}>
      <td style={{ fontWeight: "bold" }}>{stock.sym}</td>
      {/* LAST ahora hereda el color de la tendencia (UP/DOWN) */}
      <td>
        <span className={flash} style={{ color: isUp ? UP_COLOR : DOWN_COLOR }}>
          {stock.price.toFixed(2)}
        </span>
      </td>
      <td style={{ color: isUp ? UP_COLOR : DOWN_COLOR }}>
        <span className={flash}>{isUp ? "+" : ""}{stock.chg.toFixed(2)}</span>
      </td>
    </tr>
  );
}