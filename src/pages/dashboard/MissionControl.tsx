import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import {
  MISSION_CONTROL_SYMBOLS,
  getMissionControlMarketOverview,
  getMissionControlNewsPulse,
  getMissionControlSignals,
  type MissionControlNewsRow,
  type MissionControlQuote,
  type MissionControlSignalRow,
} from '@/services/mission-control';
import {
  getMacroCalendar,
  getMarketStatus,
  getBreakingNews,
  getTopMovers,
  type MacroEvent,
  type MarketStatus,
  type BreakingNews,
  type TopMoversResult
} from '@/services/external-apis';
import { getPreciosRango } from '@/services/precios';

type Loadable<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
};

// ... (keep constants)
const PRICE_REFRESH_MS = 60_000;
const EXTERNAL_API_REFRESH_MS = 300_000;

function createBlockState<T>(data: T): Loadable<T> {
  return { data, loading: true, error: null, updatedAt: null };
}

// Sparkline Component
function MinimalSparkline({ data, positive }: { data: number[], positive: boolean }) {
  if (data.length < 2) return <div className="w-16 h-4 opacity-20 bg-amber-900/30" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 16;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible stroke-current drop-shadow-md">
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className={cn(positive ? "text-emerald-500" : "text-red-500")}
      />
    </svg>
  );
}

function formatPrice(value: number | null) {
  if (value === null || Number.isNaN(value)) return '---';
  return value.toFixed(2);
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatCompactNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return '--';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: parsed >= 100 ? 0 : 1,
  }).format(parsed);
}

function formatTimestamp(ts: number | null) {
  if (!ts) return '--:--:--';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
  }).format(new Date(ts));
}

function getEasternSnapshot(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const wd = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return { wd, totalMinutes: hour * 60 + minute, label: formatter.format(date) };
}

function getMarketSession() {
  const now = new Date();
  const { wd, totalMinutes, label } = getEasternSnapshot(now);
  const isWeekend = wd === 'Sat' || wd === 'Sun';
  if (isWeekend) return { label: 'CLOSED', accent: 'text-red-500', clock: label };
  if (totalMinutes >= 240 && totalMinutes < 570) return { label: 'PRE-MKT', accent: 'text-yellow-500', clock: label };
  if (totalMinutes >= 570 && totalMinutes < 960) return { label: 'OPEN', accent: 'text-emerald-500', clock: label };
  if (totalMinutes >= 960 && totalMinutes < 1200) return { label: 'A-HOURS', accent: 'text-cyan-500', clock: label };
  return { label: 'CLOSED', accent: 'text-red-500', clock: label };
}

function PanelShell({
  title,
  kicker,
  children,
  className,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col border border-amber-600/30 bg-black', className)}>
      <div className="flex items-center justify-between border-b border-amber-600/30 bg-amber-900/20 px-2 py-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] font-bold text-amber-500">{kicker}</span>
          <h2 className="text-xs font-bold text-amber-100">{title}</h2>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 p-2 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </section>
  );
}

function PanelPlaceholder() {
  return <div className="p-2 animate-pulse text-[10px] text-amber-500/50">LOADING...</div>;
}

function PanelError({ message }: { message: string }) {
  return <div className="p-2 border border-red-500/30 bg-red-950/20 text-red-500 text-[10px]">ERR: {message}</div>;
}

// Global cache to avoid refetching on every remount
const mcCache = {
  quotes: createBlockState<MissionControlQuote[]>([]),
  sparklines: {} as Record<string, number[]>,
  historicalData: {} as Record<string, { fecha: string, close: number }[]>,
  signals: createBlockState<MissionControlSignalRow[]>([]),
  news: createBlockState<MissionControlNewsRow[]>([]),

  macroCalendar: createBlockState<MacroEvent[]>([]),
  marketStatus: createBlockState<MarketStatus | null>(null),
  breakingNews: createBlockState<BreakingNews[]>([]),
  topMovers: createBlockState<TopMoversResult>({ gainers: [], losers: [], mostActivelyTraded: [] }),

  lastFetchPrices: 0,
  lastFetchExternal: 0,
  hasFetchedSignals: false,
};

export const MissionControl = () => {
  const [quotes, setQuotesState] = useState(mcCache.quotes);
  const [sparklines, setSparklinesState] = useState(mcCache.sparklines);
  const [historicalData, setHistoricalDataState] = useState(mcCache.historicalData);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(MISSION_CONTROL_SYMBOLS[0].simbolo);

  const [signals, setSignalsState] = useState(mcCache.signals);
  const [news, setNewsState] = useState(mcCache.news);

  const [macroCalendar, setMacroCalendarState] = useState(mcCache.macroCalendar);
  const [marketStatus, setMarketStatusState] = useState(mcCache.marketStatus);
  const [breakingNews, setBreakingNewsState] = useState(mcCache.breakingNews);
  const [topMovers, setTopMoversState] = useState(mcCache.topMovers);

  // Wrappers to update both local state and global cache
  const setQuotes = (val: any) => { const next = typeof val === 'function' ? val(mcCache.quotes) : val; mcCache.quotes = next; setQuotesState(next); };
  const setSparklines = (val: any) => { const next = typeof val === 'function' ? val(mcCache.sparklines) : val; mcCache.sparklines = next; setSparklinesState(next); };
  const setHistoricalData = (val: any) => { const next = typeof val === 'function' ? val(mcCache.historicalData) : val; mcCache.historicalData = next; setHistoricalDataState(next); };
  const setSignals = (val: any) => { const next = typeof val === 'function' ? val(mcCache.signals) : val; mcCache.signals = next; setSignalsState(next); };
  const setNews = (val: any) => { const next = typeof val === 'function' ? val(mcCache.news) : val; mcCache.news = next; setNewsState(next); };

  const setMacroCalendar = (val: any) => { const next = typeof val === 'function' ? val(mcCache.macroCalendar) : val; mcCache.macroCalendar = next; setMacroCalendarState(next); };
  const setMarketStatus = (val: any) => { const next = typeof val === 'function' ? val(mcCache.marketStatus) : val; mcCache.marketStatus = next; setMarketStatusState(next); };
  const setBreakingNews = (val: any) => { const next = typeof val === 'function' ? val(mcCache.breakingNews) : val; mcCache.breakingNews = next; setBreakingNewsState(next); };
  const setTopMovers = (val: any) => { const next = typeof val === 'function' ? val(mcCache.topMovers) : val; mcCache.topMovers = next; setTopMoversState(next); };

  const marketSession = useMemo(() => getMarketSession(), []);

  useEffect(() => {
    const now = Date.now();
    const shouldFetchPrices = (now - mcCache.lastFetchPrices) > PRICE_REFRESH_MS;
    const shouldFetchExternal = (now - mcCache.lastFetchExternal) > EXTERNAL_API_REFRESH_MS;

    const fetchAll = async () => {
      if (!shouldFetchPrices) return;
      mcCache.lastFetchPrices = Date.now();

      // Quotes
      setQuotes((p: any) => ({ ...p, loading: true }));
      try {
        const qData = await getMissionControlMarketOverview();
        setQuotes({ data: qData, loading: false, error: null, updatedAt: Date.now() });

        // Fetch sparklines in parallel for the newly loaded quotes
        const finD = new Date();
        const iniD = new Date();
        iniD.setDate(finD.getDate() - 30); // 30 days
        const finStr = `${finD.getFullYear()}-${String(finD.getMonth() + 1).padStart(2, '0')}-${String(finD.getDate()).padStart(2, '0')}T23:59:59`;
        const iniStr = `${iniD.getFullYear()}-${String(iniD.getMonth() + 1).padStart(2, '0')}-${String(iniD.getDate()).padStart(2, '0')}T00:00:00`;

        const sparklinePromises = qData.map(async (q) => {
          try {
            const hist = await getPreciosRango(q.simbolo, iniStr, finStr);
            const validHist = hist.filter(p => !isNaN(Number(p.close)));
            return {
              simbolo: q.simbolo,
              spark: validHist.slice(-20).map(p => Number(p.close)),
              hist: validHist.map(p => ({ fecha: p.fecha.split('T')[0], close: Number(p.close) })).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
            };
          } catch {
            return { simbolo: q.simbolo, spark: [], hist: [] };
          }
        });
        Promise.all(sparklinePromises).then(results => {
          const sm: Record<string, number[]> = {};
          const hd: Record<string, { fecha: string, close: number }[]> = {};
          results.forEach(r => { sm[r.simbolo] = r.spark; hd[r.simbolo] = r.hist; });
          setSparklines((prev: any) => ({ ...prev, ...sm }));
          setHistoricalData((prev: any) => ({ ...prev, ...hd }));
        });
      } catch {
        setQuotes((p: any) => ({ ...p, loading: false, error: 'MS2 ERR' }));
      }
      // News
      setNews((p: any) => ({ ...p, loading: true }));
      try {
        const nData = await getMissionControlNewsPulse();
        setNews({ data: nData, loading: false, error: null, updatedAt: Date.now() });
      } catch {
        setNews((p: any) => ({ ...p, loading: false, error: 'MS3 ERR' }));
      }
    };

    const fetchSignalsOnce = async () => {
      if (mcCache.hasFetchedSignals) return;

      setSignals((p: any) => ({ ...p, loading: true }));
      try {
        const sData = await getMissionControlSignals();
        setSignals({ data: sData, loading: false, error: null, updatedAt: Date.now() });
        mcCache.hasFetchedSignals = true;
      } catch {
        setSignals((p: any) => ({ ...p, loading: false, error: 'MS4 ERR' }));
      }
    };

    const fetchExternal = async () => {
      if (!shouldFetchExternal) return;
      mcCache.lastFetchExternal = Date.now();

      setMacroCalendar((p: any) => ({ ...p, loading: true }));
      getMacroCalendar()
        .then(data => setMacroCalendar({ data, loading: false, error: null, updatedAt: Date.now() }))
        .catch(err => setMacroCalendar((p: any) => ({ ...p, loading: false, error: 'FINNHUB ERR' })));

      setMarketStatus((p: any) => ({ ...p, loading: true }));
      getMarketStatus()
        .then(data => setMarketStatus({ data, loading: false, error: null, updatedAt: Date.now() }))
        .catch(err => setMarketStatus((p: any) => ({ ...p, loading: false, error: 'POLYGON ERR' })));

      setBreakingNews((p: any) => ({ ...p, loading: true }));
      getBreakingNews()
        .then(data => setBreakingNews({ data, loading: false, error: null, updatedAt: Date.now() }))
        .catch(err => setBreakingNews((p: any) => ({ ...p, loading: false, error: 'FEED ERR' })));

      setTopMovers((p: any) => ({ ...p, loading: true }));
      getTopMovers()
        .then(data => setTopMovers({ data, loading: false, error: null, updatedAt: Date.now() }))
        .catch(err => setTopMovers((p: any) => ({ ...p, loading: false, error: 'ALPHAV ERR' })));
    };

    void fetchAll();
    void fetchSignalsOnce();
    void fetchExternal();
  }, []);

  const signalBySymbol = useMemo(() => new Map(signals.data.map((s) => [s.simbolo, s])), [signals.data]);

  return (
    <div className="flex min-h-full flex-col bg-black text-amber-500 font-mono text-[11px] leading-tight uppercase selection:bg-amber-500 selection:text-black">

      {/* 1. MARKET RIBBON (Franja Superior) */}
      <div className="shrink-0 border-b border-amber-600/30">
        <div className="flex flex-col sm:flex-row sm:items-center px-3 py-2 bg-amber-900/10 gap-1 sm:gap-0">
          {/* Mobile: title centrado arriba; Desktop: izq/centro/der */}
          <div className="flex flex-col items-center sm:hidden">
            <h1 className="text-lg font-bold text-amber-400 tracking-widest">MISSION CONTROL</h1>
            <span className={cn("font-bold text-xs tracking-widest", marketSession.accent)}>{marketSession.label}</span>
          </div>
          {/* Left: Market Status */}
          <div className="flex gap-3 text-[10px] text-amber-600 sm:w-1/3 justify-center sm:justify-start">
            <span>NY: <span className="text-amber-200">{marketSession.clock}</span></span>
            <span className="hidden xs:inline">PRC: <span className="text-amber-200">{PRICE_REFRESH_MS / 1000}S</span></span>
            <span className="hidden xs:inline">EXT: <span className="text-amber-200">{EXTERNAL_API_REFRESH_MS / 1000}S</span></span>
          </div>
          {/* Center: Title (solo desktop) */}
          <div className="hidden sm:flex flex-col items-center flex-1">
            <h1 className="text-xl font-bold text-amber-400 tracking-widest">MISSION CONTROL</h1>
            <span className={cn("font-bold text-xs tracking-widest", marketSession.accent)}>{marketSession.label}</span>
          </div>
          {/* Right: Signal Summary */}
          <div className="flex gap-3 text-[10px] sm:w-1/3 justify-center sm:justify-end">
            <span className="text-emerald-500 font-bold">
              ▲ {signals.data.filter(s => s.senal === 'Compra').length} <span className="text-amber-600 font-normal">BUY</span>
            </span>
            <span className="text-amber-500 font-bold">
              ● {signals.data.filter(s => s.senal === 'Mantener' || s.senal === 'Sin datos suficientes').length} <span className="text-amber-600 font-normal">HOLD</span>
            </span>
            <span className="text-red-500 font-bold">
              ▼ {signals.data.filter(s => s.senal === 'Venta').length} <span className="text-amber-600 font-normal">SELL</span>
            </span>
          </div>
        </div>

        {/* Ticker Tape Animado */}
        <div className="overflow-hidden whitespace-nowrap bg-black py-1 border-t border-amber-600/20">
          <div className="inline-block animate-scroll">
            {(quotes.data.length > 0 ? [...quotes.data, ...quotes.data, ...quotes.data] : MISSION_CONTROL_SYMBOLS).map((q, i) => {
              const quote = q as MissionControlQuote;
              const positive = (quote.variacion ?? 0) >= 0;
              return (
                <span key={`${q.simbolo}-${i}`} className="inline-flex items-center gap-2 mx-4">
                  <span className="font-bold text-amber-300">{q.simbolo}</span>
                  <span className="text-amber-100">{quote.precio ? formatPrice(quote.precio) : '---'}</span>
                  <span className={cn("font-bold", positive ? "text-emerald-500" : "text-red-500")}>
                    {quote.variacion !== undefined ? formatPercent(quote.variacion) : '--'}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Layout: Core Grid + Alert Rail */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col lg:flex-row gap-2">

        {/* 2. CORE GRID (Franja Central) */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">

          {/* Main Chart (Terminal Style - Premium UI) */}
          <PanelShell title={`${selectedSymbol} 30D CHART`} kicker="PRICE HISTORY" className="h-[200px] sm:h-[250px] shrink-0 relative overflow-hidden">
            {quotes.loading && !historicalData[selectedSymbol] ? <PanelPlaceholder /> : (
              <div className="w-full h-full p-2 relative">
                {/* Floating Price Badge (Horizon style) */}
                <div className="absolute top-2 left-4 z-10 border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 backdrop-blur-sm rounded-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{selectedSymbol}</span>
                    <span className="text-lg font-bold text-amber-100">
                      {quotes.data.find(q => q.simbolo === selectedSymbol)?.precio ? `$${formatPrice(quotes.data.find(q => q.simbolo === selectedSymbol)?.precio!)}` : '---'}
                    </span>
                    <span className={cn("text-[10px] font-bold",
                      (quotes.data.find(q => q.simbolo === selectedSymbol)?.variacion ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {formatPercent(quotes.data.find(q => q.simbolo === selectedSymbol)?.variacion ?? null)}
                    </span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData[selectedSymbol] || []} margin={{ top: 40, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmberGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#78350f" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="fecha" stroke="#78350f" tick={{ fill: '#fbbf24', fontSize: 9, fontFamily: 'monospace' }} tickFormatter={val => val.slice(5)} tickLine={false} axisLine={false} minTickGap={40} />
                    <YAxis domain={['auto', 'auto']} stroke="#78350f" tick={{ fill: '#fbbf24', fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={val => Number(val).toFixed(2)} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '4px', color: '#fffbeb', fontFamily: 'monospace', fontSize: 10, backdropFilter: 'blur(4px)' }}
                      itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                      labelStyle={{ color: '#d97706' }}
                      cursor={{ stroke: 'rgba(245, 158, 11, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmberGlow)"
                      isAnimationActive={true}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </PanelShell>

          {/* Market Overview */}
          <PanelShell title="MARKET OVERVIEW" kicker="LIVE QUOTES" className="flex-1 min-h-[180px] sm:min-h-[250px]">
            {quotes.error && quotes.data.length === 0 ? <PanelError message={quotes.error} /> :
              quotes.loading && quotes.data.length === 0 ? <PanelPlaceholder /> : (
                <table className="w-full text-left table-fixed">
                  <thead className="sticky top-0 bg-black text-amber-600 border-b border-amber-600/30 z-10">
                    <tr>
                      <th className="font-normal py-1 w-16">SYM</th>
                      <th className="font-normal py-1 hidden sm:table-cell">COMPANY</th>
                      <th className="font-normal py-1 w-20">7D TREND</th>
                      <th className="font-normal py-1 text-right">LAST</th>
                      <th className="font-normal py-1 text-right">CHG%</th>
                      <th className="font-normal py-1 text-right hidden sm:table-cell">VOL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.data.map(q => {
                      const positive = (q.variacion ?? 0) >= 0;
                      const sparkData = sparklines[q.simbolo] || [];
                      const isSelected = selectedSymbol === q.simbolo;
                      return (
                        <tr
                          key={q.simbolo}
                          onClick={() => setSelectedSymbol(q.simbolo)}
                          className={cn(
                            "cursor-pointer border-b border-amber-600/10 transition-colors",
                            isSelected ? "bg-amber-900/40 border-amber-500/50" : "hover:bg-amber-900/20"
                          )}
                        >
                          <td className="py-1.5 text-amber-200 font-bold">{q.simbolo}</td>
                          <td className="py-1.5 text-amber-600 truncate hidden sm:table-cell pr-2">{q.nombre}</td>
                          <td className="py-1.5">
                            <MinimalSparkline data={sparkData} positive={positive} />
                          </td>
                          <td className="py-1.5 text-right text-amber-100">{formatPrice(q.precio)}</td>
                          <td className={cn("py-1.5 text-right", positive ? "text-emerald-500" : "text-red-500")}>
                            {formatPercent(q.variacion)}
                          </td>
                          <td className="py-1.5 text-right text-amber-600 hidden sm:table-cell">{formatCompactNumber(q.volumen)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </PanelShell>

          {/* Bottom Core Grid (Sectors, Trends, Flow) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 h-auto sm:h-[220px] shrink-0 [&>*]:min-h-[160px] sm:[&>*]:min-h-0">
            <PanelShell title="GLOBAL HEADLINES" kicker="FINANCIAL FEED">
              {breakingNews.error && breakingNews.data.length === 0 ? <PanelError message={breakingNews.error} /> :
                breakingNews.loading && breakingNews.data.length === 0 ? <PanelPlaceholder /> :
                  breakingNews.data.length === 0 ? <div className="text-amber-600 p-2">NO HEADLINES</div> : (
                    <div className="flex flex-col gap-2">
                      {breakingNews.data.slice(0, 4).map((article, idx) => (
                        <div key={idx} className="border-l-2 border-amber-500 pl-1.5 flex flex-col gap-0.5">
                          <span className="text-amber-600 text-[9px] uppercase">{article.source}</span>
                          <a href={article.url} target="_blank" rel="noreferrer" className="text-amber-100 hover:text-white line-clamp-1 leading-tight">
                            {article.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
            </PanelShell>

            <PanelShell title="MACRO CALENDAR" kicker="FINNHUB">
              {macroCalendar.error && macroCalendar.data.length === 0 ? <PanelError message={macroCalendar.error} /> :
                macroCalendar.loading && macroCalendar.data.length === 0 ? <PanelPlaceholder /> :
                  macroCalendar.data.length === 0 ? <div className="text-amber-600 p-2">NO EVENTS</div> : (
                    <div className="flex flex-col gap-1.5">
                      {macroCalendar.data.slice(0, 5).map((e, idx) => (
                        <div key={idx} className="flex flex-col border-b border-amber-600/10 pb-1">
                          <div className="flex justify-between items-center">
                            <span className="text-amber-200 font-bold truncate pr-1">{e.country} <span className="font-normal text-amber-600">- {e.time ? e.time.split(' ')[1] : ''}</span></span>
                            <span className={cn("text-[9px] px-1", e.impact === 'High' ? 'bg-red-950 text-red-400' : 'bg-amber-900/20 text-amber-500')}>{e.impact}</span>
                          </div>
                          <span className="text-amber-600 text-[10px] truncate">{e.event}</span>
                        </div>
                      ))}
                    </div>
                  )}
            </PanelShell>

            <PanelShell title="GLOBAL EXCHANGES" kicker="POLYGON.IO">
              {marketStatus.error && !marketStatus.data ? <PanelError message={marketStatus.error} /> :
                marketStatus.loading && !marketStatus.data ? <PanelPlaceholder /> :
                  !marketStatus.data ? <div className="text-amber-600 p-2">NO DATA</div> : (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                        <span className="text-amber-200 font-bold">STATUS</span>
                        <span className={cn(marketStatus.data.market === 'open' ? "text-emerald-500" : "text-amber-500")}>
                          {marketStatus.data.market.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                        <span className="text-amber-200 font-bold">NYSE</span>
                        <span className={cn(marketStatus.data.exchanges.nyse === 'open' ? "text-emerald-500" : "text-amber-500")}>
                          {marketStatus.data.exchanges.nyse.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                        <span className="text-amber-200 font-bold">NASDAQ</span>
                        <span className={cn(marketStatus.data.exchanges.nasdaq === 'open' ? "text-emerald-500" : "text-amber-500")}>
                          {marketStatus.data.exchanges.nasdaq.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                        <span className="text-amber-200 font-bold">OTC</span>
                        <span className={cn(marketStatus.data.exchanges.otc === 'open' ? "text-emerald-500" : "text-amber-500")}>
                          {marketStatus.data.exchanges.otc.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
            </PanelShell>
          </div>
        </div>

        {/* 3. ALERT RAIL (Franja Lateral) */}
        <div className="w-full lg:w-[320px] flex flex-col gap-2 shrink-0">

          <PanelShell title="SIGNAL BOARD" kicker="AI SIGNALS" className="flex-1 min-h-[220px] sm:min-h-[300px]">
            {signals.error && signals.data.length === 0 ? <PanelError message={signals.error} /> :
              signals.loading && signals.data.length === 0 ? <PanelPlaceholder /> : (
                <div className="flex flex-col gap-2">
                  {signals.data.map(s => {
                    const buy = s.senal === 'Compra';
                    const sell = s.senal === 'Venta';
                    const noData = s.senal === 'Sin datos suficientes';
                    const pCol = buy ? 'text-emerald-500' : sell ? 'text-red-500' : 'text-amber-500';

                    return (
                      <div key={s.simbolo} className="border border-amber-600/30 p-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-amber-200">{s.simbolo}</span>
                          <span className={cn("px-1", buy ? "bg-emerald-950 text-emerald-400" : sell ? "bg-red-950 text-red-400" : "bg-amber-900/20 text-amber-500")}>
                            {noData ? 'NO DATA' : s.senal}
                          </span>
                        </div>
                        {!noData && (
                          <div className="grid grid-cols-2 gap-1 mb-1">
                            <div className="text-amber-600">CONF: <span className={cn("font-bold", pCol)}>{s.confianza}%</span></div>
                            <div className="text-amber-600">SENT: <span className="text-amber-100">{s.sentimiento}</span></div>
                          </div>
                        )}
                        <div className="text-amber-600 leading-tight">{s.mensaje}</div>
                      </div>
                    );
                  })}
                </div>
              )}
          </PanelShell>

          <PanelShell title="GLOBAL TOP MOVERS" kicker="ALPHAVANTAGE" className="h-[180px] sm:h-[200px] shrink-0">
            {topMovers.error && topMovers.data.gainers.length === 0 ? <PanelError message={topMovers.error} /> :
              topMovers.loading && topMovers.data.gainers.length === 0 ? <PanelPlaceholder /> : (
                <div className="flex flex-col gap-1.5">
                  {topMovers.data.gainers.slice(0, 3).map((g) => (
                    <div key={g.ticker} className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                      <span className="text-amber-200 truncate pr-2 font-bold">{g.ticker}</span>
                      <span className="text-emerald-500">{g.changePercentage}</span>
                    </div>
                  ))}
                  {topMovers.data.losers.slice(0, 3).map((l) => (
                    <div key={l.ticker} className="flex justify-between items-center border-b border-amber-600/10 pb-0.5">
                      <span className="text-amber-200 truncate pr-2 font-bold">{l.ticker}</span>
                      <span className="text-red-500">{l.changePercentage}</span>
                    </div>
                  ))}
                </div>
              )}
          </PanelShell>

          <PanelShell title="NEWS PULSE" kicker="SENTIMENT FEED" className="h-[220px] sm:h-[250px] shrink-0">
            {news.error && news.data.length === 0 ? <PanelError message={news.error} /> :
              news.loading && news.data.length === 0 ? <PanelPlaceholder /> : (
                <div className="flex flex-col gap-2">
                  {news.data.map(item => {
                    const bullish = item.sentimiento === 'Bullish';
                    const bearish = item.sentimiento === 'Bearish';
                    return (
                      <div key={item._id} className="border-b border-amber-600/10 pb-1.5">
                        <div className="flex gap-2 items-center mb-0.5">
                          <span className={cn(
                            "font-bold",
                            bullish ? "text-emerald-500" :
                              bearish ? "text-red-500" :
                                "text-amber-200"
                          )}>
                            {item.simbolo}
                          </span>
                          <span className="text-amber-600">{new Date(item.fechaPublicacion).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <a href={item.url || '#'} target="_blank" rel="noreferrer" className="text-amber-100 hover:text-white line-clamp-2">
                          {item.titulo}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
          </PanelShell>

        </div>
      </div>
    </div>
  );
};
