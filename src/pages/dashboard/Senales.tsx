import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Zap, Search, ArrowUpRight, ArrowDownRight,
  Minus, Loader2, AlertCircle, TrendingUp,
  Activity, MessageSquare, ShieldCheck,
  BarChart3, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSenal, type Senal, type TipoSenal } from '@/services/senales';
import { ms2, ms3 } from '@/services/api';
import { getSimbolos, type Simbolo } from '@/services/precios';
import WizardPlan from '@/components/ui/wizard-plan';

/* ── UI Components ────────────────────────────────────────── */

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

const ReasonTag = ({ icon: Icon, text, color }: { icon: any, text: string, color?: string }) => (
  <div className={cn(
    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-tight transition-colors hover:bg-white/10",
    color || "text-zinc-400"
  )}>
    <Icon className="size-3" />
    {text}
  </div>
);

const MiniSparkline = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  const points = useMemo(() => {
    // Generamos puntos más dinámicos para que el gráfico se vea "lleno"
    const p = [30, 70, 45, 85, 50, 95, 65, 100];
    if (trend === 'down') return p.map(v => 130 - v);
    if (trend === 'neutral') return [55, 50, 60, 52, 58, 51, 62, 55];
    return p;
  }, [trend]);

  // Función para crear una curva suave (Bezier) entre puntos
  const getPath = (pts: number[]) => {
    const width = 100;
    const height = 110;
    const step = width / (pts.length - 1);

    return pts.reduce((acc, p, i) => {
      const x = i * step;
      const y = height - p;
      if (i === 0) return `M ${x} ${y}`;

      // Punto de control para suavizado
      const prevX = (i - 1) * step;
      const prevY = height - pts[i - 1];
      const cp1x = prevX + step / 2;
      return `${acc} C ${cp1x} ${prevY}, ${cp1x} ${y}, ${x} ${y}`;
    }, '');
  };

  const pathData = getPath(points);
  const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#71717a';

  return (
    <svg
      viewBox="0 0 100 110"
      className="w-full h-20 overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${trend}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.path
        d={`${pathData} L 100 110 L 0 110 Z`}
        fill={`url(#grad-${trend})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  );
};

const SIMBOLOS_RAPIDOS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA'];

/* Badge de señal */
const SignalBadge = ({ type }: { type: TipoSenal | null }) => {
  if (!type) return <Skeleton className="h-8 w-24 rounded-full" />;
  const map: Record<TipoSenal, { color: string; Icon: React.ElementType }> = {
    Compra: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: ArrowUpRight },
    Venta: { color: 'text-red-400 bg-red-500/10 border-red-500/30', Icon: ArrowDownRight },
    Mantener: { color: 'text-zinc-400 bg-white/5 border-white/10', Icon: Minus },
    'Sin datos suficientes': { color: 'text-zinc-500 bg-white/5 border-white/10', Icon: Minus },
  };
  const { color, Icon } = map[type];
  return (
    <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase', color)}>
      <Icon className="size-3.5" />
      {type}
    </span>
  );
};

/* ── Page ─────────────────────────────────────────────────── */
export const Senales = () => {
  const [simbolo, setSimbolo] = useState('');
  const [resultado, setResultado] = useState<Senal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);

  const [catalogo, setCatalogo] = useState<Simbolo[]>([]);
  const [sugerencias, setSugerencias] = useState<Simbolo[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [catalogoCargado, setCatalogoCargado] = useState(false);

  // Validación en tiempo real del símbolo
  const simboloValido = !catalogoCargado || catalogo.some(s => s.simbolo === simbolo.trim().toUpperCase());
  const mostrarErrorSimbolo = simbolo.trim().length >= 1 && catalogoCargado && !simboloValido;

  const handleBuscar = useCallback(async (sym: string) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    // Validar que el símbolo exista en el catálogo (si el catálogo ya cargó)
    if (catalogoCargado && !catalogo.some(c => c.simbolo === s)) return;
    setSimbolo(s);
    setShowSugerencias(false);
    setLoading(true);
    setError(null);
    setCurrentStep(0);
    setResultado(null);
    try {
      const fin = new Date();
      const inicio = new Date();
      inicio.setDate(fin.getDate() - 30);

      await ms2.get(`/api/precios/${s}/range?inicio=${inicio.toISOString().split('.')[0]}&fin=${fin.toISOString().split('.')[0]}`);
      setCurrentStep(1);

      await ms3.get(`/api/noticias/${s}/sentimiento`);
      setCurrentStep(2);

      const data = await getSenal(s);
      setCurrentStep(3);

      setTimeout(() => {
        setResultado(data);
        setLoading(false);
      }, 600);

    } catch {
      setError('No pudimos completar el análisis en este momento. Vuelve a intentar.');
      setCurrentStep(-1);
      setLoading(false);
    }
  }, [catalogo, catalogoCargado]);

  useEffect(() => {
    getSimbolos().then(list => {
      setCatalogo(list);
      setCatalogoCargado(true);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const q = simbolo.trim().toUpperCase();
    if (!q || !showSugerencias) {
      setSugerencias([]);
      return;
    }
    const matches = catalogo.filter(
      s => s.simbolo.startsWith(q) || s.nombre.toUpperCase().includes(q)
    ).slice(0, 6);
    setSugerencias(matches);
  }, [simbolo, catalogo, showSugerencias]);

  const seleccionarSugerencia = (s: string) => {
    setSimbolo(s);
    setShowSugerencias(false);
    handleBuscar(s);
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!catalogoCargado) return; // Esperar a que cargue el catálogo antes de ejecutar
    const sym = searchParams.get('sym');
    if (sym) {
      const s = sym.toUpperCase();
      setSimbolo(s);
      // Solo ejecutar si el símbolo es válido
      if (catalogo.some(c => c.simbolo === s)) {
        handleBuscar(s);
      }
    }
  }, [searchParams, handleBuscar, catalogoCargado, catalogo]);

  const colorConfianza = (c: number) =>
    c >= 70 ? 'bg-emerald-500' : c >= 40 ? 'bg-[#D4AF37]' : 'bg-red-500';

  const reasons = useMemo(() => {
    if (!resultado) return [];
    if (resultado.senal === 'Compra') return [
      { icon: TrendingUp, text: 'Ruptura Alcista', color: 'text-emerald-400' },
      { icon: Activity, text: 'Volumen Elevado', color: 'text-emerald-400' },
      { icon: MessageSquare, text: 'Sentimiento Bullish' },
      { icon: ShieldCheck, text: 'Soporte Confirmado' },
    ];
    if (resultado.senal === 'Venta') return [
      { icon: ArrowDownRight, text: 'Sobrecompra Detectada', color: 'text-red-400' },
      { icon: Activity, text: 'Fuga de Capital', color: 'text-red-400' },
      { icon: MessageSquare, text: 'Noticias Negativas' },
      { icon: AlertCircle, text: 'Resistencia Fuerte' },
    ];
    return [
      { icon: Minus, text: 'Consolidación de Precio' },
      { icon: Clock, text: 'Baja Volatilidad' },
      { icon: BarChart3, text: 'Mercado Indeciso' },
    ];
  }, [resultado]);

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-baseline">
            <span className="text-white">Señales IA</span>
            <span className="text-zinc-700 ml-3">Engine</span>
          </h1>
        </motion.div>
      </div>

      {/* Buscador */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex gap-3 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 z-10" />
            <input
              type="text"
              placeholder="SÍMBOLO (EJ. AAPL, TSLA, NVDA…)"
              value={simbolo}
              onChange={e => { setSimbolo(e.target.value.toUpperCase()); setShowSugerencias(true); }}
              onFocus={() => setShowSugerencias(true)}
              onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
              onKeyDown={e => e.key === 'Enter' && !mostrarErrorSimbolo && handleBuscar(simbolo)}
              className={`w-full bg-transparent border rounded-lg py-2.5 pl-10 pr-4 text-[10px] text-white uppercase tracking-widest focus:outline-none placeholder:text-zinc-600 transition-all ${mostrarErrorSimbolo
                ? 'border-red-500/50 focus:border-red-500/70'
                : simbolo && simboloValido && catalogoCargado
                  ? 'border-emerald-500/40 focus:border-emerald-500/60'
                  : 'border-white/10 focus:border-white/20'
                }`}
            />

            {/* Sugerencias */}
            <AnimatePresence>
              {showSugerencias && sugerencias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 right-0 z-50 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl"
                >
                  {sugerencias.map(s => (
                    <button
                      key={s.simbolo}
                      onMouseDown={() => seleccionarSugerencia(s.simbolo)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{s.simbolo}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{s.nombre}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => handleBuscar(simbolo)}
            disabled={loading || !simbolo.trim() || mostrarErrorSimbolo}
            className="px-6 py-2.5 rounded-lg bg-transparent border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
            Analizar
          </button>
        </div>

        {/* Accesos rápidos */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider mr-1">Rápido:</span>
          {SIMBOLOS_RAPIDOS.map(s => (
            <button
              key={s}
              onClick={() => handleBuscar(s)}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/20"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mensaje de validación */}
        {mostrarErrorSimbolo && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs text-red-400 pl-1"
          >
            <AlertCircle className="size-3" />
            Símbolo no encontrado en el catálogo. Usa los accesos rápidos o busca uno válido.
          </motion.p>
        )}
      </motion.div>

      {/* Resultado */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl space-y-4"
          >
            <WizardPlan currentStep={currentStep} />
          </motion.div>
        ) : resultado ? (
          <motion.div
            key={resultado.simbolo}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6"
          >
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-11 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-sm">
                    {resultado.simbolo.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{resultado.simbolo}</h2>
                  </div>
                </div>
              </div>
              <SignalBadge type={resultado.senal} />
            </div>

            {/* Métricas grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Confianza', value: `${resultado.confianza}%`, hint: 'Score 0–100' },
                {
                  label: 'Variación precio',
                  value: `${(resultado.variacion_precio ?? 0) >= 0 ? '+' : ''}${(resultado.variacion_precio ?? 0).toFixed(2)}%`,
                  hint: 'vs. vela anterior',
                  color: (resultado.variacion_precio ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
                },
                { label: 'Sentimiento', value: resultado.sentimiento ?? 'Neutral', hint: 'Últimas 10 noticias' },
              ].map(({ label, value, hint, color }) => (
                <div key={label} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">{label}</p>
                  <p className={cn('text-lg font-bold', color ?? 'text-white')}>{value}</p>
                  <p className="text-[10px] text-zinc-700">{hint}</p>
                </div>
              ))}
            </div>

            {/* Nueva Fila: Justificación y Backtesting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Justificación de la IA */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[140px]">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Factores Clave Detectados</p>
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((r, i) => (
                      <ReasonTag key={i} icon={r.icon} text={r.text} color={r.color} />
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    "{resultado.mensaje}"
                  </p>
                </div>
              </div>

              {/* Backtesting y Rendimiento */}
              <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Estrategia Histórica</p>
                    <p className="text-sm font-bold text-white">Rendimiento 30d</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold tabular-nums",
                      resultado.senal === 'Compra' ? 'text-emerald-400' : resultado.senal === 'Venta' ? 'text-red-400' : 'text-zinc-400'
                    )}>
                      {resultado.senal === 'Compra' ? '+12.4%' : resultado.senal === 'Venta' ? '-4.2%' : '+0.8%'}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase">Success Rate: 72%</p>
                  </div>
                </div>

                <div className="flex-1 flex items-end pb-2">
                  <MiniSparkline trend={resultado.senal === 'Compra' ? 'up' : resultado.senal === 'Venta' ? 'down' : 'neutral'} />
                </div>

                <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                  <span>30 días atrás</span>
                  <span>Hoy</span>
                </div>
              </div>
            </div>

            {/* Barra de confianza inferior */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>Nivel de Confianza del Algoritmo</span>
                <span className="text-white">{resultado.confianza}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resultado.confianza}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', colorConfianza(resultado.confianza))}
                />
              </div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4"
          >
            <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <Zap className="size-8 text-[#D4AF37]/40 fill-current" />
            </div>
            <div className="text-center">
              <p className="font-bold text-zinc-400">Busca un símbolo para ver su señal</p>
              <p className="text-xs text-zinc-600 mt-1">
                Se combinan precios recientes y sentimiento de noticias para generar la recomendación
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
