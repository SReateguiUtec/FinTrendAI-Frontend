import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Plus, Star, Trash2, Search,
  ChevronRight, BookOpen, AlertCircle, CheckCircle2, XCircle, X,
  ChevronLeft, TrendingUp, Activity, Clock, MessageCircle,
  TrendingDown, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPortafolios, getFavoritos, createPortafolio,
  addFavorito, removeFavorito, deletePortafolio,
  type Portafolio, type Favorito,
} from '@/services/portafolio';
import { getNoticiasPorSimbolo } from '@/services/noticias';
import {
  getUltimoPrecio, getPrecios, getPreciosRango, getSimbolos,
  type PrecioAccion, type Simbolo,
} from '@/services/precios';
import { ChartHistorial } from '@/components/chart-historial';

/* ── Noticias Helpers ─────────────────────────────────────── */
const sentimientoConfig = {
  Bullish: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: TrendingUp },
  Bearish: { color: 'text-red-400 bg-red-500/10 border-red-500/30', Icon: TrendingDown },
  Neutral: { color: 'text-zinc-400 bg-white/5 border-white/10', Icon: Minus },
} as const;

const SentimientoBadge = ({ tipo }: { tipo: string }) => {
  const config = sentimientoConfig[tipo as keyof typeof sentimientoConfig] || sentimientoConfig.Neutral;
  const { color, Icon } = config;
  return (
    <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold', color)}>
      <Icon className="size-2.5" />
      {tipo}
    </span>
  );
};

function timeAgo(iso: string) {
  const t = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(t / 1000));
  if (s < 60) return 'ahora';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 84000) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString();
}

function iniciales(texto: string) {
  const t = (texto || '').trim();
  if (!t) return 'FT';
  return t.slice(0, 2).toUpperCase();
}

/* ── Skeleton ─────────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

/* ── Mini sparkline ───────────────────────────────────────── */
const Sparkline = ({
  data,
  compact,
  positive,
}: { data: number[]; compact?: boolean; positive?: boolean }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = compact ? 80 : 64;
  const H = compact ? 28 : 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ');
  const isUp = positive !== undefined ? positive : data[data.length - 1] >= data[0];
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Día de calendario local (YYYY-MM-DD). */
function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * MS2 espera `LocalDateTime` en [inicio, fin]. `fin` solo con fecha
 * (medianoche) excluye filas de ese mismo día con hora > 00:00:00.
 */
function inicioFinDesdeRangoGrafico(rango: string): { inicio: string; fin: string } {
  const finD = new Date();
  const inicioD = new Date(finD);
  if (rango === '30d') inicioD.setDate(inicioD.getDate() - 30);
  else if (rango === '90d') inicioD.setDate(inicioD.getDate() - 90);
  else if (rango === '1y') inicioD.setDate(inicioD.getDate() - 365);
  else inicioD.setDate(inicioD.getDate() - 30);
  return {
    inicio: `${toISODateLocal(inicioD)}T00:00:00`,
    fin: `${toISODateLocal(finD)}T23:59:59`,
  };
}

export const Seguimiento = () => {
  /* Portafolios */
  const [portafolios, setPortafolios] = useState<Portafolio[]>([]);
  const [portafolioSel, setPortafolioSel] = useState<Portafolio | null>(null);
  const [loadingPf, setLoadingPf] = useState(true);
  const [defaultPfIds, setDefaultPfIds] = useState<Set<number>>(new Set());
  const DEFAULT_PF_COUNT = 5;

  /* Favoritos + precios */
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [precios, setPrecios] = useState<Record<string, PrecioAccion | null>>({});
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [loadingFav, setLoadingFav] = useState(false);
  const [noticiasPf, setNoticiasPf] = useState<any[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const [paginaNoticias, setPaginaNoticias] = useState(0);
  const NOTICIAS_PF_POR_PAGINA = 2;

  /* Catálogo de símbolos válidos */
  const [catalogo, setCatalogo] = useState<Simbolo[]>([]);

  /* Input para agregar símbolo */
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Simbolo[]>([]);
  const [validacion, setValidacion] = useState<'idle' | 'ok' | 'error'>('idle');
  const [msgValidacion, setMsgValidacion] = useState('');
  const [showSugerencias, setShowSugerencias] = useState(false);

  /* Búsqueda + paginación de portafolios (server-side) */
  const [busquedaPf, setBusquedaPf] = useState('');
  const [busquedaPfDebounced, setBusquedaPfDebounced] = useState('');
  const [paginaPf, setPaginaPf] = useState(0);
  const [totalPfServer, setTotalPfServer] = useState(0);
  const [totalPaginasPf, setTotalPaginasPf] = useState(1);
  const PF_POR_PAGINA = 5;
  const FAV_POR_PAGINA = 5;

  /* Paginación de favoritos (watchlist) */
  const [paginaFav, setPaginaFav] = useState(0);

  /* Gráfico de precios */
  const [simboloGrafico, setSimboloGrafico] = useState<string | null>(null);
  const [rangoGrafico, setRangoGrafico] = useState('30d');
  const [datosGrafico, setDatosGrafico] = useState<PrecioAccion[]>([]);
  const [loadingGrafico, setLoadingGrafico] = useState(false);
  const graficoFetchId = useRef(0);

  /* Opción 7d eliminada: migrar sesiones antiguas */
  useEffect(() => {
    if (rangoGrafico === '7d') setRangoGrafico('30d');
  }, [rangoGrafico]);

  /* Borrar portafolio — requiere confirmación */
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  /* Crear portafolio */
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'watchlist' | 'noticias' | 'senales'>('watchlist');

  /* ── Carga inicial: catálogo de símbolos (una sola vez) ── */
  useEffect(() => {
    getSimbolos().then(setCatalogo).catch(() => { });
  }, []);

  /* ── Debounce de búsqueda de portafolios (300 ms) ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setBusquedaPfDebounced(busquedaPf);
      setPaginaPf(0);
    }, 300);
    return () => clearTimeout(t);
  }, [busquedaPf]);

  /* ── Carga de portafolios: server-side (página + búsqueda) ── */
  const fetchPortafolios = useCallback(async (page: number, search: string) => {
    setLoadingPf(true);
    try {
      setError(null);
      const res = await getPortafolios(page + 1, PF_POR_PAGINA, search);
      setPortafolios(res.portafolios);
      setTotalPfServer(res.total);
      setTotalPaginasPf(res.pages);
      /* Identificar defaults solo en la primera carga (sin búsqueda, página 0) */
      if (page === 0 && !search) {
        const sorted = [...res.portafolios].sort((a, b) => a.id - b.id);
        setDefaultPfIds(prev =>
          prev.size === 0
            ? new Set(sorted.slice(0, DEFAULT_PF_COUNT).map(p => p.id))
            : prev
        );
      }
      if (!portafolioSel && res.portafolios.length > 0) {
        setPortafolioSel(res.portafolios[0]);
      }
    } catch {
      setError('No pudimos cargar los portafolios. Revisa tu conexión y vuelve a intentar.');
    } finally {
      setLoadingPf(false);
    }
  }, [portafolioSel]);

  useEffect(() => {
    fetchPortafolios(paginaPf, busquedaPfDebounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaPf, busquedaPfDebounced]);

  /* Portafolios ya vienen paginados del servidor */
  const pfPagina = portafolios;
  const pfFiltradosTotal = totalPfServer;

  /* Favoritos paginados */
  const totalPagsFav = Math.ceil(favoritos.length / FAV_POR_PAGINA);
  const favPagina = favoritos.slice(paginaFav * FAV_POR_PAGINA, (paginaFav + 1) * FAV_POR_PAGINA);

  /* ── Cargar favoritos cuando cambia el portafolio ── */
  useEffect(() => {
    if (!portafolioSel) return;
    setError(null);
    setLoadingFav(true);
    setFavoritos([]);
    setPrecios({});
    setSparklines({});
    setPaginaFav(0);

    getFavoritos(portafolioSel.id)
      .then(favs => {
        setError(null);
        setFavoritos(favs);
      })
      .catch(() => {
        setError('No pudimos cargar los favoritos. Vuelve a intentar.');
      })
      .finally(() => setLoadingFav(false));
  }, [portafolioSel]);

  /* ── Carga lazy de precios: solo para la página visible ── */
  useEffect(() => {
    if (favoritos.length === 0) return;

    const inicio = paginaFav * FAV_POR_PAGINA;
    const favsPagina = favoritos.slice(inicio, inicio + FAV_POR_PAGINA);

    // Solo pedir los que aún no están en caché
    const pendientes = favsPagina.filter(f => !(f.simbolo in precios));
    if (pendientes.length === 0) return;

    Promise.all(
      pendientes.map(async (f) => {
        try {
          const finD = new Date();
          const iniD = new Date();
          iniD.setDate(finD.getDate() - 30);
          const finStr = `${toISODateLocal(finD)}T23:59:59`;
          const iniStr = `${toISODateLocal(iniD)}T00:00:00`;

          const [ultimo, hist] = await Promise.all([
            getUltimoPrecio(f.simbolo),
            getPreciosRango(f.simbolo, iniStr, finStr).catch(() => [] as PrecioAccion[]),
          ]);
          return {
            simbolo: f.simbolo,
            precio: ultimo,
            spark: hist.slice(-20).map((p: PrecioAccion) => Number(p.close)),
          };
        } catch {
          return { simbolo: f.simbolo, precio: null, spark: [] };
        }
      })
    ).then(results => {
      const pm: Record<string, PrecioAccion | null> = {};
      const sm: Record<string, number[]> = {};
      results.forEach(r => { pm[r.simbolo] = r.precio; sm[r.simbolo] = r.spark; });
      setPrecios(prev => ({ ...prev, ...pm }));
      setSparklines(prev => ({ ...prev, ...sm }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaFav, favoritos]);

  /* ── Cargar noticias relacionadas al portafolio ── */
  useEffect(() => {
    if (favoritos.length === 0) {
      setNoticiasPf([]);
      return;
    }
    setLoadingNoticias(true);

    (async () => {
      try {
        // Obtenemos noticias para cada símbolo del portafolio (máximo los primeros 3 para no saturar)
        const simbolos = favoritos.slice(0, 3).map(f => f.simbolo);
        const promesas = simbolos.map(s => getNoticiasPorSimbolo(s).catch(() => []));
        const resultados = await Promise.all(promesas);

        // Aplanamos y ordenamos por fecha (descendente)
        const todas = resultados.flat().sort((a, b) =>
          new Date(b.fechaPublicacion || b.fecha).getTime() - new Date(a.fechaPublicacion || a.fecha).getTime()
        );

        setNoticiasPf(todas.slice(0, 6)); // Mostramos las 6 más recientes
      } catch {
        setNoticiasPf([]);
      } finally {
        setLoadingNoticias(false);
      }
    })();
  }, [favoritos]);

  /* ── Cargar datos del gráfico: rango con getPreciosRango; fallback a getPrecios + filtro ── */
  useEffect(() => {
    if (!simboloGrafico) return;
    const id = ++graficoFetchId.current;
    setLoadingGrafico(true);
    const { inicio, fin } = inicioFinDesdeRangoGrafico(rangoGrafico);
    const t0 = new Date(inicio).getTime();
    const t1 = new Date(fin).getTime();

    (async () => {
      try {
        let data: PrecioAccion[] = [];
        try {
          data = await getPreciosRango(simboloGrafico, inicio, fin);
        } catch {
          data = [];
        }
        if (id !== graficoFetchId.current) return;
        if (data.length === 0) {
          const all = await getPrecios(simboloGrafico);
          if (id !== graficoFetchId.current) return;
          data = all.filter((p) => {
            const t = new Date(p.fecha).getTime();
            return t >= t0 && t <= t1;
          });
        }
        if (id !== graficoFetchId.current) return;
        setDatosGrafico(
          [...data].sort(
            (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )
        );
      } catch {
        if (id === graficoFetchId.current) setDatosGrafico([]);
      } finally {
        if (id === graficoFetchId.current) setLoadingGrafico(false);
      }
    })();
  }, [simboloGrafico, rangoGrafico]);

  /* ── Filtrar sugerencias mientras el usuario escribe ── */
  useEffect(() => {
    const q = busqueda.trim().toUpperCase();
    if (!q) {
      setSugerencias([]);
      setValidacion('idle');
      setMsgValidacion('');
      return;
    }
    const matches = catalogo.filter(
      s => s.simbolo.startsWith(q) || s.nombre.toUpperCase().includes(q)
    ).slice(0, 6);
    setSugerencias(matches);

    /* Validación en tiempo real */
    const exact = catalogo.find(s => s.simbolo === q);
    if (exact) {
      setValidacion('ok');
      setMsgValidacion(`${exact.nombre} · ${exact.sector ?? ''}`);
    } else if (q.length >= 2) {
      setValidacion('error');
      setMsgValidacion('Símbolo no encontrado en el catálogo');
    } else {
      setValidacion('idle');
      setMsgValidacion('');
    }
  }, [busqueda, catalogo]);

  /* ── Seleccionar sugerencia del dropdown ── */
  const seleccionarSugerencia = (s: Simbolo) => {
    setBusqueda(s.simbolo);
    setSugerencias([]);
    setShowSugerencias(false);
    setValidacion('ok');
    setMsgValidacion(`${s.nombre} · ${s.sector ?? ''}`);
  };

  /* ── Agregar símbolo (solo si validación = ok) ── */
  const handleAgregar = async () => {
    if (!portafolioSel || validacion !== 'ok') return;
    const ticker = busqueda.trim().toUpperCase();
    const simboloData = catalogo.find(s => s.simbolo === ticker);
    try {
      await addFavorito(portafolioSel.id, ticker, simboloData?.nombre);
      setBusqueda('');
      setValidacion('idle');
      setMsgValidacion('');
      /* Refrescar favoritos del portafolio */
      setPortafolioSel({ ...portafolioSel });
    } catch (e: any) {
      setMsgValidacion(e?.response?.data?.error ?? 'No pudimos agregar el símbolo. Intenta de nuevo.');
      setValidacion('error');
    }
  };

  /* ── Eliminar favorito ── */
  const handleEliminar = async (simbolo: string) => {
    if (!portafolioSel) return;
    try {
      await removeFavorito(portafolioSel.id, simbolo);
      setFavoritos(prev => prev.filter(f => f.simbolo !== simbolo));
    } catch { /* ignore */ }
  };

  /* ── Eliminar portafolio ── */
  const handleEliminarPortafolio = async (id: number) => {
    if (confirmDeleteId !== id) {
      /* Primer clic: pide confirmación */
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000); // auto-cancel tras 3 s
      return;
    }
    /* Segundo clic: confirma y borra */
    try {
      await deletePortafolio(id);
      setConfirmDeleteId(null);
      if (portafolioSel?.id === id) setPortafolioSel(null);
      await fetchPortafolios(paginaPf, busquedaPfDebounced);
    } catch { /* ignore */ }
  };

  /* ── Crear portafolio ── */
  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      await createPortafolio(nuevoNombre.trim());
      setNuevoNombre('');
      await fetchPortafolios(paginaPf, busquedaPfDebounced);
    } catch { /* ignore */ } finally {
      setCreando(false);
    }
  };

  /* ── Helpers de display ── */
  const variacion = (p: PrecioAccion | null | undefined) => {
    if (!p) return { pct: '—', isUp: true };
    const delta = ((p.close - p.open) / p.open) * 100;
    return { pct: `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`, isUp: delta >= 0 };
  };

  /* ── Icono de validación ── */
  const ValidationIcon = () => {
    if (validacion === 'ok') return <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />;
    if (validacion === 'error') return <XCircle className="size-4 text-red-400 shrink-0" />;
    return null;
  };

  /* ── Helper de paginación inteligente ── */
  const getPaginationRange = (current: number, total: number) => {
    const delta = 1;
    const range = [];
    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 1) range.unshift('...');
    if (current - delta > 0) range.unshift(0);
    if (current + delta < total - 2) range.push('...');
    if (current + delta < total - 1) range.push(total - 1);
    return range;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <h1 className="text-3xl font-black tracking-tighter flex items-baseline">
            <span className="text-white">Seguimiento</span>
            <span className="text-zinc-700 ml-3 font-bold">Portafolios</span>
          </h1>
        </motion.div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Panel izquierdo: Portafolios ── */}
        <div className="lg:col-span-1 space-y-3">
          {/* Cabecera con contador */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs text-zinc-500 font-bold tracking-widest">Portafolios</h2>
            {portafolios.length > 0 && (
              <span className="text-[10px] text-zinc-600 font-bold">
                {pfFiltradosTotal} en total
              </span>
            )}
          </div>

          {/* Buscador de portafolios */}
          {(totalPfServer > 0 || busquedaPf) && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nombre…"
                value={busquedaPf}
                onChange={e => setBusquedaPf(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-xs focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-zinc-600 transition-all"
              />
              {busquedaPf && (
                <button
                  onClick={() => setBusquedaPf('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          )}

          {/* Lista paginada */}
          {loadingPf ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : pfPagina.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-3 min-h-[120px]">
              <BookOpen className="size-7 text-zinc-700" />
              <p className="text-xs text-zinc-600 text-center">
                {busquedaPf ? 'Sin resultados para esa búsqueda' : 'Sin portafolios aún'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pfPagina.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group relative"
                >
                  <button
                    onClick={() => setPortafolioSel(p)}
                    className={cn(
                      'w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all',
                      /* Solo dejar espacio para el botón borrar si NO es default */
                      !defaultPfIds.has(p.id) && 'pr-11',
                      portafolioSel?.id === p.id
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                        : 'bg-white/[0.03] border-white/5 text-white hover:border-white/10'
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold truncate max-w-[110px]">{p.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {defaultPfIds.has(p.id) && (
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37]/70 border border-[#D4AF37]/20">
                            Default
                          </span>
                        )}
                        <p className="text-[10px] text-zinc-600 truncate">{p.descripcion?.slice(0, 22) || ''}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 opacity-60" />
                  </button>

                  {/* Botón borrar — solo si NO es portafolio default */}
                  {!defaultPfIds.has(p.id) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminarPortafolio(p.id); }}
                      title={confirmDeleteId === p.id ? 'Confirmar eliminación' : 'Eliminar portafolio'}
                      className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all',
                        confirmDeleteId === p.id
                          ? 'text-red-400 bg-red-500/20 border border-red-500/30 opacity-100'
                          : 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100'
                      )}
                    >
                      {confirmDeleteId === p.id
                        ? <Trash2 className="size-3.5" />
                        : <X className="size-3.5" />
                      }
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}


          {/* Controles de paginación */}
          {totalPaginasPf > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setPaginaPf(p => Math.max(0, p - 1))}
                disabled={paginaPf === 0}
                className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              <div className="flex items-center gap-1.5">
                {getPaginationRange(paginaPf, totalPaginasPf).map((p, i) => (
                  <React.Fragment key={i}>
                    {p === '...' ? (
                      <span className="px-1 text-[10px] text-zinc-700 font-black">···</span>
                    ) : (
                      <button
                        onClick={() => setPaginaPf(p as number)}
                        className={cn(
                          'size-5 rounded-md text-[9px] font-black transition-all border uppercase tracking-tighter',
                          paginaPf === p
                            ? 'bg-white/10 border-white/20 text-white shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-400'
                        )}
                      >
                        {(p as number) + 1}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={() => setPaginaPf(p => Math.min(totalPaginasPf - 1, p + 1))}
                disabled={paginaPf === totalPaginasPf - 1}
                className="p-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}

          {/* Crear nuevo portafolio */}
          <div className="pt-2 space-y-2">
            <input
              type="text"
              placeholder="NOMBRE DEL PORTAFOLIO..."
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleCrear()}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl py-3 px-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-white/20 placeholder:text-zinc-800 transition-all shadow-inner"
            />
            <button
              onClick={handleCrear}
              disabled={creando || !nuevoNombre.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-20 shadow-sm"
            >
              <Plus className="size-3.5" />
              {creando ? 'CREANDO…' : 'CREAR PORTAFOLIO'}
            </button>
          </div>
        </div>


        {/* ── Panel derecho: Terminal Multipropósito ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Toolbar de Pestañas "Quiet Luxury" */}
          <div className="flex flex-wrap items-center gap-3 p-1 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
            {[
              { id: 'watchlist', label: 'Watchlist', icon: Star },
              { id: 'noticias', label: 'Noticias recientes', icon: BookOpen },
              { id: 'senales', label: 'Señales Engine', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVistaActiva(tab.id as any)}
                className={cn(
                  'flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-widest transition-all duration-300',
                  vistaActiva === tab.id
                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                )}
              >
                <tab.icon className={cn('size-3.5', vistaActiva === tab.id ? 'text-[#D4AF37]' : 'text-zinc-600')} />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {vistaActiva === 'watchlist' && (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >

                {/* Buscador con validación */}
                {portafolioSel && (
                  <div className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Input con dropdown */}
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 z-10" />
                        <input
                          type="text"
                          placeholder="SÍMBOLO (EJ. AAPL, TSLA, NVDA...)"
                          value={busqueda}
                          onChange={e => { setBusqueda(e.target.value.toUpperCase()); setShowSugerencias(true); }}
                          onFocus={() => setShowSugerencias(true)}
                          onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                          onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                          className={cn(
                            'w-full bg-[#0a0a0a] border rounded-xl py-3 pl-10 pr-10 text-[11px] font-black tracking-widest uppercase focus:outline-none placeholder:text-zinc-700 transition-all',
                            validacion === 'ok' && 'border-emerald-500/30 focus:border-emerald-500/50',
                            validacion === 'error' && 'border-red-500/30 focus:border-red-500/50',
                            validacion === 'idle' && 'border-white/5 focus:border-white/20',
                          )}
                        />
                        {/* Icono de validación dentro del input */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ValidationIcon />
                        </div>

                        {/* Dropdown de sugerencias */}
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
                                  onMouseDown={() => seleccionarSugerencia(s)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                                >
                                  <div className="size-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
                                    {s.simbolo.substring(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-white">{s.simbolo}</p>
                                    <p className="text-[10px] text-zinc-500 truncate">{s.nombre}</p>
                                  </div>
                                  {s.sector && (
                                    <span className="ml-auto text-[9px] text-zinc-600 uppercase font-bold tracking-wide shrink-0">
                                      {s.sector}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Botón agregar */}
                      <button
                        onClick={handleAgregar}
                        disabled={validacion !== 'ok'}
                        className="w-full sm:w-auto shrink-0 justify-center px-6 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Activity className="size-3.5" />
                        Agregar
                      </button>
                    </div>

                    {/* Mensaje de validación */}
                    {msgValidacion && (
                      <p className={cn(
                        'text-xs pl-1 flex items-center gap-1.5',
                        validacion === 'ok' && 'text-emerald-400',
                        validacion === 'error' && 'text-red-400',
                      )}>
                        {msgValidacion}
                      </p>
                    )}
                  </div>
                )}

                {/* Tabla watchlist — móvil: tarjetas; sm+: tabla */}
                <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                  {/* Cabecera móvil — columnas alineadas con la nueva fila compacta */}
                  <div className="sm:hidden flex items-center gap-3 px-4 py-2.5 border-b border-white/5 text-[9px] uppercase font-bold tracking-wider text-zinc-600">
                    <div className="size-8 shrink-0" aria-hidden />
                    <span className="flex-1">Símbolo</span>
                    <span className="w-[80px] shrink-0 text-right">Tendencia</span>
                    <span className="w-[72px] shrink-0 text-right">Precio · Var.</span>
                    <div className="w-[26px] shrink-0" aria-hidden />
                  </div>
                  {/* Cabecera escritorio — flex: izquierda flexible, métricas agrupadas a la derecha */}
                  <div className="hidden sm:flex items-center gap-4 px-5 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-600 border-b border-white/5">
                    <span className="min-w-0 flex-1">Símbolo / Empresa</span>
                    <div className="flex shrink-0 items-center gap-5">
                      <span className="w-[5.5rem] text-right">Último precio</span>
                      <span className="w-[5.5rem] text-right">Tendencia</span>
                      <span className="w-8 shrink-0" aria-hidden />
                    </div>
                  </div>

                  {!portafolioSel ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <BookOpen className="size-8 text-zinc-800" />
                      <p className="text-sm text-zinc-600">Selecciona un portafolio para ver sus símbolos</p>
                    </div>
                  ) : loadingFav ? (
                    <div className="px-4 sm:px-5 py-4 space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <React.Fragment key={i}>
                          <div className="sm:hidden space-y-3 py-1">
                            <div className="flex justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Skeleton className="size-9 rounded-xl shrink-0" />
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <Skeleton className="h-3 w-16" />
                                  <Skeleton className="h-2 w-32" />
                                </div>
                              </div>
                              <Skeleton className="size-8 rounded-lg shrink-0" />
                            </div>
                            <div className="flex justify-between items-end pl-1">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-8 w-28" />
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-4 py-3">
                            <div className="flex flex-1 items-center gap-3 min-w-0">
                              <Skeleton className="size-9 rounded-xl shrink-0" />
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <Skeleton className="h-3 w-14" />
                                <Skeleton className="h-2 w-40 max-w-full" />
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-5">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="size-7 rounded-lg" />
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : favoritos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Star className="size-8 text-zinc-800" />
                      <p className="text-sm text-zinc-600 text-center leading-relaxed">
                        Busca un símbolo del catálogo y agrégalo
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {favPagina.map((fav, i) => {
                        const p = precios[fav.simbolo];
                        const { pct, isUp } = variacion(p);
                        const spark = sparklines[fav.simbolo] ?? [];
                        const canDelete = !portafolioSel || !defaultPfIds.has(portafolioSel.id);
                        const sectorCat = catalogo.find(c => c.simbolo === fav.simbolo)?.sector;
                        return (
                          <React.Fragment key={fav.id}>
                            {/* Móvil: fila compacta en una línea */}
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: i * 0.04 }}
                              className="sm:hidden flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                              {/* Avatar */}
                              <div className="size-8 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-[9px] text-zinc-300 shrink-0">
                                {fav.simbolo.substring(0, 2)}
                              </div>

                              {/* Nombre + empresa */}
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-sm leading-none">{fav.simbolo}</p>
                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{fav.nombreEmpresa || '—'}</p>
                              </div>

                              {/* Sparkline */}
                              {spark.length > 1 && (
                                <div className="shrink-0">
                                  <Sparkline data={spark} compact positive={isUp} />
                                </div>
                              )}

                              {/* Precio + variación */}
                              <div className="text-right shrink-0">
                                {p
                                  ? <p className="font-bold text-white text-sm tabular-nums leading-none">${Number(p.close).toFixed(2)}</p>
                                  : <Skeleton className="h-4 w-16" />}
                                <span className={cn('text-xs font-bold tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
                                  {pct}
                                </span>
                              </div>

                              {/* Botón eliminar */}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleEliminar(fav.simbolo)}
                                  title="Eliminar de favoritos"
                                  className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </motion.div>
                            {/* Escritorio: flex — nombre usa el espacio; precio+tendencia agrupados */}
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: i * 0.04 }}
                              className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="size-9 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-[10px] text-zinc-300 shrink-0">
                                  {fav.simbolo.substring(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-white text-sm">{fav.simbolo}</p>
                                  <p className="text-[10px] text-zinc-500 line-clamp-1">{fav.nombreEmpresa || '—'}</p>
                                  {sectorCat ? (
                                    <p className="text-[9px] text-zinc-600 mt-0.5 line-clamp-1">{sectorCat}</p>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-5">
                                <div className="w-[5.5rem] text-right">
                                  {p
                                    ? <p className="font-bold text-white text-sm tabular-nums">${Number(p.close).toFixed(2)}</p>
                                    : <Skeleton className="h-4 w-16 ml-auto" />}
                                </div>
                                <div className="flex w-[5.5rem] flex-col items-end gap-1">
                                  {spark.length > 1 && <Sparkline data={spark} positive={isUp} />}
                                  <span className={cn('text-xs font-bold tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
                                    {pct}
                                  </span>
                                </div>
                                <div className="flex w-8 justify-end">
                                  {canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleEliminar(fav.simbolo)}
                                      title="Eliminar de favoritos"
                                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>

                {/* Paginación de favoritos */}
                {totalPagsFav > 1 && (
                  <div className="flex items-center justify-between px-1 pt-1">
                    <button
                      onClick={() => setPaginaFav(p => Math.max(0, p - 1))}
                      disabled={paginaFav === 0}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-600">
                        {paginaFav * FAV_POR_PAGINA + 1}–{Math.min((paginaFav + 1) * FAV_POR_PAGINA, favoritos.length)} de {favoritos.length}
                      </span>
                      <div className="flex items-center gap-1">
                        {getPaginationRange(paginaFav, totalPagsFav).map((p, i) => (
                          <React.Fragment key={i}>
                            {p === '...' ? (
                              <span className="px-1 text-[10px] text-zinc-600">...</span>
                            ) : (
                              <button
                                onClick={() => setPaginaFav(p as number)}
                                className={cn(
                                  'size-5 rounded-md text-[9px] font-bold transition-all',
                                  paginaFav === p
                                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                                    : 'bg-white/5 text-zinc-600 hover:text-white'
                                )}
                              >
                                {(p as number) + 1}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setPaginaFav(p => Math.min(totalPagsFav - 1, p + 1))}
                      disabled={paginaFav === totalPagsFav - 1}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                )}

              </motion.div>
            )}

            {vistaActiva === 'noticias' && (
              <motion.div
                key="noticias"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {loadingNoticias ? (
                  <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
                  </div>
                ) : noticiasPf.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-[#080808]/40 border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <BookOpen className="size-8 text-zinc-800 mb-4" />
                    <h3 className="text-sm font-bold text-zinc-500">Sin noticias para este portafolio</h3>
                    <p className="text-xs text-zinc-600 mt-2">Agrega más símbolos a tu watchlist para ver cobertura.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {noticiasPf
                        .slice(paginaNoticias * NOTICIAS_PF_POR_PAGINA, (paginaNoticias + 1) * NOTICIAS_PF_POR_PAGINA)
                        .map((n, i) => {
                          const autor = n.autor || n.fuente || 'FinTrend';
                          const iso = n.fechaPublicacion || n.fecha || new Date().toISOString();

                          return (
                            <article key={i} className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f] p-4 sm:p-5 shadow-sm transition-all hover:border-white/15 group">
                              <header className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  {n.imagenAutorUrl ? (
                                    <img src={n.imagenAutorUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover" />
                                  ) : (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800/80 text-[9px] font-bold text-zinc-300">
                                      {iniciales(autor)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">{autor}</p>
                                    <p className="truncate text-[10px] text-zinc-500">Noticias y mercado</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                                  <Clock className="size-3 shrink-0 opacity-70" />
                                  <span className="whitespace-nowrap">{timeAgo(iso)}</span>
                                </div>
                              </header>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <SentimientoBadge tipo={n.sentimiento || 'Neutral'} />
                                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-tighter">
                                  {n.simbolo}
                                </span>
                                <span className="text-[10px] text-zinc-600">· {n.fuente}</span>
                              </div>

                              <div className="mt-3 min-w-0">
                                <h4 className="text-sm font-bold text-white transition-colors line-clamp-2 leading-snug">
                                  {n.titulo}
                                </h4>
                                <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                  {n.resumen || n.description || ''}
                                </p>
                              </div>

                              <footer className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                                <div className="flex items-center gap-4 text-zinc-500">
                                  <span className="inline-flex items-center gap-1.5 text-xs">
                                    <MessageCircle className="size-3" />
                                    <span className="tabular-nums">—</span>
                                  </span>
                                </div>
                                {n.url && (
                                  <a
                                    href={n.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-[#D4AF37]/30 hover:text-white"
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </a>
                                )}
                              </footer>
                            </article>
                          );
                        })}
                    </div>

                    {/* Controles de paginación de noticias */}
                    {noticiasPf.length > NOTICIAS_PF_POR_PAGINA && (
                      <div className="flex items-center justify-between px-1 pt-4 border-t border-white/5">
                        <button
                          onClick={() => setPaginaNoticias(p => Math.max(0, p - 1))}
                          disabled={paginaNoticias === 0}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="size-4" />
                        </button>

                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          Página {paginaNoticias + 1} de {Math.ceil(noticiasPf.length / NOTICIAS_PF_POR_PAGINA)}
                        </span>

                        <button
                          onClick={() => setPaginaNoticias(p => Math.min(Math.ceil(noticiasPf.length / NOTICIAS_PF_POR_PAGINA) - 1, p + 1))}
                          disabled={paginaNoticias === Math.ceil(noticiasPf.length / NOTICIAS_PF_POR_PAGINA) - 1}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {vistaActiva === 'senales' && (
              <motion.div
                key="senales"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-3xl bg-[#080808]/40 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px] text-center"
              >
                <div className="p-6 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/10 mb-6 relative overflow-hidden group">
                  <Activity className="size-10 text-[#D4AF37]/40 relative z-10" />
                  <div className="absolute inset-0 bg-[#D4AF37]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase">Señales Engine</h3>
                <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                  <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">En Desarrollo</span>
                </div>
                <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-medium">
                  Nuestro motor de IA está procesando patrones históricos. Las señales en tiempo real estarán disponibles próximamente.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Historial: fila a ancho completo en desktop */}
        {favoritos.length > 0 && (
          <div className="col-span-1 lg:col-span-4 mt-6 pt-6 border-t border-white/5 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="size-4 text-[#D4AF37]" />
              <h3 className="text-sm font-semibold text-white">Historial de Precios de tu Portafolio</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {favoritos.map(fav => (
                <button
                  key={fav.simbolo}
                  onClick={() => setSimboloGrafico(fav.simbolo)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 border',
                    simboloGrafico === fav.simbolo
                      ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                      : 'bg-[#0a0a0a] border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                  )}
                >
                  {fav.simbolo}
                </button>
              ))}
            </div>

            {simboloGrafico ? (
              loadingGrafico ? (
                <div className="h-[320px] rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <div className="flex items-center gap-3 text-zinc-500">
                    <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#D4AF37] rounded-full animate-spin" />
                    <span className="text-sm">Cargando datos...</span>
                  </div>
                </div>
              ) : (
                <ChartHistorial
                  data={datosGrafico.map(p => ({
                    fecha: p.fecha,
                    close: Number(p.close),
                    open: Number(p.open),
                    high: Number(p.high),
                    low: Number(p.low),
                  }))}
                  simbolo={simboloGrafico}
                  timeRange={rangoGrafico}
                  onTimeRangeChange={setRangoGrafico}
                />
              )
            ) : (
              <div className="h-[200px] rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="size-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Selecciona un símbolo para ver su gráfico</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
