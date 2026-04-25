import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Search, TrendingUp, TrendingDown, Minus,
  ExternalLink, RefreshCw, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getNoticiasPorSimbolo, getUltimasNoticias,
  type Noticia, type Sentimiento,
} from '@/services/noticias';

import {
  getUltimoPrecio, getPrecios, getSimbolos,
  type PrecioAccion, type Simbolo,
} from '@/services/precios';

/* ── Helpers ─────────────────────────────────────────────── */
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />
);

type FiltroSentimiento = 'Todas' | Sentimiento;
const FILTROS: FiltroSentimiento[] = ['Todas', 'Bullish', 'Bearish', 'Neutral'];
const SIMBOLOS_RAPIDOS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA'];

const sentimientoConfig = {
  Bullish: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', Icon: TrendingUp },
  Bearish: { color: 'text-red-400 bg-red-500/10 border-red-500/30', Icon: TrendingDown },
  Neutral: { color: 'text-zinc-400 bg-white/5 border-white/10', Icon: Minus },
} as const;

const SentimientoBadge = ({ tipo }: { tipo: Sentimiento }) => {
  const { color, Icon } = sentimientoConfig[tipo];
  return (
    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase', color)}>
      <Icon className="size-2.5" />
      {tipo}
    </span>
  );
};

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ── Page ─────────────────────────────────────────────────── */
export const Noticias = () => {
  const [filtroSentimiento, setFiltroSentimiento] = useState<FiltroSentimiento>('Todas');
  const [busquedaSimbolo, setBusquedaSimbolo] = useState('');
  const [simboloActivo, setSimboloActivo] = useState('');
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Catálogo de símbolos (para sugerencias) */
  const [catalogo, setCatalogo] = useState<Simbolo[]>([]);
  const [sugerencias, setSugerencias] = useState<Simbolo[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);

  const [paginaNoticias, setPaginaNoticias] = useState(0);
  const NOTICIAS_POR_PAGINA = 10;

  /* Conteos de sentimiento */
  const conteos = {
    Bullish: noticias.filter(n => n.sentimiento === 'Bullish').length,
    Bearish: noticias.filter(n => n.sentimiento === 'Bearish').length,
    Neutral: noticias.filter(n => n.sentimiento === 'Neutral').length,
  };

  const fetchNoticias = useCallback(async (simbolo: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = simbolo
        ? await getNoticiasPorSimbolo(simbolo)
        : await getUltimasNoticias();
      setNoticias(data);
    } catch {
      setNoticias([]);
      setError('No pudimos cargar el contenido en este momento. Vuelve a intentar.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Carga inicial: noticias + catálogo */
  useEffect(() => {
    fetchNoticias('');
    getSimbolos().then(setCatalogo).catch(() => {});
  }, [fetchNoticias]);

  /* Filtrar sugerencias */
  useEffect(() => {
    const q = busquedaSimbolo.trim().toUpperCase();
    if (!q || !showSugerencias) {
      setSugerencias([]);
      return;
    }
    const matches = catalogo.filter(
      s => s.simbolo.startsWith(q) || s.nombre.toUpperCase().includes(q)
    ).slice(0, 6);
    setSugerencias(matches);
  }, [busquedaSimbolo, catalogo, showSugerencias]);

  const seleccionarSugerencia = (s: string) => {
    setBusquedaSimbolo(s);
    setSimboloActivo(s);
    setShowSugerencias(false);
    fetchNoticias(s);
  };

  const handleBuscar = () => {
    const s = busquedaSimbolo.trim().toUpperCase();
    setSimboloActivo(s);
    fetchNoticias(s);
  };

  const noticiasFiltradas = filtroSentimiento === 'Todas'
    ? noticias
    : noticias.filter(n => n.sentimiento === filtroSentimiento);

  const totalPaginas = Math.ceil(noticiasFiltradas.length / NOTICIAS_POR_PAGINA);
  const noticiasPaginadas = noticiasFiltradas.slice(paginaNoticias * NOTICIAS_POR_PAGINA, (paginaNoticias + 1) * NOTICIAS_POR_PAGINA);

  useEffect(() => {
    setPaginaNoticias(0);
  }, [filtroSentimiento, simboloActivo]);

  return (
    <div className="px-4 py-6 sm:p-8 space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
              <Newspaper className="size-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Noticias</h1>
          </div>
          <p className="text-zinc-400 text-sm leading-snug">
            Feed con sentimiento ·{' '}
            <span className="text-zinc-600">{noticias.length} noticias cargadas</span>
          </p>
        </motion.div>

        {/* Búsqueda: fila completa en móvil; acciones en segunda fila */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2 w-full sm:w-auto min-w-0"
        >
          <div className="relative w-full sm:w-56 min-w-0 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500 z-10" />
            <input
              type="text"
              placeholder="Filtrar por símbolo…"
              value={busquedaSimbolo}
              onChange={e => { setBusquedaSimbolo(e.target.value.toUpperCase()); setShowSugerencias(true); }}
              onFocus={() => setShowSugerencias(true)}
              onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              className="w-full min-w-0 bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-zinc-600 transition-all"
            />

            {/* Sugerencias */}
            <AnimatePresence>
              {showSugerencias && sugerencias.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 right-0 z-50 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[200px]"
                >
                  {sugerencias.map(s => (
                    <button
                      key={s.simbolo}
                      onMouseDown={() => seleccionarSugerencia(s.simbolo)}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{s.simbolo}</p>
                        <p className="text-[9px] text-zinc-500 truncate">{s.nombre}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBuscar}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/20 transition-all"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => { setBusquedaSimbolo(''); setSimboloActivo(''); fetchNoticias(''); }}
              title="Recargar"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all shrink-0"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Accesos rápidos por símbolo */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider shrink-0">Símbolo</span>
        <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setBusquedaSimbolo(''); setSimboloActivo(''); fetchNoticias(''); }}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
            simboloActivo === ''
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
              : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
          )}
        >
          Todos
        </button>
        {SIMBOLOS_RAPIDOS.map(s => (
          <button
            key={s}
            onClick={() => { setBusquedaSimbolo(s); setSimboloActivo(s); fetchNoticias(s); }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all border',
              simboloActivo === s
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
            )}
          >
            {s}
          </button>
        ))}
        </div>
      </div>

      {/* Resumen de sentimiento */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {(['Bullish', 'Bearish', 'Neutral'] as const).map(tipo => {
          const { color, Icon } = sentimientoConfig[tipo];
          return (
            <div key={tipo} className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('p-1.5 rounded-lg border', color.split(' ').slice(1).join(' '))}>
                  <Icon className={cn('size-3.5', color.split(' ')[0])} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{tipo}</span>
              </div>
              {loading
                ? <Skeleton className="h-7 w-16 mb-1" />
                : <p className={cn('text-2xl font-bold', color.split(' ')[0])}>{conteos[tipo]}</p>
              }
              <p className="text-[10px] text-zinc-700">noticias en el período</p>
            </div>
          );
        })}
      </div>

      {/* Filtros de sentimiento */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1">
        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider shrink-0">Filtrar</span>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        {FILTROS.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltroSentimiento(f)}
            className={cn(
              'px-3 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-all border text-center sm:text-left',
              filtroSentimiento === f
                ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
            )}
          >
            {f}
          </button>
        ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </div>
      )}

      {/* Feed de noticias */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="flex items-center gap-3 pt-1">
                  <Skeleton className="h-2 w-20" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-lg shrink-0" />
            </div>
          ))
        ) : noticiasFiltradas.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
            <Newspaper className="size-8 text-zinc-800" />
            <div className="text-center">
              <p className="font-bold text-zinc-500">Sin noticias para este filtro</p>
              <p className="text-xs text-zinc-700 mt-1">
                Prueba con otro símbolo o cambia el filtro de sentimiento
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {noticiasPaginadas.map((noticia, i) => (
              <motion.div
                key={noticia._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex gap-4 group transition-all"
              >
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SentimientoBadge tipo={noticia.sentimiento} />
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400">
                      {noticia.simbolo}
                    </span>
                    <span className="text-[10px] text-zinc-600">{formatFecha(noticia.fechaPublicacion ?? noticia.fecha)}</span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                    {noticia.titulo}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                    <span>📰 {noticia.fuente}</span>
                  </div>
                </div>

                {noticia.url && (
                  <a
                    href={noticia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-600 hover:text-white hover:border-white/20 transition-all self-start shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={() => setPaginaNoticias(p => Math.max(0, p - 1))}
            disabled={paginaNoticias === 0}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="size-3.5" /> Anterior
          </button>

          <span className="text-xs text-zinc-500 font-medium">
            Página <span className="text-white">{paginaNoticias + 1}</span> de {totalPaginas}
          </span>

          <button
            onClick={() => setPaginaNoticias(p => Math.min(totalPaginas - 1, p + 1))}
            disabled={paginaNoticias === totalPaginas - 1}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Siguiente <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
