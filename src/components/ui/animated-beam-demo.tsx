"use client"

import { useRef } from "react"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { cn } from "@/lib/utils"
import { Newspaper, DollarSign, Users, Zap, Bell, BarChart2, TrendingUp } from "lucide-react"

function SourceCircle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-[#0a0a0a] p-2.5",
        "border-white/[0.1] text-zinc-400 shadow-[0_0_20px_-12px_rgba(255,255,255,0.1)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function LogoCircle({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-gradient-to-br from-[#D4AF37] to-[#b8962e] p-3.5",
        "border-[#D4AF37]/50 shadow-[0_0_30px_-8px_rgba(212,175,55,0.7)]",
        className
      )}
    >
      <TrendingUp className="h-full w-full text-black" strokeWidth={2.5} />
    </div>
  )
}

export default function AnimatedBeamDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const newsRef   = useRef<HTMLDivElement>(null)
  const pricesRef = useRef<HTMLDivElement>(null)
  const sentRef   = useRef<HTMLDivElement>(null)
  const ftRef     = useRef<HTMLDivElement>(null)
  const signalRef = useRef<HTMLDivElement>(null)
  const alertRef  = useRef<HTMLDivElement>(null)
  const chartRef  = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      ref={containerRef}
    >
      <div className="flex h-full w-full items-center justify-between gap-4 px-8 py-6">
        {/* Left column — Sources */}
        <div className="flex flex-col justify-between h-full py-4 gap-4">
          <div ref={newsRef}>
            <SourceCircle><Newspaper className="h-full w-full" /></SourceCircle>
          </div>
          <div ref={pricesRef}>
            <SourceCircle><DollarSign className="h-full w-full" /></SourceCircle>
          </div>
          <div ref={sentRef}>
            <SourceCircle><Users className="h-full w-full" /></SourceCircle>
          </div>
        </div>

        {/* Center — FinTrend hub */}
        <div ref={ftRef}>
          <LogoCircle />
        </div>

        {/* Right column — Outputs */}
        <div className="flex flex-col justify-between h-full py-4 gap-4">
          <div ref={signalRef}>
            <SourceCircle><Zap className="h-full w-full" /></SourceCircle>
          </div>
          <div ref={alertRef}>
            <SourceCircle><Bell className="h-full w-full" /></SourceCircle>
          </div>
          <div ref={chartRef}>
            <SourceCircle><BarChart2 className="h-full w-full" /></SourceCircle>
          </div>
        </div>
      </div>

      {/* Input beams: sources → FT */}
      <AnimatedBeam containerRef={containerRef} fromRef={newsRef}   toRef={ftRef} curvature={30}  gradientStartColor="#6b7280" gradientStopColor="#D4AF37" pathColor="#6b7280" pathOpacity={0.2} />
      <AnimatedBeam containerRef={containerRef} fromRef={pricesRef} toRef={ftRef} curvature={0}   gradientStartColor="#6b7280" gradientStopColor="#D4AF37" pathColor="#6b7280" pathOpacity={0.2} />
      <AnimatedBeam containerRef={containerRef} fromRef={sentRef}   toRef={ftRef} curvature={-30} gradientStartColor="#6b7280" gradientStopColor="#D4AF37" pathColor="#6b7280" pathOpacity={0.2} />

      {/* Output beams: FT → outputs */}
      <AnimatedBeam containerRef={containerRef} fromRef={ftRef} toRef={signalRef} curvature={30}  reverse gradientStartColor="#D4AF37" gradientStopColor="#6b7280" pathColor="#6b7280" pathOpacity={0.2} />
      <AnimatedBeam containerRef={containerRef} fromRef={ftRef} toRef={alertRef}  curvature={0}   reverse gradientStartColor="#D4AF37" gradientStopColor="#6b7280" pathColor="#6b7280" pathOpacity={0.2} />
      <AnimatedBeam containerRef={containerRef} fromRef={ftRef} toRef={chartRef}  curvature={-30} reverse gradientStartColor="#D4AF37" gradientStopColor="#6b7280" pathColor="#6b7280" pathOpacity={0.2} />
    </div>
  )
}
