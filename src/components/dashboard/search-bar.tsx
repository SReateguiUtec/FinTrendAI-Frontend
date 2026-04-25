import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Newspaper, LineChart, ArrowUpRight, TrendingUp, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META'];

const SECTIONS = [
  { label: 'Vista general',  path: '/dashboard',           icon: BarChart3,  desc: 'Resumen del mercado y portafolio' },
  { label: 'Seguimiento',    path: '/dashboard/seguimiento', icon: LineChart,  desc: 'Rastrea tus activos en tiempo real' },
  { label: 'Señales IA',     path: '/dashboard/senales',    icon: Zap,        desc: 'Recomendaciones de compra/venta' },
  { label: 'Noticias',       path: '/dashboard/noticias',   icon: Newspaper,  desc: 'Últimas noticias del mercado' },
];

function isLikelySymbol(q: string) {
  return /^[A-Z]{1,5}$/.test(q.trim().toUpperCase());
}

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }, [navigate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    if (!q) return;
    if (isLikelySymbol(q)) {
      handleNavigate(`/dashboard/senales?sym=${q}`);
    } else {
      handleNavigate(`/dashboard/noticias?q=${encodeURIComponent(q)}`);
    }
  }, [query, handleNavigate]);

  const filteredSymbols = query.length >= 1
    ? QUICK_SYMBOLS.filter(s => s.startsWith(query.toUpperCase()))
    : QUICK_SYMBOLS;

  const filteredSections = query.length >= 1
    ? SECTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : SECTIONS;

  return (
    <div ref={ref} className="relative group max-w-md w-full">
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar símbolos, noticias o señales..."
          autoComplete="off"
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-16 text-sm focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/10 transition-all placeholder:text-zinc-600"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono">
          ⌘K
        </kbd>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            {/* Símbolo detectado */}
            {query && isLikelySymbol(query) && (
              <div className="p-3 border-b border-white/5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-2">Acción rápida</p>
                <button
                  onClick={() => handleNavigate(`/dashboard/senales?sym=${query.trim().toUpperCase()}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all group"
                >
                  <div className="size-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="size-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-bold text-white">{query.trim().toUpperCase()}</p>
                    <p className="text-xs text-zinc-500">Ver señal IA → Señales IA</p>
                  </div>
                  <ArrowUpRight className="size-4 text-[#D4AF37] ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            )}

            {/* Símbolos rápidos */}
            {filteredSymbols.length > 0 && (
              <div className="p-3 border-b border-white/5">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-2">Símbolos populares</p>
                <div className="flex flex-wrap gap-1.5">
                  {filteredSymbols.map(sym => (
                    <button
                      key={sym}
                      onClick={() => handleNavigate(`/dashboard/senales?sym=${sym}`)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border bg-white/5 border-white/10 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Secciones del dashboard */}
            {filteredSections.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 mb-2">Ir a sección</p>
                <div className="space-y-0.5">
                  {filteredSections.map(sec => (
                    <button
                      key={sec.path}
                      onClick={() => handleNavigate(sec.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <sec.icon className="size-4 shrink-0 text-zinc-600 group-hover:text-[#D4AF37] transition-colors" />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium leading-tight">{sec.label}</p>
                        <p className="text-[10px] text-zinc-600">{sec.desc}</p>
                      </div>
                      <ArrowUpRight className="size-3.5 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sin resultados */}
            {filteredSymbols.length === 0 && filteredSections.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-600">Sin resultados para <span className="text-zinc-400">"{query}"</span></p>
                <p className="text-xs text-zinc-700 mt-1">Prueba con un símbolo como AAPL o TSLA</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
