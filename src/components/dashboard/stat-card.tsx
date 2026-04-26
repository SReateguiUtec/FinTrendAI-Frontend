import React from 'react';
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  subValue?: string;
  /** Clases del titular principal (por defecto text-2xl; usar text-base + wrap para listas largas) */
  valueClassName?: string;
}

export const StatCard = ({
  label,
  value,
  change,
  trend,
  icon: Icon,
  subValue,
  valueClassName,
}: StatCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/30 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Icon className="size-24" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/20 transition-all">
          <Icon className="size-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {change}
        </div>
      </div>

      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
        <h3
          className={cn(
            'font-bold text-white tracking-tight',
            valueClassName ?? 'text-2xl',
          )}
        >
          {value}
        </h3>
        {subValue && (
          <p className="text-xs text-zinc-600 mt-1 font-medium">{subValue}</p>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};
