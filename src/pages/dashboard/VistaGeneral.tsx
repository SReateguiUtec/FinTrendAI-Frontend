import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { MarketChart } from '@/components/dashboard/market-chart';
import { SignalsPanel } from '@/components/dashboard/signals-panel';
import { cn } from '@/lib/utils';
import { TrendingUp, ArrowUpRight, BarChart3, Zap, Layers, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUltimoPrecio, type PrecioAccion } from '@/services/precios';

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

/* ── Skeleton ───────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5 inline-block', className)} />
);

function fmtPrice(p: number | null) {
  if (p === null) return <Skeleton className="h-4 w-16" />;
  return `$${p.toFixed(2)}`;
}

function fmtVol(v: number | null) {
  if (v === null) return <Skeleton className="h-4 w-12" />;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

/* ── Page ───────────────────────────────────────────────── */
export const VistaGeneral = () => {
  const [rows, setRows] = useState<RowData[]>(
    SIMBOLOS.map(s => ({ ...s, precio: null, variacion: null, volumen: null }))
  );
  const [loading, setLoading] = useState(true);

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

  /* ── Derived stats ─────────────────────────────────────── */
  const loaded = rows.filter(r => r.variacion !== null);
  const best = loaded.sort((a, b) => (b.variacion ?? 0) - (a.variacion ?? 0))[0];
  const totalVol = rows.reduce((s, r) => s + (r.volumen ?? 0), 0);

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400"
          >
            Datos de mercado en tiempo real.
          </motion.p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Cargando precios…
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Símbolos activos"
          value={`${SIMBOLOS.length}`}
          change="Catálogo"
          trend="up"
          icon={Layers}
          subValue="Precios y noticias indexados"
        />
        <StatCard
          label="Mejor rendimiento"
          value={
            loading
              ? '…'
              : best
                ? `${best.simbolo} ${best.variacion! >= 0 ? '+' : ''}${best.variacion!.toFixed(2)}%`
                : '—'
          }
          change="Sesión"
          trend="up"
          icon={TrendingUp}
          subValue="Mayor variación open → close"
        />
        <StatCard
          label="Señales disponibles"
          value="Multi-fuente"
          change="Hoy"
          trend="up"
          icon={Zap}
          subValue="Precios, noticias y motor de señales"
        />
        <StatCard
          label="Volumen total"
          value={
            loading
              ? '…'
              : totalVol >= 1_000_000
                ? `${(totalVol / 1_000_000).toFixed(1)}M`
                : totalVol.toLocaleString()
          }
          change="24h (suma)"
          trend="up"
          icon={BarChart3}
          subValue="Suma de volúmenes en la sesión"
        />
      </div>

      {/* Globe + Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MarketChart />
        <SignalsPanel />
      </div>

      {/* Tabla de movimientos */}
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Movimiento del mercado</h3>
            <p className="text-xs text-zinc-500 mt-1">Últimos precios disponibles</p>
          </div>
          {loading && <Loader2 className="size-4 animate-spin text-zinc-500" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase font-bold tracking-widest">
                <th className="px-4 pb-2">Activo</th>
                <th className="px-4 pb-2">Precio cierre</th>
                <th className="px-4 pb-2">Volumen</th>
                <th className="px-4 pb-2">Variación</th>
                <th className="px-4 pb-2 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isUp = (row.variacion ?? 0) >= 0;
                return (
                  <tr
                    key={row.simbolo}
                    className="bg-white/[0.03] group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-xs">
                          {row.simbolo.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{row.nombre}</p>
                          <p className="text-xs text-zinc-500">{row.simbolo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold">{fmtPrice(row.precio)}</td>
                    <td className="px-4 py-4 font-medium text-zinc-400">{fmtVol(row.volumen)}</td>
                    <td className={cn(
                      'px-4 py-4 font-bold',
                      row.variacion === null ? '' : isUp ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {row.variacion === null
                        ? <Skeleton className="h-4 w-14" />
                        : `${isUp ? '+' : ''}${row.variacion.toFixed(2)}%`
                      }
                    </td>
                    <td className="px-4 py-4 text-right rounded-r-2xl">
                      <button
                        type="button"
                        title="Ver símbolo"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-white"
                      >
                        <ArrowUpRight className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
