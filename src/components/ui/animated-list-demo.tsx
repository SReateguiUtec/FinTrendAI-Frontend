"use client"

import { AnimatedList } from "@/components/ui/animated-list"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertCircle, Target, Bell } from "lucide-react"

interface Item {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  time: string
}

let notifications = [
  {
    name: "Señal de Compra",
    description: "NVDA cruzó resistencia en $875",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "#10b981",
    time: "Ahora",
  },
  {
    name: "Alerta de Volumen",
    description: "TSLA: +420% sobre media",
    icon: <Bell className="h-4 w-4" />,
    color: "#D4AF37",
    time: "hace 2m",
  },
  {
    name: "Objetivo Alcanzado",
    description: "AAPL tocó $183.50",
    icon: <Target className="h-4 w-4" />,
    color: "#3b82f6",
    time: "hace 5m",
  },
  {
    name: "Señal de Venta",
    description: "MSFT: RSI sobrecompra (78)",
    icon: <TrendingDown className="h-4 w-4" />,
    color: "#ef4444",
    time: "hace 8m",
  },
  {
    name: "Alerta de Mercado",
    description: "S&P 500: ruptura alcista",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "#8b5cf6",
    time: "hace 12m",
  },
]

notifications = Array.from({ length: 10 }, () => notifications).flat()

function Notification({ name, description, icon, color, time }: Item) {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white/[0.03] border border-white/[0.08]",
        "hover:bg-white/[0.06] hover:border-white/[0.12]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }} className="flex items-center justify-center">
            {icon}
          </span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-sm font-medium text-white">
            <span className="text-xs sm:text-sm">{name}</span>
            <span className="mx-1 text-zinc-500">·</span>
            <span className="text-xs text-zinc-500">{time}</span>
          </figcaption>
          <p className="text-xs font-normal text-zinc-400 truncate">
            {description}
          </p>
        </div>
      </div>
    </figure>
  )
}

export default function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-6",
        className
      )}
    >
      <AnimatedList delay={2000}>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
    </div>
  )
}
