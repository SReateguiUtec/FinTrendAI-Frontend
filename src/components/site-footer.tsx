import { TextScramble } from "@/components/ui/text-scramble"

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className='relative w-full border-t border-white/[0.06] bg-[#0a0a0a]'>
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent'
        aria-hidden
      />
      <div className='mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-6 py-12 sm:flex-row sm:justify-between sm:gap-0'>
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className='font-display text-[12px] font-semibold tracking-[0.4em] text-zinc-500 uppercase'>
            FinTrend <span className='text-[#D4AF37]'>AI</span>
          </p>
          <TextScramble 
            text="#Predicelo"
            maskCycle="#Predicelo"
            decodeOnHover
            maskClassName="text-zinc-700"
            revealedTextClassName="text-[#D4AF37]"
            textClassName="text-[11px] tracking-[0.4em] uppercase font-bold"
            underlineClassName="bg-[#D4AF37]/50"
          />
        </div>
        <p className='text-[10px] tracking-[0.25em] text-zinc-700 tabular-nums'>
          © {year}
        </p>
      </div>
    </footer>
  );
}
