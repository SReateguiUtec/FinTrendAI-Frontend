import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, TrendingUp, TrendingDown, House, Menu, Loader2, ExternalLink } from 'lucide-react';
import { SearchBar } from './search-bar';
import { getUltimasNoticias, type Noticia, type Sentimiento } from '@/services/noticias';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

const SIMBOLOS_PRINCIPALES = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA'] as const;
const STORAGE_LAST_SEEN = 'fintrend_topbar_news_last_seen';
const LIST_LIMIT = 15;
const FETCH_LIMIT = 120;
/** Refresco en segundo plano (ms) — notificaciones vs MS3 */
const REFRESH_NOTICIAS_MS = 5 * 60 * 1000;

function esPrincipal(simbolo: string): boolean {
  return (SIMBOLOS_PRINCIPALES as readonly string[]).includes(simbolo.toUpperCase());
}

function fechaNoticia(n: Noticia): Date {
  const raw = n.fechaPublicacion ?? n.fecha ?? '';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function contarNuevas(items: Noticia[], lastSeenIso: string | null): number {
  if (!lastSeenIso) return Math.min(items.length, 99);
  const last = new Date(lastSeenIso).getTime();
  return items.filter(n => fechaNoticia(n).getTime() > last).length;
}

function badgeSentimiento(s: Sentimiento): string {
  if (s === 'Bullish') return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
  if (s === 'Bearish') return 'text-red-400 bg-red-500/15 border-red-500/25';
  return 'text-zinc-400 bg-white/5 border-white/10';
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  const [alertasOpen, setAlertasOpen] = useState(false);
  const [items, setItems] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nuevasCount, setNuevasCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const cargarNoticiasPrincipales = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const todas = await getUltimasNoticias(FETCH_LIMIT);
      const filtradas = todas
        .filter(n => esPrincipal(n.simbolo))
        .sort((a, b) => fechaNoticia(b).getTime() - fechaNoticia(a).getTime())
        .slice(0, LIST_LIMIT);
      setItems(filtradas);
      const lastSeen = localStorage.getItem(STORAGE_LAST_SEEN);
      setNuevasCount(contarNuevas(filtradas, lastSeen));
      setError(null);
    } catch {
      if (!silent) {
        setError('No se pudieron cargar las noticias.');
        setItems([]);
        setNuevasCount(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarNoticiasPrincipales(false);
  }, [cargarNoticiasPrincipales]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void cargarNoticiasPrincipales(true);
    }, REFRESH_NOTICIAS_MS);
    return () => window.clearInterval(id);
  }, [cargarNoticiasPrincipales]);

  useEffect(() => {
    if (!alertasOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setAlertasOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [alertasOpen]);

  const toggleAlertas = () => {
    setAlertasOpen(o => {
      const next = !o;
      if (next) {
        void cargarNoticiasPrincipales(false);
        localStorage.setItem(STORAGE_LAST_SEEN, new Date().toISOString());
        setNuevasCount(0);
      }
      return next;
    });
  };

  return (
    <div className="h-16 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex items-center justify-between gap-2 px-4 sm:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <SearchBar />

        <div className="hidden lg:flex items-center gap-4 text-xs font-medium shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="size-3" />
            <span>S&P 500 +0.45%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 text-red-500">
            <TrendingDown className="size-3" />
            <span>NASDAQ -0.12%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="size-3" />
            <span>BTC +2.1%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10 ml-1 sm:ml-2">
        <button
          ref={btnRef}
          type="button"
          onClick={toggleAlertas}
          title="Noticias recientes · AAPL, NVDA, MSFT, GOOGL, TSLA"
          aria-expanded={alertasOpen}
          aria-haspopup="true"
          className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
        >
          <Bell className="size-5" />
          {nuevasCount > 0 && !alertasOpen && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-[#D4AF37] text-black rounded-full border-2 border-[#0a0a0a]">
              {nuevasCount > 99 ? '99+' : nuevasCount}
            </span>
          )}
        </button>

        {alertasOpen && (
          <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] max-h-[min(70vh,28rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl z-50 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Noticias</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {SIMBOLOS_PRINCIPALES.join(' · ')}
                </p>
              </div>
              {loading && <Loader2 className="size-4 animate-spin text-zinc-500 shrink-0" />}
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              {error && (
                <p className="text-xs text-red-400 px-2 py-4 text-center">{error}</p>
              )}
              {!loading && !error && items.length === 0 && (
                <p className="text-xs text-zinc-500 px-2 py-6 text-center">
                  No hay noticias recientes para estos símbolos en MS3.
                </p>
              )}
              {items.map(n => (
                <div
                  key={n._id}
                  className="rounded-xl p-2.5 mb-1 hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#D4AF37] shrink-0">{n.simbolo}</span>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0',
                        badgeSentimiento(n.sentimiento),
                      )}
                    >
                      {n.sentimiento}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-snug line-clamp-2">{n.titulo}</p>
                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    <span className="text-[10px] text-zinc-600 truncate">{n.fuente ?? '—'}</span>
                    {n.url ? (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-[#D4AF37] shrink-0 p-0.5"
                        title="Abrir artículo"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-8 w-px bg-white/10 mx-1" />

        <Link
          to="/"
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
        >
          <House className="size-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
      </div>
    </div>
  );
};
