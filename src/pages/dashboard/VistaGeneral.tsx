import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { MarketChart } from '@/components/dashboard/market-chart';
import { SignalsPanel } from '@/components/dashboard/signals-panel';
import { cn } from '@/lib/utils';
import { TrendingUp, BarChart3, Zap, Layers, Loader2 } from 'lucide-react';
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

/* ── Skeleton ───────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5 inline-block', className)} />
);



/* ── Page ───────────────────────────────────────────────── */
export const VistaGeneral = () => {
  const [rows, setRows] = useState<RowData[]>(
    SIMBOLOS.map(s => ({ ...s, precio: null, variacion: null, volumen: null }))
  );
  const [loading, setLoading] = useState(true);
  /** Cantidad de símbolos con `activo` en MS2; null = cargando */
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Símbolos activos"
          value={cantidadSimbolosActivos === null ? '…' : String(cantidadSimbolosActivos)}
          change="Empresas"
          trend="up"
          icon={Layers}
          subValue="En el catálogo con precios y noticias indexados"
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

    </div>
  );
};

