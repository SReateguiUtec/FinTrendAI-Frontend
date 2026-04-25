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

// Market Clock Component
function MarketClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert to NYC time (ET)
  const nycTime = new Date(time.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const hours = nycTime.getHours();
  const minutes = nycTime.getMinutes();
  const day = nycTime.getDay();
  const totalMinutes = hours * 60 + minutes;

  // Market sessions (ET)
  // Pre-market: 4:00 AM - 9:30 AM (240 - 570 minutes)
  // Regular: 9:30 AM - 4:00 PM (570 - 960 minutes)
  // After Hours: 4:00 PM - 8:00 PM (960 - 1200 minutes)
  // Closed: 8:00 PM - 4:00 AM + weekends
  const isWeekend = day === 0 || day === 6;

  type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed';
  let session: MarketSession = 'closed';

  if (!isWeekend) {
    if (totalMinutes >= 240 && totalMinutes < 570) {
      session = 'pre-market';
    } else if (totalMinutes >= 570 && totalMinutes < 960) {
      session = 'regular';
    } else if (totalMinutes >= 960 && totalMinutes < 1200) {
      session = 'after-hours';
    }
  }

  // Session config
  const sessionConfig = {
    'pre-market': {
      label: 'PRE-MARKET',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
      glowColor: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      nextLabel: 'Abre en'
    },
    'regular': {
      label: 'EN SESIÓN',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      glowColor: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      nextLabel: 'Cierra en'
    },
    'after-hours': {
      label: 'AFTER HOURS',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400',
      glowColor: 'shadow-[0_0_8px_rgba(96,165,250,0.5)]',
      nextLabel: 'Cierra en'
    },
    'closed': {
      label: 'CERRADO',
      color: 'text-red-400',
      bgColor: 'bg-red-500',
      glowColor: '',
      nextLabel: 'Abre en'
    }
  };

  const config = sessionConfig[session];

  // Calculate countdown
  let countdownText = "";
  let targetTime: Date | null = null;

  if (session === 'pre-market') {
    // Time until regular market open (9:30 AM)
    targetTime = new Date(nycTime);
    targetTime.setHours(9, 30, 0, 0);
  } else if (session === 'regular') {
    // Time until close (4:00 PM)
    targetTime = new Date(nycTime);
    targetTime.setHours(16, 0, 0, 0);
  } else if (session === 'after-hours') {
    // Time until after-hours close (8:00 PM)
    targetTime = new Date(nycTime);
    targetTime.setHours(20, 0, 0, 0);
  } else if (session === 'closed') {
    if (isWeekend) {
      // Time until Monday pre-market (4:00 AM)
      const daysUntilMonday = day === 0 ? 1 : 2; // Sunday=1, Saturday=2
      targetTime = new Date(nycTime);
      targetTime.setDate(targetTime.getDate() + daysUntilMonday);
      targetTime.setHours(4, 0, 0, 0);
    } else if (totalMinutes >= 1200) {
      // After 8 PM, next day pre-market
      targetTime = new Date(nycTime);
      targetTime.setDate(targetTime.getDate() + 1);
      targetTime.setHours(4, 0, 0, 0);
    } else {
      // Before 4 AM, same day pre-market
      targetTime = new Date(nycTime);
      targetTime.setHours(4, 0, 0, 0);
    }
  }

  if (targetTime) {
    const diff = targetTime.getTime() - nycTime.getTime();
    if (diff > 0) {
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHours > 24) {
        const days = Math.floor(diffHours / 24);
        const remainingHours = diffHours % 24;
        countdownText = `${config.nextLabel} ${days}d ${remainingHours}h`;
      } else {
        countdownText = `${config.nextLabel} ${diffHours}h ${diffMinutes}m`;
      }
    } else {
      countdownText = 'Iniciando...';
    }
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
    <div className="flex-1 flex flex-col min-h-[160px] mb-2">
      <div className="bg-white/[0.02] rounded-2xl p-5 w-full h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">NYSE · NASDAQ</span>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "size-1.5 rounded-full animate-pulse",
              config.bgColor,
              config.glowColor
            )} />
            <span className={cn("text-[10px] font-bold", config.color)}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="text-center flex-1 flex flex-col justify-center my-4">
          <div className="text-4xl font-black text-white tracking-tight tabular-nums">
            {formatTime(time)}
          </div>
          <div className="text-[11px] text-zinc-500 uppercase tracking-widest mt-1">
            ET (Nueva York)
          </div>
        </div>

        {/* Session Info */}
        <div className="space-y-3">
          {/* Current session hours */}
          <div className="flex items-center justify-center gap-2 text-[10px]">
            <span className="text-zinc-500">Horario:</span>
            <span className="text-zinc-300 font-medium">
              {session === 'pre-market' && '4:00 AM - 9:30 AM'}
              {session === 'regular' && '9:30 AM - 4:00 PM'}
              {session === 'after-hours' && '4:00 PM - 8:00 PM'}
              {session === 'closed' && 'Cerrado'}
            </span>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/5">
            <svg
              className="size-3.5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-xs text-zinc-400 font-medium">
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
