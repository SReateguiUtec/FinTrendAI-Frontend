import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Search, ChevronDown, PieChart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as analiticaService from '@/services/analitica';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

const MetricCard = ({
  label,
  value,
  icon: Icon,
  description,
  loading = false,
}: {
  label: string;
  value?: string | number;
  icon: React.ElementType;
  description: string;
  loading?: boolean;
}) => (
  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all group relative overflow-hidden">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/20 transition-all">
        <Icon className="size-4" />
      </div>
      <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="space-y-2">
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <span className="text-2xl font-bold text-white tabular-nums">{value || '0.00'}</span>
      )}
      <p className="text-[10px] text-zinc-600 font-medium">{description}</p>
    </div>
    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent group-hover:w-full transition-all duration-700" />
  </div>
);

export const Analitica = () => {
  const [simboloBusqueda, setSimboloBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [sectores, setSectores] = useState<any[]>([]);
  const [tendencias, setTendencias] = useState<any[]>([]);
  const [populares, setPopulares] = useState<any[]>([]);
  const [impactoNoticias, setImpactoNoticias] = useState<any[]>([]);

  const fetchAnalitica = async () => {
    setLoading(true);
    try {
      const [secData, trendData, popData] = await Promise.all([
        analiticaService.getRendimientoSector(),
        analiticaService.getTendencias(),
        fetch('/api/analitica/popularidad-activos').then(res => res.json())
      ]);
      
      setSectores(secData || []);
      setTendencias(trendData || []);
      setPopulares(popData || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalitica();
  }, []);

  const totalVolumen = tendencias.reduce((acc, curr) => acc + parseFloat(curr.volumen_total || 0), 0);
  const avgRendimiento = sectores.reduce((acc, curr) => acc + parseFloat(curr.rendimiento_promedio || 0), 0) / (sectores.length || 1);

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
        <MetricCard 
          label="Rendimiento promedio" 
          value={`${avgRendimiento.toFixed(2)}%`}
          icon={TrendingUp} 
          description="Promedio ponderado de todos los sectores" 
          loading={loading}
        />
        <MetricCard 
          label="Volumen total" 
          value={(totalVolumen / 1e9).toFixed(2) + 'B'}
          icon={Activity} 
          description="Suma agregada de volumen en el periodo" 
          loading={loading}
        />
        <MetricCard 
          label="Precio promedio" 
          value={tendencias.length > 0 ? `$${parseFloat(tendencias[0].precio_promedio).toFixed(2)}` : '---'}
          icon={BarChart3} 
          description="Media de cierre del mercado (último registro)" 
          loading={loading}
        />
      </div>

      {/* Gráfico rendimiento por sector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Rendimiento por Sector</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Datos de MS5 · /api/analitica/rendimiento-detallado</p>
            </div>
          </div>

          {/* Barras dinámicas */}
          <div className="space-y-3 min-h-[220px] flex flex-col justify-center">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex-1 h-5 bg-white/5 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))
            ) : sectores.length > 0 ? (
              sectores.slice(0, 6).map((s) => (
                <div key={s.sector} className="flex items-center gap-3 group/bar">
                  <span className="text-[10px] text-zinc-500 w-20 shrink-0 font-medium">{s.sector}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.abs(parseFloat(s.rendimiento_promedio)) * 10, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        parseFloat(s.rendimiento_promedio) >= 0 ? "bg-[#D4AF37]/40" : "bg-red-500/30"
                      )}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold tabular-nums w-10 text-right",
                    parseFloat(s.rendimiento_promedio) >= 0 ? "text-[#D4AF37]" : "text-red-400"
                  )}>
                    {parseFloat(s.rendimiento_promedio).toFixed(2)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-zinc-700">No hay datos de sectores disponibles</p>
            )}
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
          <span>Activo</span>
          <span>Estrategias Asociadas</span>
          <span className="text-right">Menciones</span>
          <span className="text-right">Relevancia</span>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
             [...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 items-center p-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-14 ml-auto" />
                <Skeleton className="h-2 w-full ml-4" />
              </div>
            ))
          ) : populares.length > 0 ? (
            populares.map((p, i) => (
              <div key={p.simbolo} className="grid grid-cols-4 items-center p-4 hover:bg-white/[0.01] transition-colors group/row">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white group-hover/row:border-[#D4AF37]/30 transition-all">
                    {p.simbolo[0]}
                  </div>
                  <span className="text-sm font-bold text-white">{p.simbolo}</span>
                </div>
                <span className="text-xs text-zinc-500 italic truncate pr-4">{p.estrategias}</span>
                <span className="text-sm font-bold text-zinc-300 text-right tabular-nums">{p.menciones}</span>
                <div className="pl-8">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/60 rounded-full" 
                      style={{ width: `${Math.max(100 - (i * 15), 10)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Info className="size-7 text-zinc-800" />
              <p className="text-xs text-zinc-600 text-center">No hay datos de popularidad disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
