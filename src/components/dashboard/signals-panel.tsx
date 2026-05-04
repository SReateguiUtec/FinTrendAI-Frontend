import React from 'react';
import { Zap, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const signals = [
  { symbol: 'AAPL', type: 'Compra', confidence: 92, price: '$189.43', change: '+1.2%' },
  { symbol: 'TSLA', type: 'Venta', confidence: 85, price: '$176.54', change: '-2.4%' },
  { symbol: 'MSFT', type: 'Mantener', confidence: 78, price: '$412.32', change: '+0.4%' },
  { symbol: 'NVDA', type: 'Compra', confidence: 95, price: '$824.59', change: '+3.1%' },
  { symbol: 'GOOGL', type: 'Compra', confidence: 88, price: '$142.65', change: '+1.5%' },
  { symbol: 'AMZN', type: 'Compra', confidence: 91, price: '$178.22', change: '+2.1%' },
];

export const SignalsPanel = () => {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
          <Zap className="size-4 fill-current" />
        </div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Señales IA</h3>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-3">
        {signals.map((signal, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={signal.symbol} 
            className="flex gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="min-w-0 flex-1 space-y-2 pl-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white truncate">{signal.symbol}</p>
                <p className="text-sm font-bold text-white tabular-nums">{signal.price}</p>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div
                  className={cn(
                    'flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5',
                    signal.type === 'Compra'
                      ? 'text-emerald-500'
                      : signal.type === 'Venta'
                        ? 'text-red-500'
                        : 'text-zinc-500'
                  )}
                >
                  {signal.type === 'Compra' && <ArrowUpRight className="size-2.5" />}
                  {signal.type === 'Venta' && <ArrowDownRight className="size-2.5" />}
                  {signal.type === 'Mantener' && <Minus className="size-2.5" />}
                  <span>{signal.type}</span>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="h-1 flex-1 max-w-[60px] bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D4AF37]"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#D4AF37] tabular-nums">
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
