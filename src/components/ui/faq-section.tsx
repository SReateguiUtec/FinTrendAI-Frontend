import React, { useEffect, useRef, useState } from "react";

export default function FAQWithSpiral() {
  const spiralRef = useRef<HTMLDivElement | null>(null);

  // Spiral configuration
  const cfg = {
    points: 700,
    dotRadius: 1.8,
    duration: 3.0,
    color: "#D4AF37",
    gradient: "none" as const,
    pulseEffect: true,
    opacityMin: 0.12,
    opacityMax: 0.5,
    sizeMin: 0.5,
    sizeMax: 1.4,
  };

  // Gradient presets
  const gradients: Record<string, string[]> = { none: [] };

  // --- Dev "tests" (runtime assertions) ------------------------------------
  // These are lightweight checks of key invariants; they don't affect users.
  useEffect(() => {
    try {
      console.assert(Array.isArray(gradients.none) && gradients.none.length === 0, "Gradient 'none' must be an empty array");
      console.assert(cfg.sizeMin <= cfg.sizeMax, "sizeMin should be <= sizeMax");
      console.assert(cfg.opacityMin <= cfg.opacityMax, "opacityMin should be <= opacityMax");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate spiral SVG and mount
  useEffect(() => {
    if (!spiralRef.current) return;

    const SIZE = 560; // larger presence
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const N = cfg.points;
    const DOT = cfg.dotRadius;
    const CENTER = SIZE / 2;
    const PADDING = 4;
    const MAX_R = CENTER - PADDING - DOT;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(SIZE));
    svg.setAttribute("height", String(SIZE));
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);

    // Gradient
    if (cfg.gradient !== "none") {
      const defs = document.createElementNS(svgNS, "defs");
      const g = document.createElementNS(svgNS, "linearGradient");
      g.setAttribute("id", "spiralGradient");
      g.setAttribute("gradientUnits", "userSpaceOnUse");
      g.setAttribute("x1", "0%");
      g.setAttribute("y1", "0%");
      g.setAttribute("x2", "100%");
      g.setAttribute("y2", "100%");
      gradients[cfg.gradient].forEach((color, idx, arr) => {
        const stop = document.createElementNS(svgNS, "stop");
        stop.setAttribute("offset", `${(idx * 100) / (arr.length - 1)}%`);
        stop.setAttribute("stop-color", color);
        g.appendChild(stop);
      });
      defs.appendChild(g);
      svg.appendChild(defs);
    }

    for (let i = 0; i < N; i++) {
      const idx = i + 0.5;
      const frac = idx / N;
      const r = Math.sqrt(frac) * MAX_R;
      const theta = idx * GOLDEN_ANGLE;
      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);

      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", x.toFixed(3));
      c.setAttribute("cy", y.toFixed(3));
      c.setAttribute("r", String(DOT));
      c.setAttribute("fill", cfg.gradient === "none" ? cfg.color : "url(#spiralGradient)");
      c.setAttribute("opacity", "0.6");

      if (cfg.pulseEffect) {
        const animR = document.createElementNS(svgNS, "animate");
        animR.setAttribute("attributeName", "r");
        animR.setAttribute("values", `${DOT * cfg.sizeMin};${DOT * cfg.sizeMax};${DOT * cfg.sizeMin}`);
        animR.setAttribute("dur", `${cfg.duration}s`);
        animR.setAttribute("begin", `${(frac * cfg.duration).toFixed(3)}s`);
        animR.setAttribute("repeatCount", "indefinite");
        animR.setAttribute("calcMode", "spline");
        animR.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");
        c.appendChild(animR);

        const animO = document.createElementNS(svgNS, "animate");
        animO.setAttribute("attributeName", "opacity");
        animO.setAttribute("values", `${cfg.opacityMin};${cfg.opacityMax};${cfg.opacityMin}`);
        animO.setAttribute("dur", `${cfg.duration}s`);
        animO.setAttribute("begin", `${(frac * cfg.duration).toFixed(3)}s`);
        animO.setAttribute("repeatCount", "indefinite");
        animO.setAttribute("calcMode", "spline");
        animO.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");
        c.appendChild(animO);
      }

      svg.appendChild(c);
    }

    spiralRef.current.innerHTML = "";
    spiralRef.current.appendChild(svg);
  }, [cfg, gradients]);

  // FAQ content
  const faqs = [
    {
      q: "¿Qué es FinTrend AI?",
      a: "Una plataforma para centralizar seguimiento de acciones, noticias financieras, portafolios y señales generadas con IA.",
    },
    {
      q: "¿Las predicciones son recomendaciones financieras?",
      a: "No. Las predicciones y señales son apoyo informativo basado en datos y modelos de IA; no sustituyen asesoría financiera profesional.",
    },
    {
      q: "¿Cada cuánto se actualiza la información?",
      a: "El dashboard consulta precios, noticias y señales de forma periódica para mantener datos recientes sin recargar manualmente la página.",
    },
    {
      q: "¿Qué acciones puedo monitorear?",
      a: "Puedes seguir símbolos disponibles en el catálogo del sistema, incluyendo empresas populares como AAPL, NVDA, MSFT, AMZN, GOOGL y más.",
    },
    {
      q: "¿Cómo funciona el chatbot financiero?",
      a: "Interpreta preguntas en lenguaje natural y responde con contexto de mercado, noticias relevantes, análisis técnico y señales cuando hay información disponible.",
    },
    {
      q: "¿Puedo crear varios portafolios?",
      a: "Sí. Puedes organizar tus símbolos por estrategia, lista de seguimiento o grupo de empresas para analizarlos con mayor claridad.",
    },
  ];

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative w-full scroll-mt-28 overflow-hidden py-10 text-white md:py-20"
    >
      {/* Background Spiral */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 [mask-image:radial-gradient(circle_at_center,rgba(255,255,255,1),rgba(255,255,255,0.1)_60%,transparent_75%)]"
        style={{ mixBlendMode: "screen" }}
      >
        <div ref={spiralRef} />
      </div>

      {/* Layout */}
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <header className="mb-6 border-b border-white/10 pb-4 md:mb-10 md:pb-6">
          <div>
            <h2 id="faq-heading" className="text-5xl font-black tracking-tight md:text-7xl">
              FAQ
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70 md:mt-3 md:text-base">
              Información clara sobre datos, señales, portafolios y uso responsable de la IA en FinTrend.
            </p>
          </div>
        </header>

        {/* Content */}
        <section className="relative">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {faqs.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i + 1} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/40 p-5 transition duration-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/[0.03]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-xs text-white/40">{String(index).padStart(2, "0")}</span>
          <h3 className="text-base md:text-lg font-semibold leading-tight">{q}</h3>
        </div>
        <span className="ml-4 text-xl leading-none text-[#D4AF37] transition group-hover:text-[#f0cf6a]">{open ? "–" : "+"}</span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${open ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="text-sm leading-7 text-white/70">{a}</p>
        </div>
      </div>
      {/* Hover halo */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100">
        <div
          className="absolute -inset-1 rounded-2xl border border-white/10"
          style={{ maskImage: "radial-gradient(180px_180px_at_var(--x,50%)_var(--y,50%),white,transparent)" }}
        />
      </div>
    </div>
  );
}
