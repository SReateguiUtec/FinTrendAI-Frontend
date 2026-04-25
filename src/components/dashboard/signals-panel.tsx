import React from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const signals = [
  { symbol: 'AAPL', type: 'Compra', confidence: 92, price: '$189.43', change: '+1.2%' },
  { symbol: 'TSLA', type: 'Venta', confidence: 85, price: '$176.54', change: '-2.4%' },
  { symbol: 'MSFT', type: 'Mantener', confidence: 78, price: '$412.32', change: '+0.4%' },
  { symbol: 'NVDA', type: 'Compra', confidence: 95, price: '$824.59', change: '+3.1%' },
];

export const SignalsPanel = () => {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
            <Zap className="size-4 fill-current" />
          </div>
          <h3 className="font-bold text-white">Señales IA</h3>
        </div>
        <button className="text-xs text-zinc-500 hover:text-[#D4AF37] transition-colors font-bold uppercase tracking-wider">Ver todas</button>
      </div>

      <div className="space-y-4">
        {signals.map((signal, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={signal.symbol} 
            className="flex gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="size-10 shrink-0 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:border-[#D4AF37]/50 transition-colors">
              {signal.symbol.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-bold text-white truncate">{signal.symbol}</p>
                <p className="text-sm font-bold text-white tabular-nums shrink-0">{signal.price}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] font-bold uppercase shrink-0',
                    signal.type === 'Compra'
                      ? 'text-emerald-500'
                      : signal.type === 'Venta'
                        ? 'text-red-500'
                        : 'text-zinc-500'
                  )}
                >
                  {signal.type === 'Compra' && <ArrowUpRight className="size-2.5 shrink-0" />}
                  {signal.type === 'Venta' && <ArrowDownRight className="size-2.5 shrink-0" />}
                  {signal.type === 'Mantener' && <Minus className="size-2.5 shrink-0" />}
                  <span>{signal.type}</span>
                </div>
                <div className="flex items-center justify-end gap-2 min-w-0">
                  <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                    Confianza
                  </span>
                  <div className="h-1 w-14 sm:w-16 max-w-[40vw] bg-white/10 rounded-full overflow-hidden shrink">
                    <div
                      className="h-full bg-[#D4AF37]"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#D4AF37] tabular-nums shrink-0">
                    {signal.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
