import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Search, ChevronDown, PieChart, Info, Sparkles, Cpu } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import * as analiticaService from '@/services/analitica';
import { getSimbolos, Simbolo } from '@/services/precios';

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
  <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all group relative overflow-hidden">
    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-4">
      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/20 transition-all">
        <Icon className="size-3 sm:size-4" />
      </div>
      <span className="text-[10px] sm:text-sm text-zinc-500 font-bold tracking-tight sm:tracking-widest truncate">{label}</span>
    </div>
    <div className="space-y-0.5 sm:space-y-2">
      {loading ? (
        <Skeleton className="h-5 sm:h-7 w-16 sm:w-24" />
      ) : (
        <span className="text-base sm:text-2xl font-bold text-white tabular-nums">{value || '0.00'}</span>
      )}
      <p className="hidden sm:block text-[10px] text-zinc-600 font-medium">{description}</p>
    </div>
    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent group-hover:w-full transition-all duration-700" />
  </div>
);

export const Analitica = () => {
  const [simboloBusqueda, setSimboloBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('30d');
  const [showPeriodOptions, setShowPeriodOptions] = useState(false);

  // Autocomplete states
  const [simbolosList, setSimbolosList] = useState<Simbolo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Data states
  const [sectores, setSectores] = useState<any[]>([]);
  const [tendencias, setTendencias] = useState<any[]>([]);
  const [populares, setPopulares] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [noticiasVista, setNoticiasVista] = useState<any[]>([]);
  const [rendimientoActivo, setRendimientoActivo] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar lista de símbolos al montar para el autocompletado
  useEffect(() => {
    getSimbolos()
      .then(setSimbolosList)
      .catch((err) => console.error('Error loading symbols:', err));
  }, []);

  // Scroll automático a los resultados cuando se carga un activo
  useEffect(() => {
    if (rendimientoActivo.length > 0 && dataLoaded) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [rendimientoActivo, dataLoaded]);

  const handleAnalizar = async (simboloAAnalizar = simboloBusqueda) => {
    if (!simboloAAnalizar) return;
    setSimboloBusqueda(simboloAAnalizar);
    setShowSuggestions(false);
    setLoadingSymbol(true);
    setDataLoaded(true); // Desbloquear la vista de dashboard
    try {
      const data = await analiticaService.getRendimientoSimbolo(simboloAAnalizar);
      setRendimientoActivo(data || []);
    } catch (error) {
      console.error('Error analizando símbolo:', error);
    } finally {
      setLoadingSymbol(false);
    }
  };

  const fetchAnalitica = async (periodo = periodoSeleccionado) => {
    setLoading(true);
    setDataLoaded(true);
    setPeriodoSeleccionado(periodo);
    setShowPeriodOptions(false);
    try {
      const [secData, trendData, popResponse, alertasResponse, noticiasResponse] = await Promise.all([
        analiticaService.getRendimientoSector(periodo),
        analiticaService.getTendencias(),
        analiticaService.ms5.get('/api/analitica/popularidad-activos'),
        analiticaService.ms5.get('/api/analitica/alertas-contradiccion'),
        analiticaService.ms5.get('/api/analitica/rendimiento-detallado'),
      ]);

      setSectores(secData || []);
      setTendencias(trendData || []);
      setPopulares(popResponse.data || []);
      setAlertas(alertasResponse.data || []);
      setNoticiasVista(noticiasResponse.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminamos el useEffect que cargaba los datos automáticamente
  // React.useEffect(() => {
  //   fetchAnalitica();
  // }, []);

  const totalVolumen = tendencias.reduce((acc, curr) => acc + parseFloat(curr.volumen_total || 0), 0);
  const avgRendimiento = sectores.reduce((acc, curr) => acc + parseFloat(curr.rendimiento_promedio || 0), 0) / (sectores.length || 1);

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-baseline">
            <span className="text-white">Analítica</span>
            <span className="text-zinc-700 ml-3">Insights</span>
          </h1>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div
            className="relative group/menu"
            onMouseEnter={() => setShowPeriodOptions(true)}
            onMouseLeave={() => setShowPeriodOptions(false)}
          >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex"
              >
                <button
                  onClick={() => setShowPeriodOptions(!showPeriodOptions)}
                  className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-lg bg-transparent border border-white/10 text-white hover:border-[#D4AF37]/50 hover:bg-white/[0.02] transition-all duration-300 group shadow-none w-full sm:w-auto"
                >
                  <span className="text-[11px] font-medium tracking-[0.1em] whitespace-nowrap">
                    {periodoSeleccionado === 'diario' ? 'Analítica Diaria' :
                      periodoSeleccionado === '6m' ? 'Analítica 6 Meses' :
                        'Analítica 30 Días'}
                  </span>
                  {loading ? (
                    <Activity className="size-3.5 animate-spin text-[#D4AF37]" />
                  ) : (
                    <ChevronDown className={cn("size-3.5 text-zinc-500 transition-transform duration-300", showPeriodOptions && "rotate-180")} />
                  )}
                </button>
              </motion.div>

              <AnimatePresence>
                {showPeriodOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden py-1"
                  >
                    {[
                      { id: 'diario', label: 'Analítica Diaria', desc: 'Promedio intradía' },
                      { id: '30d', label: 'Últimos 30 Días', desc: 'Rendimiento mensual' },
                      { id: '6m', label: 'Últimos 6 Meses', desc: 'Tendencia semestral' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => fetchAnalitica(opt.id)}
                        className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors group/item"
                      >
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[11px] font-bold tracking-wider transition-colors",
                            periodoSeleccionado === opt.id ? "text-[#D4AF37]" : "text-white group-hover/item:text-[#D4AF37]"
                          )}>
                            {opt.label}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-medium">{opt.desc}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          {/* Buscador de símbolo con Autocompletado */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
            <div className="relative flex-1" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Símbolo (ej. AAPL)"
                value={simboloBusqueda}
                onChange={(e) => {
                  setSimboloBusqueda(e.target.value.toUpperCase());
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalizar()}
                className="bg-transparent border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[11px] text-white tracking-widest focus:outline-none focus:border-white/20 placeholder:text-zinc-600 transition-all w-full sm:w-48"
              />

              {/* Popover de Recomendaciones */}
              <AnimatePresence>
                {showSuggestions && simboloBusqueda.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full mt-2 left-0 w-[240px] max-h-[250px] overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-50 py-2 custom-scrollbar"
                  >
                    {simbolosList.filter(s =>
                      s.simbolo.toUpperCase().includes(simboloBusqueda.toUpperCase()) ||
                      s.nombre.toUpperCase().includes(simboloBusqueda.toUpperCase())
                    ).slice(0, 8).map(s => (
                      <button
                        key={s.simbolo}
                        onClick={() => handleAnalizar(s.simbolo)}
                        className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex flex-col items-start gap-0.5 group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{s.simbolo}</span>
                          <span className="text-[9px] text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-white/5">{s.sector || 'N/A'}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate w-full">{s.nombre}</span>
                      </button>
                    ))}

                    {simbolosList.filter(s => s.simbolo.toUpperCase().includes(simboloBusqueda.toUpperCase()) || s.nombre.toUpperCase().includes(simboloBusqueda.toUpperCase())).length === 0 && (
                      <div className="px-4 py-3 text-center">
                        <span className="text-xs text-zinc-500">No se encontraron símbolos</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => handleAnalizar()}
              disabled={loadingSymbol}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-transparent border border-white/10 text-white hover:bg-white/5 transition-all duration-300 disabled:opacity-50"
            >
              {loadingSymbol ? (
                <Activity className="size-3.5 animate-spin text-white" />
              ) : (
                <span className="text-[11px] font-bold tracking-[0.15em] whitespace-nowrap">Analizar</span>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Contenido Condicional */}
      {!dataLoaded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]"
        >
          <div className="p-4 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 mb-6">
            <BarChart3 className="size-10 text-[#D4AF37]/40" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Análisis de Mercado no generado</h2>
          <p className="text-zinc-500 text-sm max-w-sm text-center mb-8">
            Haz clic en el botón superior para ejecutar las consultas de Athena y visualizar las métricas detalladas del mercado.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Métricas resumen */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 sm:gap-4 relative">
            <MetricCard
              label="Rendimiento promedio"
              value={`${avgRendimiento.toFixed(2)}%`}
              icon={TrendingUp}
              description={
                periodoSeleccionado === 'diario' ? "Promedio intradía ponderado" :
                  periodoSeleccionado === '6m' ? "Rendimiento medio semestral (6m)" :
                    "Rendimiento medio mensual (30 días)"
              }
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
                  <h3 className="text-lg font-bold text-white tracking-tight">Rendimiento por sector</h3>
                  <p className="text-[10px] text-zinc-500 tracking-[0.1em] font-medium">
                    {periodoSeleccionado === 'diario' ? 'Promedio histórico ponderado' :
                      periodoSeleccionado === '6m' ? 'Rendimiento acumulado (6 meses)' :
                        'Rendimiento acumulado (30 días)'}
                  </p>
                </div>
              </div>

              <div className="min-h-[220px] w-full flex flex-col justify-center">
                {loading ? (
                  <div className="flex items-end justify-between gap-2 h-[180px]">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-t-lg animate-pulse" style={{ height: `${20 + Math.random() * 60}%` }} />
                    ))}
                  </div>
                ) : sectores.length > 0 ? (
                  <div className="h-[200px] w-full mt-2">
                    <ChartContainer
                      config={Object.fromEntries(sectores.map(s => [s.sector, { label: s.sector, color: '#D4AF37' }]))}
                      className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:fill-zinc-600"
                    >
                      <BarChart data={sectores.slice(0, 8)} margin={{ bottom: 20 }}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                          dataKey="sector"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#52525b', fontSize: 8 }}
                          interval={0}
                          height={30}
                          tickFormatter={(val) => {
                            const mapping: Record<string, string> = {
                              'Consumer Cyclical': 'CYCL',
                              'Consumer Defensive': 'DEF',
                              'Communication Services': 'COMM',
                              'Financial Services': 'FIN',
                              'Healthcare': 'HLTH',
                              'Technology': 'TECH',
                              'Basic Materials': 'MAT',
                              'Real Estate': 'RE',
                              'Utilities': 'UTIL',
                              'Energy': 'ENGY',
                              'Industrials': 'IND',
                              'Financial': 'FIN',
                              'Technology ': 'TECH'
                            };
                            return mapping[val] || (val.length > 5 ? val.substring(0, 4) : val);
                          }}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          content={
                            <ChartTooltipContent
                              className="bg-[#0c0c0c]/90 backdrop-blur-md border-white/10"
                              formatter={(val) => [
                                <span key="val" className="font-bold text-white">{Number(val).toFixed(2)}%</span>,
                                <span key="name" className="text-zinc-500 ml-2">Rendimiento</span>
                              ]}
                            />
                          }
                        />
                        <Bar
                          dataKey="rendimiento_promedio"
                          radius={[6, 6, 0, 0]}
                        >
                          {sectores.slice(0, 8).map((_, index, arr) => (
                            <Cell
                              key={`sector-${index}`}
                              fill={index === arr.length - 1 ? "#D4AF37" : "rgba(212, 175, 55, 0.15)"}
                              stroke={index === arr.length - 1 ? "none" : "rgba(212, 175, 55, 0.3)"}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="text-center text-xs text-zinc-700">No hay datos de sectores disponibles</p>
                )}
              </div>
            </div>

            {/* Tendencias del mercado */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Tendencias del mercado</h3>
                <p className="text-[10px] text-zinc-500 tracking-[0.1em] font-medium">Evolución del precio promedio</p>
              </div>

              <div className="min-h-[220px] flex flex-col justify-center">
                {loading ? (
                  <div className="flex flex-col gap-4 animate-pulse">
                    <div className="h-40 bg-white/5 rounded-xl w-full" />
                    <div className="flex justify-between px-2">
                      <div className="h-3 w-10 bg-white/5 rounded" />
                      <div className="h-3 w-10 bg-white/5 rounded" />
                      <div className="h-3 w-10 bg-white/5 rounded" />
                    </div>
                  </div>
                ) : tendencias.length > 0 ? (
                  <div className="h-[220px] w-full mt-4">
                    <ChartContainer
                      config={{
                        precio_promedio: {
                          label: "Precio Promedio",
                          color: "#D4AF37",
                        },
                      }}
                      className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:fill-zinc-600"
                    >
                      <BarChart data={[...tendencias].reverse().slice(-30)}>
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                          dataKey="dia"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#52525b', fontSize: 10 }}
                          tickFormatter={(val) => {
                            const date = new Date(val);
                            return date.toLocaleDateString("es-ES", { month: "short" }).toLowerCase();
                          }}
                          minTickGap={20}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          content={
                            <ChartTooltipContent
                              className="bg-[#0c0c0c]/90 backdrop-blur-md border-white/10"
                              labelFormatter={(val) => new Date(val as string).toLocaleDateString("es-ES", { month: 'long', day: 'numeric' })}
                              formatter={(val) => [
                                <span key="val" className="font-bold text-white">${Number(val).toFixed(2)}</span>,
                                <span key="name" className="text-zinc-500 ml-2">Precio</span>
                              ]}
                            />
                          }
                        />
                        <Bar
                          dataKey="precio_promedio"
                          radius={[4, 4, 0, 0]}
                        >
                          {[...tendencias].reverse().slice(-30).map((_, index, arr) => (
                            <Cell
                              key={`trend-${index}`}
                              fill={index === arr.length - 1 ? "#D4AF37" : "rgba(212, 175, 55, 0.15)"}
                              stroke={index === arr.length - 1 ? "none" : "rgba(212, 175, 55, 0.3)"}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 border border-dashed border-white/10 rounded-xl">
                    <Activity className="size-8 text-zinc-800" />
                    <p className="text-xs text-zinc-600 text-center">No hay datos de tendencias</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cobertura de Noticias por Sector + Impacto de Noticias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Panel: Cobertura de Noticias por Sector — Grouped Bar Chart */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Cobertura de Noticias por Sector</h3>
                <div className="flex items-center gap-3 text-[9px] font-bold tracking-widest text-zinc-500">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500 inline-block"/>Bullish</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500 inline-block"/>Bearish</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#D4AF37] inline-block"/>Neutral</span>
                </div>
              </div>
              {loading ? (
                <div className="h-[220px] flex items-end justify-between gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1">
                      <div className="bg-white/5 rounded-sm animate-pulse" style={{ height: `${30 + i * 15}px` }} />
                      <div className="bg-white/5 rounded-sm animate-pulse" style={{ height: `${20 + i * 10}px` }} />
                      <div className="bg-white/5 rounded-sm animate-pulse" style={{ height: `${10 + i * 8}px` }} />
                    </div>
                  ))}
                </div>
              ) : noticiasVista.length > 0 ? (() => {
                // Pivot: group by sector, aggregate sentimientos — top 5 por volumen total
                const sectors = [...new Set(noticiasVista.map((r: any) => r.sector))];
                const allData = sectors.map(sector => {
                  const rows = noticiasVista.filter((r: any) => r.sector === sector);
                  const get = (sent: string) => Number(rows.find((r: any) => r.sentimiento === sent)?.volumen_noticias || 0);
                  const total = rows.reduce((acc: number, r: any) => acc + Number(r.volumen_noticias || 0), 0);
                  const label = (sector as string)?.length > 7 ? (sector as string).substring(0, 6) + '…' : sector;
                  return { sector: label, Bullish: get('Bullish'), Bearish: get('Bearish'), Neutral: get('Neutral'), total };
                });
                const chartData = allData.sort((a, b) => b.total - a.total).slice(0, 5);
                return (
                  <div className="h-[220px] w-full">
                    <ChartContainer
                      config={{ Bullish: { label: 'Bullish', color: '#22c55e' }, Bearish: { label: 'Bearish', color: '#ef4444' }, Neutral: { label: 'Neutral', color: '#D4AF37' } }}
                      className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:fill-zinc-600"
                    >
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 16 }} barCategoryGap="28%">
                        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 9 }} interval={0} height={24} />
                        <YAxis hide domain={[0, 'auto']} />
                        <ChartTooltip
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          content={<ChartTooltipContent className="bg-[#0c0c0c]/90 backdrop-blur-md border-white/10" />}
                        />
                        <Bar dataKey="Bullish" fill="#22c55e" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Bearish" fill="#ef4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Neutral"  fill="#D4AF37" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                  <Activity className="size-7 text-zinc-700" />
                  <p className="text-xs text-zinc-500">Sin datos de cobertura</p>
                </div>

              )}
            </div>

            {/* Panel: Alertas de Contradicción (vista_alertas_contradiccion) */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">Alertas de Contradicción</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Alta volatilidad con cobertura positiva · Top 10</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <div className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-amber-400 tracking-widest">LIVE</span>
                </div>
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : alertas.length > 0 ? (
                <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                  {alertas.map((a: any, i: number) => {
                    const vol = parseFloat(a.volatilidad_promedio || 0);
                    const bullish = Number(a.noticias_bullish || 0);
                    const bearish = Number(a.noticias_bearish || 0);
                    const total = Number(a.total_noticias || 1);
                    const maxVol = Math.max(...alertas.map((x: any) => parseFloat(x.volatilidad_promedio || 0)));
                    const volPct = maxVol > 0 ? (vol / maxVol) * 100 : 0;
                    // Contradicción: alta volatilidad + mayoría de noticias bullish
                    const esContradiccion = bullish > bearish && vol > (maxVol * 0.5);
                    return (
                      <div key={i} className={cn(
                        "relative p-3 rounded-xl border transition-all group/alert",
                        esContradiccion
                          ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}>
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {esContradiccion && (
                              <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                ⚠ ALERTA
                              </span>
                            )}
                            <span className="text-sm font-black text-white tracking-tight">{a.simbolo}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                              {bullish}B↑
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                              {bearish}B↓
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${volPct}%`,
                                backgroundColor: esContradiccion ? '#f59e0b' : '#D4AF37',
                                opacity: 0.8
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums text-zinc-400 w-12 text-right">
                            {vol.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                  <Sparkles className="size-7 text-zinc-700" />
                  <p className="text-xs text-zinc-500">Sin datos de alertas</p>
                </div>
              )}
            </div>
          </div>



          {/* Análisis por Símbolo / Populares */}
          {rendimientoActivo.length > 0 && simboloBusqueda ? (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              {/* Decorative Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#D4AF37]/10 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

              <div className="relative p-5 sm:p-8 rounded-3xl bg-[#080808] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                {/* Background Texture/Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#D4AF37 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-6 sm:h-8 w-1 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                      <h3 className="font-bold text-white text-xl sm:text-2xl tracking-tight leading-tight">
                        Análisis <span className="hidden xs:inline">Detallado</span>: <span className="text-[#D4AF37]">{simboloBusqueda}</span>
                      </h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 ml-3 sm:ml-4 font-medium tracking-[0.05em] opacity-80">Intelligence Report • 100 Días</p>
                  </div>
                  <button
                    onClick={() => setRendimientoActivo([])}
                    className="self-start sm:self-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                  >
                    Cerrar terminal
                  </button>
                </div>

                {/* Micro-métricas del activo - Premium Grid Responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10">
                  {[
                    {
                      label: "Último Precio",
                      value: `$${parseFloat(rendimientoActivo[0]?.precio_cierre || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                      className: "col-span-1"
                    },
                    {
                      label: "Vol. (100d)",
                      value: `${(rendimientoActivo.reduce((acc, r) => acc + parseFloat(r.volumen || 0), 0) / rendimientoActivo.length / 1000000).toFixed(2)}M`,
                      className: "col-span-1"
                    },
                    {
                      label: "Volatilidad Media",
                      value: `${(rendimientoActivo.reduce((acc, r) => acc + parseFloat(r.volatilidad || 0), 0) / rendimientoActivo.length).toFixed(2)}%`,
                      className: "col-span-2 sm:col-span-1"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className={cn(
                      "relative p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 group/card overflow-hidden",
                      item.className
                    )}>
                      <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-5 group-hover/card:opacity-10 transition-opacity">
                        <TrendingUp className="size-8 sm:size-12 text-white" />
                      </div>
                      <span className="text-[9px] sm:text-[11px] text-zinc-500 tracking-[0.1em] font-bold block mb-1 sm:mb-2">{item.label}</span>
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <p className="text-xl sm:text-3xl font-bold text-white tabular-nums tracking-tighter">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gráfico del activo - Estética Refinada */}
                <div className="h-[320px] w-full mt-4 group/chart">
                  <ChartContainer
                    config={{ precio_cierre: { label: "Market Price", color: "#D4AF37" } }}
                    className="h-full w-full"
                  >
                    <AreaChart
                      data={[...rendimientoActivo].reverse()}
                      margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorPrecioActivo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.5} />
                          <stop offset="40%" stopColor="#D4AF37" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="0"
                        stroke="rgba(255,255,255,0.03)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="fecha"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={20}
                        minTickGap={60}
                        tick={{ fill: "#52525b", fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => {
                          const date = new Date(val);
                          return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }).toUpperCase();
                        }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={20}
                        tick={{ fill: "#52525b", fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                      />
                      <ChartTooltip
                        cursor={{ stroke: "rgba(212,175,55,0.2)", strokeWidth: 2 }}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(val) => new Date(val as string).toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            formatter={(val, name) => [
                              <span key="val" className="font-bold text-white">
                                ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>,
                              <span key="name" className="text-zinc-500 ml-2">{name}</span>
                            ]}
                            className="bg-[#0c0c0c]/90 backdrop-blur-md border-white/10 text-white rounded-xl shadow-2xl p-4"
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="precio_cierre"
                        stroke="#D4AF37"
                        strokeWidth={3}
                        strokeLinecap="round"
                        fill="url(#colorPrecioActivo)"
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative group">
              {/* Decorative Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

              <div className="relative p-6 sm:p-8 rounded-3xl bg-[#080808]/40 border border-white/5 backdrop-blur-sm overflow-hidden shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Activos populares</h3>
                    <p className="text-[10px] text-zinc-500 tracking-[0.1em] font-medium">Top 10 activos con más relevancia</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                    <div className="size-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-400 tracking-widest">Live Updates</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                  ) : populares.length > 0 ? (
                    populares.slice(0, 6).map((p, i) => (
                      <div key={p.simbolo} className="relative group/row">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-all rounded-2xl" />

                        <div className="relative flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-transparent group-hover/row:border-white/5 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border",
                                i < 3 ? "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]" : "bg-white/5 border-white/10 text-zinc-400"
                              )}>
                                {p.simbolo[0]}
                              </div>
                              <div className={cn(
                                "absolute -top-1.5 -left-1.5 size-5 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-[#080808]",
                                i === 0 ? "bg-[#D4AF37] text-black" :
                                  i === 1 ? "bg-zinc-300 text-black" :
                                    i === 2 ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400"
                              )}>
                                {i + 1}
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="text-base font-bold text-white tracking-tight">{p.simbolo}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                  {p.menciones > 1000 ? `${(p.menciones / 100).toFixed(0)} Estrategias` : 'Core Asset'}
                                </span>
                                <div className="size-1 rounded-full bg-zinc-800" />
                                <span className="text-[9px] text-zinc-600 font-medium tracking-tight">Rel: {(98 - i * 1.5).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-sm font-bold text-white tabular-nums">{p.menciones.toLocaleString()}</span>
                              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Hits</span>
                            </div>
                            {/* Progress bar subtle */}
                            <div className="w-20 sm:w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.menciones / populares[0].menciones) * 100}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  i < 3 ? "bg-[#D4AF37]" : "bg-zinc-600"
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-50">
                      <Activity className="size-8 text-zinc-700" />
                      <p className="text-xs text-zinc-500 uppercase tracking-widest text-center">No matching assets found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
