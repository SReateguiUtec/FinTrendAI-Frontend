import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, TrendingUp, TrendingDown, House, Menu } from "lucide-react";
import { SearchBar } from './search-bar';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  return (
    <div className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3 sm:gap-6 flex-1">
        {/* Hamburguesa — solo en móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <SearchBar />

        <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="size-3" />
            <span>S&P 500 +0.45%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-500">
            <TrendingDown className="size-3" />
            <span>NASDAQ -0.12%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="size-3" />
            <span>BTC +2.1%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          title="Alertas de mercado (demo)"
          className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 size-2 bg-[#D4AF37] rounded-full border-2 border-[#0a0a0a] shadow-[0_0_5px_#D4AF37]" />
        </button>

        <div className="h-8 w-px bg-white/10 mx-1" />

        <Link
          to="/"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
        >
          <House className="size-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </div>
    </div>
  );
};
