import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { MarketChart } from '@/components/dashboard/market-chart';
import { SignalsPanel } from '@/components/dashboard/signals-panel';
import { cn } from '@/lib/utils';
import { TrendingUp, BarChart3, Zap, Layers, Loader2, Globe, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUltimoPrecio, getSimbolos, type PrecioAccion } from '@/services/precios';

/* ── Config de símbolos ─────────────────────────────────── */
const SIMBOLOS = [
  { simbolo: 'AAPL', nombre: 'Apple Inc.' },
  { simbolo: 'NVDA', nombre: 'NVIDIA Corporation' },
  { simbolo: 'MSFT', nombre: 'Microsoft Corporation' },
  { simbolo: 'GOOGL', nombre: 'Alphabet Inc.' },
  { simbolo: 'TSLA', nombre: 'Tesla Inc.' },
];

interface RowData {
  simbolo: string;
  nombre: string;
  precio: number | null;
  variacion: number | null;
  volumen: number | null;
}

export const VistaGeneral = () => {
  const [rows, setRows] = useState<RowData[]>(
    SIMBOLOS.map(s => ({ ...s, precio: null, variacion: null, volumen: null }))
  );
  const [loading, setLoading] = useState(true);
  const [cantidadSimbolosActivos, setCantidadSimbolosActivos] = useState<number | null>(null);

  useEffect(() => {
    getSimbolos()
      .then(list => {
        const n = list.filter(s => s.activo).length;
        setCantidadSimbolosActivos(n > 0 ? n : SIMBOLOS.length);
      })
      .catch(() => setCantidadSimbolosActivos(SIMBOLOS.length));
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all(
      SIMBOLOS.map(async ({ simbolo, nombre }) => {
        try {
          const p: PrecioAccion | null = await getUltimoPrecio(simbolo);
          if (!p) return { simbolo, nombre, precio: null, variacion: null, volumen: null };
          const variacion = ((p.close - p.open) / p.open) * 100;
          return { simbolo, nombre, precio: p.close, variacion, volumen: p.volumen };
        } catch {
          return { simbolo, nombre, precio: null, variacion: null, volumen: null };
        }
      })
    ).then(data => {
      if (alive) { setRows(data); setLoading(false); }
    });
    return () => { alive = false; };
  }, []);

  const loaded = rows.filter(r => r.variacion !== null);
  const best = loaded.sort((a, b) => (b.variacion ?? 0) - (a.variacion ?? 0))[0];
  const totalVol = rows.reduce((s, r) => s + (r.volumen ?? 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto">

      {/* Global Ticker Header - HIGH PERFORMANCE CSS ONLY LOOP */}
      <div className="relative h-8 sm:h-14 rounded-lg sm:rounded-2xl bg-[#080808] border border-white/5 flex items-center overflow-hidden mb-6 sm:mb-8 shadow-2xl">
        <div className="absolute left-0 top-0 bottom-0 px-2 sm:px-6 bg-[#D4AF37] text-black flex items-center gap-1.5 sm:gap-2 z-20 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
          <ShieldCheck className="size-2.5 sm:size-4" />
          <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Verified Feed</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll gap-6 sm:gap-12 pl-4">
            {/* First Set */}
            {rows.map((row) => (
              <div key={`ticker-${row.simbolo}`} className="flex items-center gap-2 sm:gap-3">
                <div className="size-2.5 sm:size-4 flex items-center justify-center">
                  <img
                    src={`/${row.simbolo === 'AAPL' ? 'Apple Logo.svg' : row.simbolo === 'NVDA' ? 'Nvidia Color Icon.svg' : row.simbolo === 'MSFT' ? 'Microsoft Color Icon.svg' : row.simbolo === 'GOOGL' ? 'Google Logo.svg' : row.simbolo === 'TSLA' ? 'X Logo.svg' : 'fintrendicon.svg'}`}
                    alt={row.simbolo}
                    className="size-full object-contain brightness-0 invert opacity-70"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/fintrendicon.svg' }}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] font-black text-white uppercase">{row.simbolo}</span>
                <span className="text-[9px] sm:text-xs font-bold tabular-nums text-zinc-400">${row.precio?.toFixed(2) || '---'}</span>
                <span className={cn(
                  "text-[8px] sm:text-[10px] font-black",
                  (row.variacion ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {(row.variacion ?? 0) >= 0 ? '+' : ''}{row.variacion?.toFixed(2)}%
                </span>
              </div>
            ))}
            {/* Duplicated set for seamless loop */}
            {rows.map((row) => (
              <div key={`ticker-dup-${row.simbolo}`} className="flex items-center gap-2 sm:gap-3">
                <div className="size-2.5 sm:size-4 flex items-center justify-center">
                  <img
                    src={`/${row.simbolo === 'AAPL' ? 'Apple Logo.svg' : row.simbolo === 'NVDA' ? 'Nvidia Color Icon.svg' : row.simbolo === 'MSFT' ? 'Microsoft Color Icon.svg' : row.simbolo === 'GOOGL' ? 'Google Logo.svg' : row.simbolo === 'TSLA' ? 'X Logo.svg' : 'fintrendicon.svg'}`}
                    alt={row.simbolo}
                    className="size-full object-contain brightness-0 invert opacity-70"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/fintrendicon.svg' }}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] font-black text-white uppercase">{row.simbolo}</span>
                <span className="text-[9px] sm:text-xs font-bold tabular-nums text-zinc-400">${row.precio?.toFixed(2) || '---'}</span>
                <span className={cn(
                  "text-[8px] sm:text-[10px] font-black",
                  (row.variacion ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {(row.variacion ?? 0) >= 0 ? '+' : ''}{row.variacion?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Header HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 sm:h-8 w-1 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl sm:text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-2 sm:gap-3 flex-nowrap"
            >
              Intelligence <span className="text-zinc-500 font-light">Hub</span>
              <span className="px-2.5 sm:px-3 py-2 rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-[7px] sm:text-[9px] font-black tracking-[0.2em] uppercase ml-1 shadow-[0_0_10px_rgba(212,175,55,0.1)] leading-none">
                DEMO
              </span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-[0.3em] pl-4"
          >
            Terminal Operativa · Sistema de Análisis Global
          </motion.p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end px-4 border-r border-white/10">
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Status Sistema</span>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-500 uppercase">Online</span>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Loader2 className="size-3 animate-spin text-[#D4AF37]" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sincronizando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Left Stats Column */}
        <div className="xl:col-span-1 grid grid-cols-3 xl:grid-cols-1 gap-3 xl:gap-0 xl:space-y-6">
          <StatCard
            label="Activos en Red"
            value={cantidadSimbolosActivos === null ? '...' : String(cantidadSimbolosActivos)}
            change="Empresas"
            trend="up"
            icon={Layers}
            subValue="Activos indexados en tiempo real"
          />
          <StatCard
            label="Líder de Sesión"
            value={loading ? '...' : best ? best.simbolo : '—'}
            change={best ? `${best.variacion! >= 0 ? '+' : ''}${best.variacion!.toFixed(2)}%` : '0%'}
            trend={best && best.variacion! >= 0 ? 'up' : 'down'}
            icon={TrendingUp}
            subValue="Máximo rendimiento detectado"
          />
          <StatCard
            label="Motor de Señales"
            value={<>98.2<span className="text-sm opacity-50 ml-1">%</span></>}
            change="Precisión"
            trend="up"
            icon={Cpu}
            subValue="Tasa de acierto del modelo IA"
          />
        </div>

        {/* Central Immersive Core (Globe with specialized UI) */}
        <div className="xl:col-span-2 relative min-h-[500px] rounded-[2.5rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Globe className="size-4 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Market Pulse</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Visualización Geográfica de Flujos</p>
            </div>
          </div>

          <div className="w-full relative z-10">
            <MarketChart />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 z-20">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Transacciones Live</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Volumen 24h</span>
              <span className="text-xs font-black text-white tabular-nums">
                {loading ? '...' : totalVol >= 1_000_000 ? `${(totalVol / 1_000_000).toFixed(1)}M` : totalVol.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Signals Stream */}
        <div className="xl:col-span-1">
          <SignalsPanel />
        </div>

      </div>
    </div>
  );
};