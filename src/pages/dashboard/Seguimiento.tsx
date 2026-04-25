import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Plus, Star, Trash2, Search,
  ChevronRight, BookOpen, AlertCircle, CheckCircle2, XCircle, X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPortafolios, getFavoritos, createPortafolio,
  addFavorito, removeFavorito, deletePortafolio,
  type Portafolio, type Favorito,
} from '@/services/portafolio';
import {
  getUltimoPrecio, getPrecios, getSimbolos,
  type PrecioAccion, type Simbolo,
} from '@/services/precios';

/* ── Skeleton ─────────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

/* ── Mini sparkline ───────────────────────────────────────── */
const Sparkline = ({ data }: { data: number[] }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 64, H = 24;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ');
  const isUp = data[data.length - 1] >= data[0];
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

/* ── Page ─────────────────────────────────────────────────── */
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

  /* Catálogo de símbolos válidos */
  const [catalogo, setCatalogo] = useState<Simbolo[]>([]);

  /* Input para agregar símbolo */
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Simbolo[]>([]);
  const [validacion, setValidacion] = useState<'idle' | 'ok' | 'error'>('idle');
  const [msgValidacion, setMsgValidacion] = useState('');
  const [showSugerencias, setShowSugerencias] = useState(false);

  /* Búsqueda + paginación de portafolios */
  const [busquedaPf, setBusquedaPf] = useState('');
  const [paginaPf, setPaginaPf] = useState(0);
  const PF_POR_PAGINA = 5;

  /* Paginación de favoritos (watchlist) */
  const [paginaFav, setPaginaFav] = useState(0);
  const FAV_POR_PAGINA = 7;

  /* Borrar portafolio — requiere confirmación */
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  /* Crear portafolio */
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ── Carga inicial: portafolios + catálogo de símbolos ── */
  const fetchPortafolios = useCallback(async () => {
    setLoadingPf(true);
    try {
      setError(null);
      const [pfs, cats] = await Promise.all([getPortafolios(), getSimbolos()]);
      setPortafolios(pfs);
      setCatalogo(cats);
      /* Los DEFAULT_PF_COUNT portafolios con menor ID son los del seed — protegerlos */
      const sorted = [...pfs].sort((a, b) => a.id - b.id);
      setDefaultPfIds(new Set(sorted.slice(0, DEFAULT_PF_COUNT).map(p => p.id)));
      if (pfs.length > 0 && !portafolioSel) setPortafolioSel(pfs[0]);
    } catch {
      setError('No pudimos cargar los portafolios. Revisa tu conexión y vuelve a intentar.');
    } finally {
      setLoadingPf(false);
    }
  }, [portafolioSel]);

  useEffect(() => { fetchPortafolios(); }, []);

  /* Resetear página al cambiar búsqueda */
  useEffect(() => { setPaginaPf(0); }, [busquedaPf]);

  /* Portafolios filtrados + paginados */
  const pfFiltrados = portafolios.filter(p =>
    p.nombre.toLowerCase().includes(busquedaPf.toLowerCase())
  );
  const totalPaginas = Math.ceil(pfFiltrados.length / PF_POR_PAGINA);
  const pfPagina = pfFiltrados.slice(paginaPf * PF_POR_PAGINA, (paginaPf + 1) * PF_POR_PAGINA);

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
    setPaginaFav(0); // reset paginación al cambiar portafolio

    getFavoritos(portafolioSel.id)
      .then(async (favs) => {
        setError(null);
        setFavoritos(favs);
        const preciosMap: Record<string, PrecioAccion | null> = {};
        const sparksMap: Record<string, number[]> = {};
        await Promise.all(favs.map(async (f) => {
          try {
            const [ultimo, hist] = await Promise.all([
              getUltimoPrecio(f.simbolo),
              getPrecios(f.simbolo).catch(() => [] as PrecioAccion[]),
            ]);
            preciosMap[f.simbolo] = ultimo;
            sparksMap[f.simbolo] = hist.slice(-20).map((p: PrecioAccion) => Number(p.close));
          } catch {
            preciosMap[f.simbolo] = null;
            sparksMap[f.simbolo] = [];
          }
        }));
        setPrecios(preciosMap);
        setSparklines(sparksMap);
      })
      .catch(() => {
        setError('No pudimos cargar los favoritos. Vuelve a intentar.');
      })
      .finally(() => setLoadingFav(false));
  }, [portafolioSel]);

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
      await fetchPortafolios();
    } catch { /* ignore */ }
  };

  /* ── Crear portafolio ── */
  const handleCrear = async () => {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    try {
      await createPortafolio(nuevoNombre.trim());
      setNuevoNombre('');
      await fetchPortafolios();
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
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
              <LineChart className="size-4" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Seguimiento</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Portafolios y favoritos ·{' '}
            <span className="text-zinc-600">
              {catalogo.length} símbolos disponibles en el catálogo
            </span>
          </p>
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
            <h2 className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Portafolios</h2>
            {portafolios.length > 0 && (
              <span className="text-[10px] text-zinc-600 font-bold">
                {pfFiltrados.length} / {portafolios.length}
              </span>
            )}
          </div>

          {/* Buscador de portafolios */}
          {portafolios.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nombre…"
                value={busquedaPf}
                onChange={e => setBusquedaPf(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-zinc-600 transition-all"
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
          ) : pfFiltrados.length === 0 ? (
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
                      'w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                      /* Solo dejar espacio para el botón borrar si NO es default */
                      !defaultPfIds.has(p.id) && 'pr-9',
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
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setPaginaPf(p => Math.max(0, p - 1))}
                disabled={paginaPf === 0}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
              </button>

              <div className="flex items-center gap-1">
                {getPaginationRange(paginaPf, totalPaginas).map((p, i) => (
                  <React.Fragment key={i}>
                    {p === '...' ? (
                      <span className="px-1 text-[10px] text-zinc-600">...</span>
                    ) : (
                      <button
                        onClick={() => setPaginaPf(p as number)}
                        className={cn(
                          'size-5 rounded-md text-[9px] font-bold transition-all',
                          paginaPf === p
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

              <button
                onClick={() => setPaginaPf(p => Math.min(totalPaginas - 1, p + 1))}
                disabled={paginaPf === totalPaginas - 1}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}

          {/* Crear nuevo portafolio */}
          <div className="pt-2 space-y-2">
            <input
              type="text"
              placeholder="Nombre del portafolio"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCrear()}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-zinc-600 transition-all"
            />
            <button
              onClick={handleCrear}
              disabled={creando || !nuevoNombre.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold hover:bg-[#D4AF37]/20 transition-all disabled:opacity-40"
            >
              <Plus className="size-3.5" />
              {creando ? 'Creando…' : 'Crear portafolio'}
            </button>
          </div>
        </div>


        {/* ── Panel derecho: Watchlist ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Buscador con validación */}
          {portafolioSel && (
            <div className="space-y-1.5">
              <div className="flex gap-3">
                {/* Input con dropdown */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 z-10" />
                  <input
                    type="text"
                    placeholder="Buscar símbolo del catálogo (ej. AAPL, TSLA…)"
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value.toUpperCase()); setShowSugerencias(true); }}
                    onFocus={() => setShowSugerencias(true)}
                    onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                    onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                    className={cn(
                      'w-full bg-white/5 border rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none placeholder:text-zinc-600 transition-all',
                      validacion === 'ok' && 'border-emerald-500/40 focus:border-emerald-500/60',
                      validacion === 'error' && 'border-red-500/40 focus:border-red-500/60',
                      validacion === 'idle' && 'border-white/10 focus:border-[#D4AF37]/50',
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
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="size-4" />
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

          {/* Tabla watchlist */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
            <div className="grid grid-cols-5 px-5 py-3 text-[10px] uppercase font-bold tracking-widest text-zinc-600 border-b border-white/5">
              <span className="col-span-2">Símbolo / Empresa</span>
              <span className="text-right">Último precio</span>
              <span className="text-right">Tendencia</span>
              <span></span>
            </div>

            {!portafolioSel ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <BookOpen className="size-8 text-zinc-800" />
                <p className="text-sm text-zinc-600">Selecciona un portafolio para ver sus símbolos</p>
              </div>
            ) : loadingFav ? (
              <div className="px-5 py-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="grid grid-cols-5 items-center gap-2">
                    <div className="col-span-2 flex items-center gap-3">
                      <Skeleton className="size-9 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-2 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-16 ml-auto" />
                    <Skeleton className="h-6 w-16 ml-auto" />
                    <Skeleton className="size-7 ml-auto rounded-lg" />
                  </div>
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
                  return (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-5 items-center px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-[10px] text-zinc-300">
                          {fav.simbolo.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{fav.simbolo}</p>
                          <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{fav.nombreEmpresa || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p
                          ? <p className="font-bold text-white text-sm">${Number(p.close).toFixed(2)}</p>
                          : <Skeleton className="h-4 w-16 ml-auto" />
                        }
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {spark.length > 1 && <Sparkline data={spark} />}
                        <span className={cn('text-xs font-bold', isUp ? 'text-emerald-400' : 'text-red-400')}>
                          {pct}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {(!portafolioSel || !defaultPfIds.has(portafolioSel.id)) && (
                          <button
                            onClick={() => handleEliminar(fav.simbolo)}
                            title="Eliminar de favoritos"
                            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
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
        </div>
      </div>
    </div>
  );
};
