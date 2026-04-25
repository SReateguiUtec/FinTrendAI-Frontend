"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Archivos en `public/` — Vite los sirve en la raíz del sitio. */
function publicAsset(name: string) {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? `${base}${name}` : `${base}/${name}`;
}

export interface MotionTileItem {
  src: string;
  alt: string;
  /** Clases de apilado / overlay (gris) */
  className?: string;
}

interface MotionTileCardProps {
  src: string;
  alt: string;
  className?: string;
  isLifted: boolean;
  onHover?: () => void;
  isActive?: boolean;
  onTap?: () => void;
}

function MotionTileCard({
  src,
  alt,
  className,
  isLifted,
  onHover,
  isActive,
  onTap,
}: MotionTileCardProps) {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice && !isActive) {
      e.preventDefault();
      onTap?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={onHover}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
        "w-[260px] sm:w-[380px] -skew-y-[8deg] select-none cursor-default",
        "transition-all duration-500 hover:border-border/80",
        isLifted && "-mt-8 sm:-mt-10",
        isActive && "ring-2 ring-primary/50",
        "dark:after:absolute dark:after:-right-1 dark:after:top-[-5%] dark:after:h-[110%] dark:after:w-[20rem] dark:after:bg-gradient-to-l dark:after:from-background dark:after:to-transparent dark:after:content-[''] dark:after:pointer-events-none",
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full object-cover object-top"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

export interface FeatureBlurb {
  title: string;
  blurb: string;
}

export interface MotionTilesProps {
  items?: MotionTileItem[];
  /** Texto a la derecha (mismo orden que las imágenes). Por defecto, las 4 de FinTrend. */
  features?: FeatureBlurb[];
}

const DEFAULT_FEATURES: FeatureBlurb[] = [
  {
    title: "Predicciones con IA en tiempo real.",
    blurb:
      "Modelos que combinan histórico, sentimiento y macro para proyectar precios con intervalos de confianza.",
  },
  {
    title: "Monitoreo de mercado en vivo.",
    blurb:
      "Cotizaciones al instante para decenas de emisoras: precio, variación, volumen y tendencia sin recargar.",
  },
  {
    title: "Chatbot financiero potenciado por IA.",
    blurb:
      "Pregunta en lenguaje natural y obtén análisis técnico, fundamental y señales de entrada o salida.",
  },
  {
    title: "Alertas inteligentes personalizadas.",
    blurb:
      "Avisos por precio objetivo, volumen inusual o señales técnicas alineadas con tu estrategia.",
  },
];

const DEFAULT_ITEMS: MotionTileItem[] = [
  {
    src: publicAsset("1.png"),
    alt: "Predicción de precios con IA — AAPL",
    className:
      "[grid-area:stack] before:absolute before:inset-0 before:rounded-2xl before:outline-1 before:outline-border before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:pointer-events-none",
  },
  {
    src: publicAsset("2.png"),
    alt: "Mercado en vivo",
    className:
      "[grid-area:stack] translate-x-8 sm:translate-x-16 translate-y-6 sm:translate-y-10 before:absolute before:inset-0 before:rounded-2xl before:outline-1 before:outline-border before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:pointer-events-none",
  },
  {
    src: publicAsset("3.png"),
    alt: "Chat FinTrend AI",
    className:
      "[grid-area:stack] translate-x-16 sm:translate-x-32 translate-y-12 sm:translate-y-20 before:absolute before:inset-0 before:rounded-2xl before:outline-1 before:outline-border before:content-[''] before:bg-blend-overlay before:bg-background/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-500 hover:grayscale-0 before:pointer-events-none",
  },
  {
    src: publicAsset("4.png"),
    alt: "Centro de alertas",
    className:
      "[grid-area:stack] translate-x-24 sm:translate-x-48 translate-y-[4.5rem] sm:translate-y-[7.5rem]",
  },
];

function getStackedClassName(index: number, baseClassName: string, focusedIndex: number | null) {
  if (focusedIndex === 0 && index === 1) {
    return baseClassName + " !translate-y-20 sm:!translate-y-32 !translate-x-14 sm:!translate-x-24";
  }
  if (focusedIndex === 0 && index === 2) {
    return baseClassName + " !translate-y-28 sm:!translate-y-44 !translate-x-24 sm:!translate-x-40";
  }
  if (focusedIndex === 0 && index === 3) {
    return baseClassName + " !translate-y-36 sm:!translate-y-52 !translate-x-28 sm:!translate-x-44";
  }
  if (focusedIndex === 1 && index === 2) {
    return baseClassName + " !translate-y-24 sm:!translate-y-40 !translate-x-24 sm:!translate-x-40";
  }
  if (focusedIndex === 1 && index === 3) {
    return baseClassName + " !translate-y-32 sm:!translate-y-48 !translate-x-28 sm:!translate-x-44";
  }
  if (focusedIndex === 2 && index === 3) {
    return baseClassName + " !translate-y-24 sm:!translate-y-40 !translate-x-24 sm:!translate-x-40";
  }
  return baseClassName;
}

export default function MotionTiles({ items, features }: MotionTilesProps) {
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const focusedIndex = hoveredFeatureIndex ?? activeIndex;
  const list = items ?? DEFAULT_ITEMS;
  const src = features ?? DEFAULT_FEATURES;
  const rows: FeatureBlurb[] = list.map((_, i) => src[i] ?? { title: "", blurb: "" });

  const handleTap = (index: number) => {
    if (activeIndex === index) return;
    setActiveIndex(index);
  };

  const resetStackInteraction = () => {
    setHoveredFeatureIndex(null);
    setActiveIndex(null);
  };

  const stack = (
    <div
      className="relative inline-block max-w-full"
      onMouseLeave={resetStackInteraction}
    >
      <div className="grid [grid-template-areas:'stack'] place-items-start justify-items-start opacity-100 animate-in fade-in-0 duration-700">
        {list.map((item, index) => (
          <MotionTileCard
            key={`${item.src}-${index}`}
            src={item.src}
            alt={item.alt}
            isLifted={hoveredFeatureIndex === index}
            className={getStackedClassName(index, item.className ?? "", focusedIndex)}
            onHover={() => setHoveredFeatureIndex(index)}
            isActive={activeIndex === index}
            onTap={() => handleTap(index)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="features"
      className="relative w-full scroll-mt-28 py-24"
      aria-labelledby="features-heading"
      onMouseLeave={resetStackInteraction}
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2
          id="features-heading"
          className="mb-10 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          Features.
        </h2>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-x-24 xl:gap-x-32">
          <div className="flex min-h-[min(420px,60vh)] w-full items-center justify-start pb-8 pt-2 lg:min-h-[520px] lg:pb-10">
            {stack}
          </div>

          <ul className="flex flex-col gap-3 lg:pl-12 lg:pt-2 xl:pl-20">
            {rows.map((row, index) => (
              <li key={`feature-${index}`} className="py-1">
                <span className="text-sm font-bold text-foreground">{row.title}</span>
                {row.blurb ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.blurb}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Component() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center bg-background p-8">
      <MotionTiles />
    </div>
  );
}

/** @deprecated Usa `MotionTiles` */
export const Testimonials = MotionTiles;
export { MotionTileCard, MotionTiles, Component };
export type { MotionTilesProps as TestimonialsProps };
