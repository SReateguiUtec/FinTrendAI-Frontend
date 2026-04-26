import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  BarChart3,
  Zap,
  Newspaper,
  Home,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/** Hora civil en America/New_York (no usar `new Date(toLocaleString)` — falla fuera de ET). */
function getEasternWallClock(date: Date) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = f.formatToParts(date);
  const wd = parts.find(p => p.type === 'weekday')?.value ?? 'Mon';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
  const totalMinutes = hour * 60 + minute;
  const isWeekend = wd === 'Sat' || wd === 'Sun';
  return { wd, hour, minute, totalMinutes, isWeekend };
}

// Market Clock Component
function MarketClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { totalMinutes, isWeekend } = getEasternWallClock(time);

  // Market sessions (ET)
  // Pre-market: 4:00 AM - 9:30 AM (240 - 570 minutes)
  // Regular: 9:30 AM - 4:00 PM (570 - 960 minutes)
  // After Hours: 4:00 PM - 8:00 PM (960 - 1200 minutes)
  // Closed: 8:00 PM - 4:00 AM + weekends
  type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed';

  // Session config
  const sessionConfig: Record<MarketSession, {
    label: string; shortLabel: string; color: string; bgColor: string;
    dotColor: string; glowColor: string; countdownLabel: string;
  }> = {
    'pre-market': {
      label: 'PRE-MARKET',  shortLabel: 'PRE',
      color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30',
      dotColor: 'bg-amber-400', glowColor: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      countdownLabel: 'Regular abre en',
    },
    'regular': {
      label: 'EN SESIÓN', shortLabel: 'REG',
      color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      dotColor: 'bg-emerald-400', glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      countdownLabel: 'Regular cierra en',
    },
    'after-hours': {
      label: 'AFTER HOURS', shortLabel: 'AFT',
      color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-400/30',
      dotColor: 'bg-blue-400', glowColor: 'shadow-[0_0_8px_rgba(96,165,250,0.5)]',
      countdownLabel: 'After hours cierra en',
    },
    'closed': {
      label: 'CERRADO', shortLabel: 'CLS',
      color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30',
      dotColor: 'bg-red-500', glowColor: '',
      countdownLabel: 'Pre-market abre en',
    },
  };

  const SESSION_ORDER: MarketSession[] = ['pre-market', 'regular', 'after-hours', 'closed'];

  let session: MarketSession = 'closed';
  if (!isWeekend) {
    if (totalMinutes >= 240 && totalMinutes < 570)  session = 'pre-market';
    else if (totalMinutes >= 570 && totalMinutes < 960)  session = 'regular';
    else if (totalMinutes >= 960 && totalMinutes < 1200) session = 'after-hours';
  }

  const config = sessionConfig[session];

  /** Minutos hasta el próximo hito (misma lógica ET que la sesión). */
  function minutesUntilNextBoundary(): number {
    if (session === 'pre-market') return 9 * 60 + 30 - totalMinutes;
    if (session === 'regular') return 16 * 60 - totalMinutes;
    if (session === 'after-hours') return 20 * 60 - totalMinutes;
    if (session === 'closed') {
      if (isWeekend) {
        // Buscar el próximo lun 04:00 ET a saltos de 5 min (suficiente para el texto del countdown)
        const start = time.getTime();
        const max = 8 * 24 * 60 * 60 * 1000;
        for (let ms = 5 * 60 * 1000; ms <= max; ms += 5 * 60 * 1000) {
          const p = getEasternWallClock(new Date(start + ms));
          if (p.wd === 'Mon' && p.totalMinutes >= 240 && p.totalMinutes < 570) {
            return Math.round(ms / (60 * 1000));
          }
        }
        return 48 * 60;
      }
      if (totalMinutes >= 1200) return 24 * 60 - totalMinutes + 4 * 60;
      return 4 * 60 - totalMinutes;
    }
    return 0;
  }

  let countdownText = '';
  const diffMin = minutesUntilNextBoundary();
  if (diffMin > 0) {
    const diffHours = Math.floor(diffMin / 60);
    const diffMinutes = diffMin % 60;
    if (diffHours >= 48) {
      const days = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      countdownText = `${config.countdownLabel} ${days}d ${remainingHours}h`;
    } else {
      countdownText = `${config.countdownLabel} ${diffHours}h ${diffMinutes}m`;
    }
  } else {
    countdownText = 'Iniciando...';
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/New_York",
      hour12: false
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-[180px] mb-2">
      <div className="bg-white/[0.02] rounded-2xl p-4 w-full h-full flex flex-col justify-between">

        {/* Header: NYSE label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">NYSE · NASDAQ</span>
          {/* Dot pulsante del estado activo */}
          <div className={cn('size-1.5 rounded-full animate-pulse', config.dotColor, config.glowColor)} />
        </div>

        {/* 4 pills de sesión */}
        <div className="grid grid-cols-4 gap-1">
          {SESSION_ORDER.map(s => {
            const c = sessionConfig[s];
            const isActive = s === session;
            return (
              <div
                key={s}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-lg py-1 px-0.5 border text-center transition-all',
                  isActive ? `${c.bgColor} ${c.color}` : 'border-transparent text-zinc-600',
                )}
              >
                <span className={cn('text-[9px] font-black tracking-wide', isActive ? c.color : 'text-zinc-600')}>
                  {c.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
        {/* Etiqueta del estado actual — removida: ya se ve en las pills */}

        {/* Clock */}
        <div className="text-center flex-1 flex flex-col justify-center my-3">
          <div className="text-3xl font-black text-white tracking-tight tabular-nums">
            {formatTime(time)}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            ET (Nueva York)
          </div>
        </div>

        {/* Session info + countdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-[10px]">
            <span className="text-zinc-500">Horario:</span>
            <span className="text-zinc-300 font-medium">
              {session === 'pre-market'  && '4:00 – 9:30 AM'}
              {session === 'regular'     && '9:30 AM – 4:00 PM'}
              {session === 'after-hours' && '4:00 – 8:00 PM'}
              {session === 'closed'      && 'Cerrado'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-white/5">
            <svg className="size-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className={cn('text-[10px] font-medium', config.color)}>
              {countdownText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { icon: LayoutDashboard, label: "Vista general", path: "/dashboard" },
  { icon: LineChart, label: "Seguimiento", path: "/dashboard/seguimiento" },
  { icon: BarChart3, label: "Analítica", path: "/dashboard/analitica" },
  { icon: Zap, label: "Señales IA", path: "/dashboard/senales" },
  { icon: Newspaper, label: "Noticias", path: "/dashboard/noticias" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full w-64 bg-[#0a0a0a] border-r border-white/5 p-4 gap-6">
      {/* Logo + close button (close only visible on mobile) */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1 select-none">
          <span className="font-black text-2xl tracking-tight">
            <span className="text-white">Fin</span>
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] bg-clip-text text-transparent">Trend</span>
          </span>
          <div className="size-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] mt-3" />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Market Clock */}
      <MarketClock />

      {/* Nav items */}
      <nav className="flex-none flex flex-col gap-2 mt-2">
        {navItems.map((item) => {
          const path = location.pathname.replace(/\/$/, '') || '/';
          const itemPath = item.path.replace(/\/$/, '') || '/';
          const active =
            itemPath === '/dashboard'
              ? path === '/dashboard'
              : path === itemPath;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "size-5 transition-transform duration-200",
                active ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
              {active && (
                <div className="ml-auto size-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Home className="size-5" />
          <span className="font-medium text-sm">Volver al sitio</span>
        </Link>
      </div>
    </div>
  );
};

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Desktop: siempre visible */}
      <aside className="hidden lg:flex flex-col h-screen shrink-0">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* Mobile: drawer con overlay */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col h-full transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
};
