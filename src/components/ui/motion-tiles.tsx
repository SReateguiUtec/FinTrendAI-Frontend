"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface MotionTileItem {
  src?: string;
  content?: React.ReactNode;
  alt: string;
  className?: string;
}

interface MotionTileCardProps {
  src?: string;
  content?: React.ReactNode;
  alt: string;
  className?: string;
  isLifted: boolean;
  onHover?: () => void;
  isActive?: boolean;
  onTap?: () => void;
}

function MotionTileCard({
  src,
  content,
  alt,
  className,
  isLifted,
  onHover,
  isActive,
  onTap,
}: MotionTileCardProps) {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !isActive) {
      e.preventDefault();
      onTap?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={onHover}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
        "w-[240px] lg:w-[320px] -skew-y-[8deg] select-none cursor-default",
        "transition-all duration-500 hover:border-border/80",
        isLifted && "-mt-8 sm:-mt-10",
        isActive && "ring-2 ring-primary/50",
        "dark:after:absolute dark:after:-right-1 dark:after:top-[-5%] dark:after:h-[110%] dark:after:w-[20rem] dark:after:bg-gradient-to-l dark:after:from-background dark:after:to-transparent dark:after:content-[''] dark:after:pointer-events-none",
        className
      )}
    >
      {content ? (
        <div aria-label={alt} className="w-full">
          {content}
        </div>
      ) : src ? (
        <img
          src={src}
          alt={alt}
          className="block h-auto w-full object-cover object-top"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ) : null}
    </div>
  );
}

// ── SVG Tile Components ──────────────────────────────────────────────────────

/** Tile 1 — Dashboard resumen: métricas clave al instante */
function TileClaridad() {
  return (
    <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <rect width="320" height="420" fill="#0e0e0e" />
      {/* Status bar */}
      <rect x="0" y="0" width="320" height="44" fill="#111111" />
      <rect x="16" y="16" width="48" height="8" rx="4" fill="#ffffff" fillOpacity="0.12" />
      <rect x="240" y="16" width="20" height="8" rx="4" fill="#ffffff" fillOpacity="0.08" />
      <rect x="264" y="16" width="16" height="8" rx="4" fill="#D4AF37" fillOpacity="0.4" />
      <rect x="284" y="16" width="24" height="8" rx="4" fill="#ffffff" fillOpacity="0.08" />
      {/* Page title */}
      <rect x="16" y="56" width="96" height="12" rx="5" fill="#ffffff" fillOpacity="0.9" />
      <rect x="16" y="74" width="64" height="7" rx="3" fill="#ffffff" fillOpacity="0.2" />
      {/* Top metric cards row */}
      <rect x="16" y="96" width="132" height="72" rx="10" fill="#1a1a1a" />
      <rect x="16" y="96" width="132" height="72" rx="10" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" fill="none" />
      <rect x="28" y="108" width="40" height="6" rx="3" fill="#ffffff" fillOpacity="0.25" />
      <rect x="28" y="120" width="72" height="14" rx="4" fill="#10b981" fillOpacity="0.9" />
      <rect x="28" y="140" width="52" height="6" rx="3" fill="#10b981" fillOpacity="0.35" />
      <rect x="80" y="140" width="30" height="6" rx="3" fill="#ffffff" fillOpacity="0.12" />

      <rect x="156" y="96" width="148" height="72" rx="10" fill="#1a1a1a" />
      <rect x="156" y="96" width="148" height="72" rx="10" stroke="#D4AF37" strokeOpacity="0.2" strokeWidth="1" fill="none" />
      <rect x="168" y="108" width="48" height="6" rx="3" fill="#ffffff" fillOpacity="0.25" />
      <rect x="168" y="120" width="80" height="14" rx="4" fill="#D4AF37" fillOpacity="0.9" />
      <rect x="168" y="140" width="40" height="6" rx="3" fill="#D4AF37" fillOpacity="0.4" />
      <rect x="212" y="140" width="48" height="6" rx="3" fill="#ffffff" fillOpacity="0.1" />

      {/* Mini sparkline chart */}
      <rect x="16" y="180" width="288" height="100" rx="10" fill="#161616" />
      <rect x="16" y="180" width="288" height="100" rx="10" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" fill="none" />
      <rect x="28" y="191" width="56" height="7" rx="3" fill="#ffffff" fillOpacity="0.2" />
      <rect x="248" y="189" width="44" height="11" rx="4" fill="#D4AF37" fillOpacity="0.15" />
      <rect x="254" y="192" width="32" height="5" rx="2" fill="#D4AF37" fillOpacity="0.5" />
      {/* Sparkline path */}
      <polyline
        points="28,255 60,245 90,258 118,232 148,248 178,222 208,238 238,215 268,228 292,218"
        stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"
      />
      <polyline
        points="28,255 60,245 90,258 118,232 148,248 178,222 208,238 238,215 268,228 292,218 292,272 28,272"
        fill="#D4AF37" fillOpacity="0.06"
      />
      {/* Dot on last point */}
      <circle cx="292" cy="218" r="3.5" fill="#D4AF37" fillOpacity="0.9" />

      {/* Watchlist rows */}
      <rect x="16" y="292" width="288" height="1" fill="#ffffff" fillOpacity="0.05" />
      {[
        { sym: "NVDA", val: "+5.82%", green: true,  w1: 36, w2: 52 },
        { sym: "AAPL", val: "+1.24%", green: true,  w1: 30, w2: 52 },
        { sym: "TSLA", val: "+2.14%", green: true,  w1: 28, w2: 52 },
        { sym: "META", val: "−1.05%", green: false, w1: 32, w2: 52 },
      ].map(({ sym: _sym, val: _val, green, w1, w2 }, i) => (
        <g key={i}>
          <rect x="16"  y={305 + i * 26} width={w1} height="7" rx="3" fill="#ffffff" fillOpacity="0.5" />
          <rect x="60"  y={305 + i * 26} width={w2 + i * 4} height="7" rx="3" fill="#ffffff" fillOpacity="0.1" />
          <rect x="230" y={305 + i * 26} width="36" height="7" rx="3"
            fill={green ? "#10b981" : "#ef4444"} fillOpacity="0.6" />
          <rect x="272" y={305 + i * 26} width="32" height="7" rx="3" fill="#ffffff" fillOpacity="0.08" />
        </g>
      ))}
    </svg>
  );
}

/** Tile 2 — Panel de señales con RSI y candlesticks */
function TileSenal() {
  // Candlestick data: [open, close, high, low]
  const candles = [
    [155, 162, 165, 152], [162, 158, 164, 155], [158, 170, 172, 156],
    [170, 167, 173, 165], [167, 178, 180, 165], [178, 172, 181, 170],
    [172, 185, 187, 170], [185, 180, 188, 178], [180, 192, 194, 178],
  ];
  const chartTop = 90; const chartH = 100;
  const minP = 150; const maxP = 196; const range = maxP - minP;
  const toY = (p: number) => chartTop + chartH - ((p - minP) / range) * chartH;
  const cW = 18; const cGap = 12;
  const startX = 28;

  return (
    <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <rect width="320" height="420" fill="#0e0e0e" />
      {/* Header */}
      <rect x="0" y="0" width="320" height="44" fill="#111111" />
      <rect x="16" y="14" width="32" height="8" rx="4" fill="#ffffff" fillOpacity="0.5" />
      <rect x="52" y="14" width="24" height="8" rx="4" fill="#ffffff" fillOpacity="0.12" />
      <rect x="80" y="14" width="24" height="8" rx="4" fill="#ffffff" fillOpacity="0.12" />
      <rect x="224" y="10" width="80" height="16" rx="5" fill="#D4AF37" fillOpacity="0.15" />
      <rect x="232" y="14" width="64" height="8" rx="4" fill="#D4AF37" fillOpacity="0.5" />
      {/* Symbol + price */}
      <rect x="16" y="52" width="56" height="13" rx="5" fill="#ffffff" fillOpacity="0.85" />
      <rect x="80" y="54" width="48" height="9" rx="4" fill="#10b981" fillOpacity="0.7" />
      <rect x="134" y="56" width="32" height="6" rx="3" fill="#10b981" fillOpacity="0.3" />
      {/* Grid lines */}
      {[90, 115, 140, 165, 190].map(y => (
        <line key={y} x1="16" y1={y} x2="304" y2={y} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
      ))}
      {/* Candlesticks */}
      {candles.map(([open, close, high, low], i) => {
        const x = startX + i * (cW + cGap);
        const isGreen = close >= open;
        const color = isGreen ? "#10b981" : "#ef4444";
        const bodyTop = toY(Math.max(open, close));
        const bodyH = Math.abs(toY(open) - toY(close)) || 2;
        return (
          <g key={i}>
            <line x1={x + cW / 2} y1={toY(high)} x2={x + cW / 2} y2={toY(low)}
              stroke={color} strokeOpacity="0.5" strokeWidth="1" />
            <rect x={x} y={bodyTop} width={cW} height={bodyH} rx="2"
              fill={color} fillOpacity="0.75" />
          </g>
        );
      })}
      {/* Volume bars */}
      {candles.map(([open, close], i) => {
        const x = startX + i * (cW + cGap);
        const isGreen = close >= open;
        const vH = 12 + i * 3;
        return (
          <rect key={i} x={x} y={210 - vH} width={cW} height={vH} rx="2"
            fill={isGreen ? "#10b981" : "#ef4444"} fillOpacity="0.3" />
        );
      })}
      <rect x="16" y="210" width="288" height="1" fill="#ffffff" fillOpacity="0.06" />

      {/* RSI panel */}
      <rect x="16" y="220" width="288" height="60" rx="8" fill="#161616" />
      <rect x="24" y="228" width="18" height="6" rx="3" fill="#ffffff" fillOpacity="0.25" />
      <rect x="46" y="228" width="24" height="6" rx="3" fill="#D4AF37" fillOpacity="0.4" />
      {/* RSI line */}
      <polyline
        points="28,268 60,258 90,262 118,248 148,255 178,240 208,252 238,244 268,250 288,245"
        stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8"
      />
      {/* RSI zones */}
      <line x1="28" y1="244" x2="292" y2="244" stroke="#ef4444" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="28" y1="268" x2="292" y2="268" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />

      {/* Signal cards */}
      {[
        { label: "Señal de entrada", color: "#10b981", w: 96  },
        { label: "Confianza 91%",   color: "#D4AF37", w: 80  },
        { label: "Vol +18%",        color: "#ffffff", w: 56  },
      ].map(({ color, w }, i) => (
        <g key={i}>
          <rect x={16 + i * 100} y="296" width="92" height="32" rx="8" fill="#1a1a1a" />
          <rect x={16 + i * 100} y="296" width="92" height="32" rx="8"
            stroke={color} strokeOpacity="0.2" strokeWidth="1" fill="none" />
          <rect x={24 + i * 100} y="305" width={w - i * 12} height="6" rx="3" fill={color} fillOpacity="0.6" />
          <rect x={24 + i * 100} y="315" width="48" height="5" rx="2" fill="#ffffff" fillOpacity="0.1" />
        </g>
      ))}

      {/* Bottom rows */}
      {[342, 366, 390].map((y, i) => (
        <g key={y}>
          <rect x="16" y={y - 8} width="16" height="16" rx="4" fill="#1a1a1a" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          <rect x="40" y={y - 4} width={90 + i * 16} height="6" rx="3" fill="#ffffff" fillOpacity="0.15" />
          <rect x="240" y={y - 4} width="40" height="6" rx="3"
            fill={i === 0 ? "#10b981" : "#ffffff"} fillOpacity={i === 0 ? 0.5 : 0.07} />
          <rect x="284" y={y - 4} width="24" height="6" rx="3" fill="#ffffff" fillOpacity="0.05" />
        </g>
      ))}
    </svg>
  );
}

/** Tile 3 — Chat IA con respuestas de análisis */
function TileIA() {
  return (
    <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <rect width="320" height="420" fill="#0e0e0e" />
      {/* Header */}
      <rect x="0" y="0" width="320" height="56" fill="#111111" />
      <circle cx="32" cy="28" r="14" fill="#D4AF37" fillOpacity="0.2" />
      <circle cx="32" cy="28" r="6" fill="#D4AF37" fillOpacity="0.6" />
      <rect x="54" y="20" width="72" height="8" rx="4" fill="#ffffff" fillOpacity="0.7" />
      <rect x="54" y="32" width="48" height="6" rx="3" fill="#10b981" fillOpacity="0.5" />
      <rect x="264" y="18" width="40" height="20" rx="6" fill="#D4AF37" fillOpacity="0.15" />
      <rect x="272" y="24" width="24" height="8" rx="4" fill="#D4AF37" fillOpacity="0.45" />

      {/* AI message 1 */}
      <rect x="16" y="72" width="220" height="52" rx="12" fill="#1a1a1a" />
      <rect x="16" y="72" width="220" height="52" rx="12" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" fill="none" />
      <rect x="28" y="83" width="140" height="7" rx="3" fill="#ffffff" fillOpacity="0.5" />
      <rect x="28" y="95" width="160" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
      <rect x="28" y="107" width="100" height="6" rx="3" fill="#D4AF37" fillOpacity="0.4" />

      {/* User message 1 */}
      <rect x="84" y="136" width="220" height="36" rx="12" fill="#D4AF37" fillOpacity="0.12" />
      <rect x="84" y="136" width="220" height="36" rx="12" stroke="#D4AF37" strokeOpacity="0.2" strokeWidth="1" fill="none" />
      <rect x="96" y="147" width="120" height="7" rx="3" fill="#D4AF37" fillOpacity="0.6" />
      <rect x="96" y="158" width="80" height="5" rx="2" fill="#D4AF37" fillOpacity="0.3" />

      {/* AI message 2 — longer with mini chart */}
      <rect x="16" y="184" width="252" height="88" rx="12" fill="#1a1a1a" />
      <rect x="16" y="184" width="252" height="88" rx="12" stroke="#D4AF37" strokeOpacity="0.1" strokeWidth="1" fill="none" />
      <rect x="28" y="195" width="160" height="7" rx="3" fill="#ffffff" fillOpacity="0.5" />
      <rect x="28" y="207" width="180" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
      <rect x="28" y="218" width="120" height="6" rx="3" fill="#ffffff" fillOpacity="0.15" />
      {/* Inline mini chart inside message */}
      <rect x="28" y="232" width="228" height="28" rx="6" fill="#111111" />
      <polyline points="36,252 68,244 100,248 132,238 164,242 196,234 228,238 248,232"
        stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.8" />
      <circle cx="248" cy="232" r="3" fill="#D4AF37" fillOpacity="0.9" />

      {/* User message 2 */}
      <rect x="100" y="284" width="204" height="36" rx="12" fill="#D4AF37" fillOpacity="0.12" />
      <rect x="100" y="284" width="204" height="36" rx="12" stroke="#D4AF37" strokeOpacity="0.2" strokeWidth="1" fill="none" />
      <rect x="112" y="295" width="104" height="7" rx="3" fill="#D4AF37" fillOpacity="0.6" />
      <rect x="112" y="306" width="64" height="5" rx="2" fill="#D4AF37" fillOpacity="0.3" />

      {/* AI typing indicator */}
      <rect x="16" y="332" width="80" height="28" rx="10" fill="#1a1a1a" />
      <circle cx="32" cy="346" r="4" fill="#ffffff" fillOpacity="0.3" />
      <circle cx="46" cy="346" r="4" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="60" cy="346" r="4" fill="#ffffff" fillOpacity="0.3" />

      {/* Input bar */}
      <rect x="16" y="374" width="288" height="36" rx="12" fill="#1a1a1a" />
      <rect x="16" y="374" width="288" height="36" rx="12" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" fill="none" />
      <rect x="28" y="386" width="180" height="7" rx="3" fill="#ffffff" fillOpacity="0.1" />
      <circle cx="288" cy="392" r="12" fill="#D4AF37" fillOpacity="0.8" />
      <polyline points="283,392 289,388 289,396" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Tile 4 — Centro de alertas en tiempo real */
function TileMercado() {
  const alerts = [
    { color: "#10b981", title: 56, sub: 88,  badge: 40, badgeColor: "#10b981" },
    { color: "#ef4444", title: 64, sub: 96,  badge: 44, badgeColor: "#ef4444" },
    { color: "#D4AF37", title: 48, sub: 80,  badge: 56, badgeColor: "#D4AF37" },
    { color: "#3b82f6", title: 72, sub: 104, badge: 48, badgeColor: "#3b82f6" },
    { color: "#8b5cf6", title: 52, sub: 72,  badge: 36, badgeColor: "#8b5cf6" },
  ];

  return (
    <svg viewBox="0 0 320 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
      <rect width="320" height="420" fill="#0e0e0e" />
      {/* Header */}
      <rect x="0" y="0" width="320" height="56" fill="#111111" />
      <rect x="16" y="18" width="80" height="10" rx="5" fill="#ffffff" fillOpacity="0.7" />
      <rect x="16" y="32" width="56" height="7" rx="3" fill="#ffffff" fillOpacity="0.2" />
      {/* Bell icon area */}
      <rect x="252" y="14" width="52" height="28" rx="8" fill="#D4AF37" fillOpacity="0.12" />
      <circle cx="278" cy="24" r="6" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
      <line x1="278" y1="30" x2="278" y2="34" stroke="#D4AF37" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="284" cy="16" r="5" fill="#ef4444" fillOpacity="0.9" />
      <rect x="282" y="13" width="4" height="6" rx="2" fill="#ffffff" fillOpacity="0.8" />

      {/* Filter tabs */}
      <rect x="16" y="66" width="52" height="20" rx="6" fill="#D4AF37" fillOpacity="0.2" />
      <rect x="20" y="70" width="44" height="12" rx="4" fill="#D4AF37" fillOpacity="0.5" />
      <rect x="76" y="66" width="52" height="20" rx="6" fill="#1a1a1a" />
      <rect x="80" y="70" width="44" height="12" rx="4" fill="#ffffff" fillOpacity="0.1" />
      <rect x="136" y="66" width="52" height="20" rx="6" fill="#1a1a1a" />
      <rect x="140" y="70" width="44" height="12" rx="4" fill="#ffffff" fillOpacity="0.1" />

      {/* Alert cards */}
      {alerts.map(({ color, title, sub, badge, badgeColor }, i) => (
        <g key={i}>
          <rect x="16" y={98 + i * 60} width="288" height="52" rx="10" fill="#161616" />
          <rect x="16" y={98 + i * 60} width="288" height="52" rx="10"
            stroke={color} strokeOpacity={i === 0 ? 0.35 : 0.1} strokeWidth="1" fill="none" />
          {/* Icon circle */}
          <circle cx="42" cy={124 + i * 60} r="14" fill={color} fillOpacity="0.12" />
          <circle cx="42" cy={124 + i * 60} r="5" fill={color} fillOpacity="0.6" />
          {/* Text lines */}
          <rect x="64" y={112 + i * 60} width={title} height="8" rx="4" fill="#ffffff" fillOpacity="0.7" />
          <rect x="64" y={124 + i * 60} width={sub} height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
          <rect x="64" y={134 + i * 60} width={sub - 24} height="5" rx="2" fill="#ffffff" fillOpacity="0.1" />
          {/* Badge */}
          <rect x={280 - badge / 2} y={116 + i * 60} width={badge} height="16" rx="6"
            fill={badgeColor} fillOpacity="0.15" />
          <rect x={284 - badge / 2} y={120 + i * 60} width={badge - 8} height="8" rx="4"
            fill={badgeColor} fillOpacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

export interface FeatureBlurb {
  title: string;
  blurb: string;
}

export interface MotionTilesProps {
  items?: MotionTileItem[];
  features?: FeatureBlurb[];
}

const DEFAULT_FEATURES: FeatureBlurb[] = [
  {
    title: "Claridad en minutos, no en horas.",
    blurb:
      "Resumen accionable al abrir: qué vigilar, qué ignorar y por qué, sin recorrer diez pantallas.",
  },
  {
    title: "Señales que puedes cuestionar y contrastar.",
    blurb:
      "Cada lectura trae contexto para que decidas tú, no para sustituir tu criterio.",
  },
  {
    title: "IA al servicio de tu criterio, no al revés.",
    blurb:
      "Preguntas, matices y escenarios: la herramienta amplifica cómo ya piensas el riesgo.",
  },
  {
    title: "Pensado para mercados que no esperan.",
    blurb:
      "Ritmo y densidad de información alineados con aperturas, noticias y picos de volatilidad.",
  },
];

const overlayBase =
  "before:absolute before:inset-0 before:rounded-2xl before:outline-1 before:outline-border before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:pointer-events-none";

const DEFAULT_ITEMS: MotionTileItem[] = [
  {
    content: <TileClaridad />,
    alt: "Claridad en minutos",
    className: `[grid-area:stack] ${overlayBase}`,
  },
  {
    content: <TileSenal />,
    alt: "Señales contrastables",
    className: `[grid-area:stack] translate-x-6 lg:translate-x-8 translate-y-6 lg:translate-y-10 ${overlayBase}`,
  },
  {
    content: <TileIA />,
    alt: "IA subordinada al criterio del usuario",
    className: `[grid-area:stack] translate-x-12 lg:translate-x-16 translate-y-12 lg:translate-y-20 ${overlayBase}`,
  },
  {
    content: <TileMercado />,
    alt: "Velocidad de mercado",
    className:
      "[grid-area:stack] translate-x-[4.5rem] lg:translate-x-24 translate-y-[4.5rem] lg:translate-y-[7.5rem]",
  },
];

// ── Stack interaction helpers ─────────────────────────────────────────────────

function getStackedClassName(index: number, baseClassName: string, focusedIndex: number | null) {
  if (focusedIndex === 0 && index === 1) return baseClassName + " !translate-y-16 lg:!translate-y-24 !translate-x-10 lg:!translate-x-16";
  if (focusedIndex === 0 && index === 2) return baseClassName + " !translate-y-24 lg:!translate-y-36 !translate-x-18 lg:!translate-x-28";
  if (focusedIndex === 0 && index === 3) return baseClassName + " !translate-y-32 lg:!translate-y-48 !translate-x-24 lg:!translate-x-36";
  if (focusedIndex === 1 && index === 2) return baseClassName + " !translate-y-20 lg:!translate-y-32 !translate-x-18 lg:!translate-x-28";
  if (focusedIndex === 1 && index === 3) return baseClassName + " !translate-y-28 lg:!translate-y-40 !translate-x-24 lg:!translate-x-36";
  if (focusedIndex === 2 && index === 3) return baseClassName + " !translate-y-20 lg:!translate-y-32 !translate-x-24 lg:!translate-x-36";
  return baseClassName;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MotionTiles({ items, features }: MotionTilesProps) {
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const focusedIndex = hoveredFeatureIndex ?? activeIndex;
  const list = items ?? DEFAULT_ITEMS;
  const src = features ?? DEFAULT_FEATURES;
  const rows: FeatureBlurb[] = list.map((_, i) => src[i] ?? { title: "", blurb: "" });

  const handleTap = (index: number) => {
    if (activeIndex === index) return;
    setActiveIndex(index);
  };

  const resetStackInteraction = () => {
    setHoveredFeatureIndex(null);
    setActiveIndex(null);
  };

  const stack = (
    <div className="relative w-full" onMouseLeave={resetStackInteraction}>
      <div className="relative w-fit pb-32 lg:pb-36 pr-8">
        <div className="grid [grid-template-areas:'stack'] place-items-start justify-items-start opacity-100 animate-in fade-in-0 duration-700">
          {list.map((item, index) => (
            <MotionTileCard
              key={`tile-${index}`}
              src={item.src}
              content={item.content}
              alt={item.alt}
              isLifted={hoveredFeatureIndex === index}
              className={getStackedClassName(index, item.className ?? "", focusedIndex)}
              onHover={() => setHoveredFeatureIndex(index)}
              isActive={activeIndex === index}
              onTap={() => handleTap(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="features"
      className="relative w-full scroll-mt-28 py-10 md:py-20"
      aria-labelledby="features-heading"
      onMouseLeave={resetStackInteraction}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="features-heading"
          className="mb-12 text-4xl font-bold tracking-tight text-foreground md:mb-14 md:text-5xl lg:text-6xl"
        >
          Diseñado para ti.
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-12 xl:gap-x-16 lg:items-center">
          {/* Feature list */}
          <ul className="order-2 lg:order-1 flex flex-col gap-4 md:gap-6">
            {rows.map((row, index) => (
              <li
                key={`feature-${index}`}
                className={cn(
                  "group flex items-start gap-4 cursor-default rounded-xl p-3 -mx-3 transition-colors duration-200",
                  focusedIndex === index ? "bg-white/[0.04]" : "hover:bg-white/[0.02]",
                )}
                onMouseEnter={() => setHoveredFeatureIndex(index)}
                onMouseLeave={() => setHoveredFeatureIndex(null)}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-200",
                    focusedIndex === index
                      ? "bg-[#D4AF37] text-black"
                      : "bg-white/[0.06] text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <div>
                  <p className={cn(
                    "text-sm font-bold transition-colors duration-200",
                    focusedIndex === index ? "text-white" : "text-muted-foreground",
                  )}>
                    {row.title}
                  </p>
                  {row.blurb ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground/70">{row.blurb}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {/* Stack */}
          <div className="order-1 lg:order-2 flex w-full items-start justify-center lg:justify-start">
            {stack}
          </div>
        </div>
      </div>
    </section>
  );
}

function Component() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center bg-background p-8">
      <MotionTiles />
    </div>
  );
}

/** @deprecated Usa `MotionTiles` */
export const Testimonials = MotionTiles;
export { MotionTileCard, MotionTiles, Component };
export type { MotionTilesProps as TestimonialsProps };
