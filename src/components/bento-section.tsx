"use client"

import { BentoDemo } from "@/components/Bento"
import { TypingAnimation } from "@/components/ui/typing-animation"

export function BentoSection() {
  return (
    <section id="features" className="relative w-full scroll-mt-28 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Asimétrico: título a la izquierda, Bento como pieza principal a la derecha (sin doble centrado) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0 lg:items-start">
          <header className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]">
              Features.
            </p>
            <h2 className="text-left text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]">
              <span className="text-[#D4AF37]">FinTrend</span>{" "}
              <TypingAnimation
                words={["analiza.", "predice.", "notifica."]}
                blinkCursor={true}
                pauseDelay={1800}
                loop
                className="text-zinc-200"
              />
            </h2>
            <p className="mt-5 max-w-sm text-left text-base leading-relaxed text-zinc-400">
              Cuatro pasos para transformar tu manera de invertir.
            </p>
          </header>
          <div className="lg:col-span-8 lg:min-w-0">
            <BentoDemo />
          </div>
        </div>
      </div>
    </section>
  )
}
