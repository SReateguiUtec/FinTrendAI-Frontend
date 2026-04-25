import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

const MetricCard = ({
  label,
  icon: Icon,
  description,
}: {
  label: string;
  icon: React.ElementType;
  description: string;
}) => (
  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all group">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/20 transition-all">
        <Icon className="size-4" />
      </div>
      <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
    </div>
    {/* Valor vacío: viene de MS5 */}
    <div className="space-y-2">
      <Skeleton className="h-7 w-24" />
      <p className="text-[10px] text-zinc-700">{description}</p>
    </div>
    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent group-hover:w-full transition-all duration-500 rounded-b-2xl" />
  </div>
);

export const Analitica = () => {
  const [simboloBusqueda, setSimboloBusqueda] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('Todos');

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="rounded-lg bg-[#D4AF37]/20 p-1.5 text-[#D4AF37]">
              <BarChart3 className="size-4" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Analítica</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Métricas de mercado · <span className="text-zinc-600">MS5 vía AWS Athena</span>
          </p>
        </motion.div>

        {/* Buscador de símbolo */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Símbolo (ej. AAPL)"
              value={simboloBusqueda}
              onChange={(e) => setSimboloBusqueda(e.target.value.toUpperCase())}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-zinc-600 transition-all w-44"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/20 transition-all">
            Analizar
          </button>
        </motion.div>
      </div>

      {/* Métricas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        <MetricCard label="Rendimiento promedio" icon={TrendingUp} description="Promedio ponderado de todos los sectores" />
        <MetricCard label="Volumen total" icon={Activity} description="Suma agregada de volumen del período" />
        <MetricCard label="Precio promedio" icon={BarChart3} description="Media de cierre del mercado" />
      </div>

      {/* Gráfico rendimiento por sector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Rendimiento por Sector</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Datos de MS5 · /api/analitica/rendimiento-sector</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors">
              {sectorFiltro} <ChevronDown className="size-3" />
            </button>
          </div>

          {/* Barras vacías (estructura esperada) */}
          <div className="space-y-3 min-h-[220px] flex flex-col justify-center">
            {['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'].map((sector) => (
              <div key={sector} className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 w-20 shrink-0">{sector}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-[#D4AF37]/20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
            <p className="text-center text-xs text-zinc-700 pt-2">Esperando datos de MS5…</p>
          </div>
        </div>

        {/* Tendencias del mercado */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div>
            <h3 className="font-bold text-white">Tendencias del Mercado</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Datos de MS5 · /api/analitica/tendencias</p>
          </div>

          {/* SVG placeholder del gráfico */}
          <div className="min-h-[220px] flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl">
            <Activity className="size-8 text-zinc-800" />
            <p className="text-xs text-zinc-600 text-center leading-relaxed">
              La línea de tendencia se<br />renderizará con datos reales
            </p>
            {/* Eje fake */}
            <div className="w-full px-4 opacity-20">
              <div className="h-px bg-white/20 w-full" />
              <div className="flex justify-between mt-1">
                {['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((m) => (
                  <span key={m} className="text-[8px] text-zinc-600">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla rendimiento por símbolo */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Rendimiento por Símbolo</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Datos de MS5 · /api/analitica/rendimiento-simbolo?simbolo=…</p>
          </div>
        </div>

        <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase font-bold tracking-widest text-zinc-600 border-b border-white/5">
          <span>Símbolo</span>
          <span>Fecha</span>
          <span className="text-right">Rendimiento</span>
          <span className="text-right">Estado</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <BarChart3 className="size-7 text-zinc-800" />
          <p className="text-xs text-zinc-600 text-center">
            Busca un símbolo arriba para ver su rendimiento histórico
          </p>
        </div>

        {/* Filas skeleton */}
        <div className="opacity-20 pointer-events-none space-y-3 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-14 ml-auto" />
              <Skeleton className="h-5 w-14 ml-auto rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
