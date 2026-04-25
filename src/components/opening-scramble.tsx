"use client";

import { TextScramble } from "@/components/ui/text-scramble";

const DEFAULT_PHRASE = "#Predicelo";

type OpeningScrambleProps = {
  phrase?: string;
  /** Por defecto igual que `phrase`: mismo texto en gris hasta el hover (sin símbolos aleatorios). */
  maskCycle?: string;
};

/**
 * Bloque tipo “opening” antes del footer: la frase está enmascarada y se revela al pasar el cursor.
 */
export function OpeningScramble({
  phrase = DEFAULT_PHRASE,
  maskCycle,
}: OpeningScrambleProps) {
  const resolvedMaskCycle = maskCycle ?? phrase;

  return (
    <section
      className="relative w-full bg-[#0a0a0a] px-6 pt-4 pb-8"
      aria-label="Mensaje de cierre"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-[10px] font-semibold uppercase leading-none tracking-[0.35em] text-zinc-600">
            FinTrend
          </p>
        </div>
        <TextScramble
          text={phrase}
          maskCycle={resolvedMaskCycle}
          decodeOnHover
          maskClassName="text-zinc-500"
          revealedTextClassName="text-[#D4AF37]"
          className="max-w-full flex-col items-center"
          textClassName="relative text-xl font-semibold leading-snug tracking-tight md:text-3xl md:leading-tight"
          underlineClassName="bg-[#D4AF37]"
        />
      </div>
    </section>
  );
}
