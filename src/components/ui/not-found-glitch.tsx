import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import ASCIIText from '@/components/ui/ASCII-text';

const BG = '#0a0a0a';

export default function NotFoundwithGlitchyText() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{ backgroundColor: BG }}
    >
      {/* Ambiente: viñeta + acento dorado (alineado con landing / dashboard) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_120%,rgba(212,175,55,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="sr-only">404 — página no encontrada</span>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 w-full max-w-[min(100%,42rem)] select-none"
          aria-hidden
        >
          {/* ASCIIText usa position:absolute; el padre necesita alto explícito */}
          <div className="relative mx-auto h-[220px] w-full min-h-[200px] sm:h-[280px] md:h-[320px]">
            <ASCIIText
              text="404"
              textColor="#D4AF37"
              textFontSize={200}
              asciiFontSize={8}
              planeBaseHeight={8}
              enableWaves={false}
              fitToViewport
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: 'easeOut' }}
          className="mb-2 flex items-center gap-2"
        >
          <span className="h-px w-8 bg-[#D4AF37]/45" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
            Error / Página no encontrada
          </span>
          <span className="h-px w-8 bg-[#D4AF37]/45" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
          className="mb-3 text-2xl font-bold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: '"Courier New", ui-monospace, monospace' }}
        >
          Esta página no existe.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
          className="mb-10 max-w-sm font-mono text-sm leading-relaxed text-zinc-500 md:text-base"
        >
          La ruta que buscas no existe o fue movida.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-6 py-2.5 text-sm font-semibold text-[#D4AF37] shadow-[0_0_24px_rgba(212,175,55,0.12)] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/15"
            >
              <Home className="size-4" aria-hidden />
              Ir al inicio
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver
            </button>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          className="mt-12 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600"
        >
          HTTP 404 — No encontrado
        </motion.p>
      </div>
    </div>
  );
}
