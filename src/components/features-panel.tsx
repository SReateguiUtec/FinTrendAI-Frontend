'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureItem {
  title: string;
  description: string;
  content: React.ReactNode;
}

// ── Visual: Prediction Chart ──────────────────────────────────────────────────
function PredictionChartVisual() {
  const history = [42, 47, 44, 51, 49, 55, 53, 60, 57, 63];
  const prediction = [63, 68, 72, 76, 79, 83];
  const allPoints = [...history, ...prediction];
  const min = Math.min(...allPoints) - 4;
  const max = Math.max(...allPoints) + 4;
  const W = 340;
  const H = 160;
  const totalPoints = history.length + prediction.length - 1;

  const toX = (i: number) => (i / (totalPoints - 1)) * W;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;

  const historyPath = history
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
    .join(' ');

  const predPath = prediction
    .map((v, i) => {
      const xi = history.length - 1 + i;
      return `${i === 0 ? 'M' : 'L'}${toX(xi).toFixed(1)},${toY(v).toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `${historyPath} L${toX(history.length - 1).toFixed(1)},${H} L0,${H} Z`;
  const lastX = toX(history.length - 1);
  const lastY = toY(history[history.length - 1]);

  return (
    <div className='w-full h-full bg-[#0a0a0a] flex flex-col p-5 gap-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-[10px] text-zinc-500 uppercase tracking-widest'>AAPL • Apple Inc.</p>
          <p className='text-2xl font-black text-white'>$183.42</p>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <span className='text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20'>
            ↑ +4.7% predicho
          </span>
          <span className='text-[10px] text-zinc-500'>confianza 94.2%</span>
        </div>
      </div>

      <div className='relative flex-1'>
        <svg width='100%' viewBox={`0 0 ${W} ${H}`} preserveAspectRatio='none' className='overflow-visible'>
          <defs>
            <linearGradient id='areaGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#D4AF37' stopOpacity='0.18' />
              <stop offset='100%' stopColor='#D4AF37' stopOpacity='0' />
            </linearGradient>
            <linearGradient id='predGrad' x1='0' y1='0' x2='1' y2='0'>
              <stop offset='0%' stopColor='#D4AF37' stopOpacity='0.5' />
              <stop offset='100%' stopColor='#D4AF37' stopOpacity='1' />
            </linearGradient>
          </defs>
          {/* grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1='0' y1={H * t} x2={W} y2={H * t} stroke='#ffffff08' strokeWidth='1' />
          ))}
          {/* area fill */}
          <path d={areaPath} fill='url(#areaGrad)' />
          {/* history line */}
          <path d={historyPath} fill='none' stroke='#ffffff55' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          {/* prediction dashed */}
          <path d={predPath} fill='none' stroke='url(#predGrad)' strokeWidth='2.5' strokeDasharray='6 4' strokeLinecap='round' strokeLinejoin='round' />
          {/* divider */}
          <line x1={lastX} y1='0' x2={lastX} y2={H} stroke='#D4AF3740' strokeWidth='1' strokeDasharray='3 3' />
          {/* current dot */}
          <circle cx={lastX} cy={lastY} r='5' fill='#D4AF37' />
          <circle cx={lastX} cy={lastY} r='9' fill='#D4AF3722' />
        </svg>

        <div className='absolute bottom-0 right-0 flex gap-3 text-[9px] text-zinc-500'>
          <span className='flex items-center gap-1'><span className='w-4 h-px bg-zinc-500 inline-block' />Histórico</span>
          <span className='flex items-center gap-1'><span className='w-4 h-px border-t-2 border-dashed border-[#D4AF37] inline-block' />Predicción IA</span>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2'>
        {[{ l: 'Mín. 7d', v: '$178.10' }, { l: 'Máx. 7d', v: '$185.80' }, { l: 'Objetivo', v: '$191.50' }].map((s) => (
          <div key={s.l} className='bg-white/[0.03] rounded-lg p-2 text-center border border-white/[0.06]'>
            <p className='text-[9px] text-zinc-500'>{s.l}</p>
            <p className='text-xs font-bold text-white'>{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Visual: Real-time Feed ────────────────────────────────────────────────────
function RealtimeFeedVisual() {
  const tickers = [
    { sym: 'TSLA', name: 'Tesla', price: '248.73', chg: '+2.14%', pos: true },
    { sym: 'NVDA', name: 'NVIDIA', price: '891.20', chg: '+5.82%', pos: true },
    { sym: 'AMZN', name: 'Amazon', price: '185.61', chg: '-0.73%', pos: false },
    { sym: 'MSFT', name: 'Microsoft', price: '420.55', chg: '+1.22%', pos: true },
    { sym: 'META', name: 'Meta', price: '520.30', chg: '-1.05%', pos: false },
  ];

  return (
    <div className='w-full h-full bg-[#0a0a0a] flex flex-col p-5 gap-3'>
      <div className='flex items-center justify-between'>
        <p className='text-[10px] text-zinc-500 uppercase tracking-widest'>Mercado en vivo</p>
        <span className='flex items-center gap-1.5 text-[10px] text-emerald-400'>
          <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
          LIVE
        </span>
      </div>

      <div className='flex flex-col gap-1.5'>
        {tickers.map((t, i) => (
          <motion.div
            key={t.sym}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className='flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg px-3 py-2.5 border border-white/[0.05] transition-colors cursor-default'
          >
            <div className='size-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/15 shrink-0'>
              <span className='text-[9px] font-black text-[#D4AF37]'>{t.sym.slice(0, 2)}</span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-bold text-white'>{t.sym}</p>
              <p className='text-[9px] text-zinc-500 truncate'>{t.name}</p>
            </div>
            <div className='text-right shrink-0'>
              <p className='text-xs font-bold text-white'>${t.price}</p>
              <p className={cn('text-[9px] font-medium', t.pos ? 'text-emerald-400' : 'text-red-400')}>{t.chg}</p>
            </div>
            <div className={cn('w-14 h-6 shrink-0', t.pos ? 'opacity-70' : 'opacity-70')}>
              <svg viewBox='0 0 56 24' className='w-full h-full'>
                {t.pos
                  ? <polyline points='0,20 10,16 20,18 30,10 40,8 56,3' fill='none' stroke='#34d399' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                  : <polyline points='0,4 10,8 20,6 30,12 40,16 56,20' fill='none' stroke='#f87171' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                }
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Visual: AI Chatbot ────────────────────────────────────────────────────────
function ChatbotVisual() {
  const messages = [
    { role: 'user', text: '¿Cómo está NVIDIA esta semana?' },
    { role: 'ai', text: 'NVDA subió +5.82% esta semana impulsada por resultados de data centers. La IA prevé continuación alcista con 91% de confianza hasta $920 en los próximos 5 días.' },
    { role: 'user', text: '¿Debo comprar ahora?' },
    { role: 'ai', text: 'Señal de entrada favorable. RSI en 62, volumen 18% sobre su media. Objetivo: $935 · Stop: $872.' },
  ];

  return (
    <div className='w-full h-full bg-[#0a0a0a] flex flex-col p-5 gap-3'>
      <div className='flex items-center gap-2 mb-1'>
        <div className='size-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8962e] flex items-center justify-center'>
          <span className='text-[9px] font-black text-black'>FT</span>
        </div>
        <div>
          <p className='text-xs font-bold text-white'>FinTrend AI</p>
          <p className='text-[9px] text-zinc-500'>Asistente financiero</p>
        </div>
        <span className='ml-auto flex items-center gap-1 text-[9px] text-emerald-400'>
          <span className='size-1.5 rounded-full bg-emerald-400' />en línea
        </span>
      </div>

      <div className='flex flex-col gap-2 flex-1 overflow-hidden'>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.3 }}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div className={cn(
              'max-w-[82%] rounded-2xl px-3 py-2 text-[10px] leading-relaxed',
              m.role === 'user'
                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 rounded-br-sm'
                : 'bg-white/[0.05] text-zinc-300 border border-white/[0.07] rounded-bl-sm',
            )}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div className='flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.08] mt-1'>
        <span className='text-[10px] text-zinc-600 flex-1'>Pregunta sobre cualquier acción…</span>
        <div className='size-5 rounded-full bg-[#D4AF37] flex items-center justify-center'>
          <svg viewBox='0 0 10 10' className='w-2.5 h-2.5'><path d='M2 8L8 5 2 2V5.5L6 5 2 4.5V8Z' fill='black' /></svg>
        </div>
      </div>
    </div>
  );
}

// ── Visual: Smart Alerts ──────────────────────────────────────────────────────
function AlertsVisual() {
  const alerts = [
    { sym: 'TSLA', msg: 'Cruzó resistencia en $250 · señal alcista', type: 'buy', time: 'hace 2m' },
    { sym: 'AMZN', msg: 'Volumen inusual detectado: +340% sobre media', type: 'info', time: 'hace 8m' },
    { sym: 'AAPL', msg: 'Objetivo de precio alcanzado: $183.42', type: 'target', time: 'hace 15m' },
    { sym: 'MSFT', msg: 'RSI en sobrecompra (78) · evalúa toma de ganancias', type: 'warn', time: 'hace 22m' },
  ];

  const typeStyles: Record<string, { dot: string; border: string; badge: string; label: string }> = {
    buy: { dot: 'bg-emerald-400', border: 'border-emerald-400/20', badge: 'bg-emerald-400/10 text-emerald-400', label: 'COMPRA' },
    info: { dot: 'bg-[#D4AF37]', border: 'border-[#D4AF37]/20', badge: 'bg-[#D4AF37]/10 text-[#D4AF37]', label: 'VOLUMEN' },
    target: { dot: 'bg-blue-400', border: 'border-blue-400/20', badge: 'bg-blue-400/10 text-blue-400', label: 'OBJETIVO' },
    warn: { dot: 'bg-orange-400', border: 'border-orange-400/20', badge: 'bg-orange-400/10 text-orange-400', label: 'ALERTA' },
  };

  return (
    <div className='w-full h-full bg-[#0a0a0a] flex flex-col p-5 gap-3'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-[10px] text-zinc-500 uppercase tracking-widest'>Centro de alertas</p>
          <p className='text-lg font-black text-white'>4 <span className='text-sm font-normal text-zinc-400'>nuevas hoy</span></p>
        </div>
        <div className='size-8 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center'>
          <svg viewBox='0 0 16 16' className='w-4 h-4' fill='none'>
            <path d='M8 2C5.8 2 4 3.8 4 6v3l-1.5 2h11L12 9V6c0-2.2-1.8-4-4-4z' stroke='#D4AF37' strokeWidth='1.2' strokeLinejoin='round' />
            <path d='M6.5 13.5a1.5 1.5 0 003 0' stroke='#D4AF37' strokeWidth='1.2' strokeLinecap='round' />
          </svg>
        </div>
      </div>

      <div className='flex flex-col gap-2 flex-1'>
        {alerts.map((a, i) => {
          const s = typeStyles[a.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={cn('flex gap-3 rounded-xl p-3 bg-white/[0.03] border', s.border)}
            >
              <div className='flex flex-col items-center gap-1 pt-0.5'>
                <span className={cn('size-2 rounded-full shrink-0', s.dot)} />
                {i < alerts.length - 1 && <span className='w-px flex-1 bg-white/[0.06]' />}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <span className='text-xs font-black text-white'>{a.sym}</span>
                  <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded-full', s.badge)}>{s.label}</span>
                  <span className='text-[9px] text-zinc-600 ml-auto'>{a.time}</span>
                </div>
                <p className='text-[10px] text-zinc-400 leading-relaxed'>{a.msg}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Feature Items ─────────────────────────────────────────────────────────────
const items: FeatureItem[] = [
  {
    title: 'Predicciones con IA en tiempo real.',
    description: 'Modelos de machine learning analizan patrones históricos, sentimiento de mercado y datos macroeconómicos para proyectar el precio de cada acción con alta precisión.',
    content: <PredictionChartVisual />,
  },
  {
    title: 'Monitoreo de mercado en vivo.',
    description: 'Datos de cotización actualizados al instante para más de 150 compañías. Visualiza movimientos, volumen y tendencias sin refrescar la página.',
    content: <RealtimeFeedVisual />,
  },
  {
    title: 'Chatbot financiero potenciado por IA.',
    description: 'Consulta cualquier acción en lenguaje natural. El asistente responde con análisis técnico, señales de entrada/salida y contexto fundamental al instante.',
    content: <ChatbotVisual />,
  },
  {
    title: 'Alertas inteligentes personalizadas.',
    description: 'Recibe notificaciones cuando una acción alcanza tu precio objetivo, detecta volumen inusual o activa una señal técnica relevante para tu portafolio.',
    content: <AlertsVisual />,
  },
];

export default function FeaturesWithPanel() {
  const [active, setActive] = React.useState(0);

  return (
    <section id='features' className='relative w-full scroll-mt-28 py-24'>
      <div className='mx-auto max-w-6xl px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-16 lg:items-start'>
          <div>
            <h2 className='text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl mb-10'>
              Features.
            </h2>
            <ul className='flex flex-col gap-1'>
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.07,
                    ease: 'easeOut',
                  }}
                  onClick={() => setActive(index)}
                  className={cn(
                    'flex flex-col px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 lg:flex-row lg:items-start lg:gap-4',
                    active === index
                      ? 'ring-1 ring-foreground'
                      : 'ring-1 ring-transparent',
                  )}
                >
                  <div className='flex flex-row items-center gap-4 w-full lg:contents'>
                    <span
                      className={cn(
                        'size-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors duration-200 mt-0.5',
                        active === index
                          ? 'bg-foreground text-background'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className='flex flex-col gap-0.5'>
                      <span
                        className={cn(
                          'text-sm font-medium transition-colors duration-200',
                          active === index
                            ? 'text-foreground'
                            : 'text-muted-foreground',
                        )}
                      >
                        {item.title}
                      </span>
                      {active === index && (
                        <motion.span
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className='text-xs text-muted-foreground leading-relaxed hidden lg:block'
                        >
                          {item.description}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {active === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                        className='w-full overflow-hidden lg:hidden'
                      >
                        <Card className='w-full mt-3 overflow-hidden p-0 gap-0 aspect-[4/3] relative'>
                          <div className='absolute inset-0'>
                            {item.content}
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className='hidden lg:block sticky top-10'>
            <Card className='relative w-full aspect-[4/3] overflow-hidden p-0 gap-0'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className='absolute inset-0'
                >
                  {items[active].content}
                </motion.div>
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
