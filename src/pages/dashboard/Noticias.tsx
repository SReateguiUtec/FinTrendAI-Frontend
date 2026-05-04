import React, { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Search, TrendingUp, TrendingDown, Minus,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  MessageCircle, Share2, Clock, ChevronRight as ArrowRight,
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

function timeAgo(iso: string) {
  const t = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(t / 1000));
  if (s < 60) return 'hace un momento';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  if (s < 604800) return `hace ${Math.floor(s / 86400)} d`;
  return formatFecha(iso);
}

function iniciales(texto: string) {
  const t = texto.replace(/[^a-zA-Z0-9áéíóúñü]/g, ' ').trim();
  if (!t) return 'FT';
  const p = t.split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[1]![0]!).toUpperCase();
}

function resumenVista(n: Noticia) {
  if (n.resumen?.trim()) return n.resumen.trim();
  return `Cobertura ${n.simbolo} · sentimiento ${n.sentimiento} según el análisis de noticias del activo.`;
}

type NewsCardProps = {
  noticia: Noticia;
  showTrending: boolean;
};

function NewsCard({ noticia, showTrending }: NewsCardProps) {
  const autor = noticia.autor || noticia.fuente;
  const rol = 'Medio y datos de mercado';
  const categoria = noticia.categoria || noticia.simbolo;
  const iso = noticia.fechaPublicacion ?? noticia.fecha ?? new Date().toISOString();
  const href = noticia.url || '#';
  const externo = Boolean(noticia.url);

  const share = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!noticia.url) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: noticia.titulo, url: noticia.url });
      } else {
        await navigator.clipboard.writeText(noticia.url);
      }
    } catch { /* ignore */ }
  };

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#0f0f0f] p-4 sm:p-5 shadow-sm transition-all hover:border-white/15">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {noticia.imagenAutorUrl ? (
            <img
              src={noticia.imagenAutorUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800/80 text-[10px] font-bold text-zinc-300"
              aria-hidden
            >
              {iniciales(autor)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{autor}</p>
            <p className="truncate text-xs text-zinc-500">{rol}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {showTrending && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-500/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-amber-500">
              <TrendingUp className="size-3" />
              Trending
            </span>
          )}
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 sm:text-xs">
            <Clock className="size-3 shrink-0 opacity-70" />
            <span className="whitespace-nowrap">{timeAgo(iso)}</span>
          </div>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SentimientoBadge tipo={noticia.sentimiento} />
        <span className="text-[10px] text-zinc-600">· {noticia.fuente}</span>
      </div>

      <div className="mt-3 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 max-w-full flex-1 text-base font-bold leading-snug text-white sm:text-lg">
            {noticia.titulo}
          </h2>
          <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400">
            {categoria}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
          {resumenVista(noticia)}
        </p>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
        <div className="flex items-center gap-4 text-zinc-500">
          <span className="inline-flex items-center gap-1.5 text-xs" title="Comentarios (próximamente)">
            <MessageCircle className="size-3.5" />
            <span className="tabular-nums">—</span>
          </span>
          {noticia.url && (
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
            >
              <Share2 className="size-3.5" />
              Compartir
            </button>
          )}
        </div>
        <div className="ml-auto">
          {externo ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-amber-500/30 hover:text-white"
            >
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 text-zinc-600">
              <ArrowRight className="size-4" />
            </span>
          )}
        </div>
      </footer>
    </article>
  );
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
    getSimbolos().then(setCatalogo).catch(() => { });
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
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#D4AF37] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
          <h1 className="text-3xl font-black tracking-tighter uppercase flex items-baseline">
            <span className="text-white">Noticias</span>
            <span className="text-zinc-700 ml-3">Feed</span>
          </h1>
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
              placeholder="FILTRAR POR SÍMBOLO…"
              value={busquedaSimbolo}
              onChange={e => { setBusquedaSimbolo(e.target.value.toUpperCase()); setShowSugerencias(true); }}
              onFocus={() => setShowSugerencias(true)}
              onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              className="w-full min-w-0 bg-transparent border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[10px] text-white uppercase tracking-widest focus:outline-none focus:border-white/20 placeholder:text-zinc-600 transition-all"
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
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-transparent border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
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
              'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border',
              simboloActivo === ''
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
            )}
          >
            Todos
          </button>
          {SIMBOLOS_RAPIDOS.map(s => (
            <button
              key={s}
              onClick={() => { setBusquedaSimbolo(s); setSimboloActivo(s); fetchNoticias(s); }}
              className={cn(
                'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border',
                simboloActivo === s
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de sentimiento: una fila de 3 en móvil; desktop conserva aire */}
      <div
        className="grid grid-cols-3 gap-2 sm:gap-4"
        aria-label="Resumen de noticias por sentimiento en el período"
      >
        {(['Bullish', 'Bearish', 'Neutral'] as const).map(tipo => {
          const { color, Icon } = sentimientoConfig[tipo];
          return (
            <div
              key={tipo}
              className="flex flex-col items-center rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center transition-all hover:border-white/10 sm:items-stretch sm:rounded-2xl sm:p-5 sm:text-left"
            >
              <div className="mb-1.5 flex w-full items-center justify-center gap-1.5 sm:mb-3 sm:justify-start sm:gap-2">
                <div className={cn('shrink-0 rounded-md border p-1 sm:rounded-lg sm:p-1.5', color.split(' ').slice(1).join(' '))}>
                  <Icon className={cn('size-3 sm:size-3.5', color.split(' ')[0])} />
                </div>
                <span className="text-[0.6rem] font-bold uppercase leading-tight tracking-tight text-zinc-500 sm:text-xs sm:tracking-widest">
                  {tipo}
                </span>
              </div>
              {loading
                ? <Skeleton className="h-6 w-10 self-center sm:mb-1 sm:h-7 sm:w-16 sm:self-start" />
                : <p className={cn('text-lg font-bold tabular-nums sm:mb-0.5 sm:text-2xl', color.split(' ')[0])}>{conteos[tipo]}</p>
              }
              <p className="mt-0.5 hidden text-[10px] text-zinc-700 sm:mt-0 sm:block">noticias en el período</p>
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
                'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border text-center',
                filtroSentimiento === f
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
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

      {/* Feed de noticias (cards estilo blog; sin imagen de portada) */}
      <div className="max-w-3xl space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#0f0f0f] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="border-t border-white/5 pt-3">
                <Skeleton className="h-4 w-full" />
              </div>
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
              >
                <NewsCard
                  noticia={noticia}
                  showTrending={paginaNoticias === 0 && i === 0}
                />
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
