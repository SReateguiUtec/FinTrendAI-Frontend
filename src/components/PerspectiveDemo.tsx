"use client";

import * as React from "react";
import {
  PerspectiveMarquee,
  PERSPECTIVE_MARQUEE_ITEMS,
} from "@/components/ui/perspective-effect";

/** zinc-300 — menos brillo que blanco sobre fondos oscuros */
const ZINC_MARQUEE = "#d4d4d8";
/** zinc-600 — legible sobre fondo claro en la demo */
const ZINC_MARQUEE_ON_LIGHT = "#52525b";

function usePrefersDark() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setIsDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDark;
}

/** Página demo a pantalla completa (preview del marquee). */
export default function PerspectiveDemoPage() {
  const isDark = usePrefersDark();

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: isDark ? "#050505" : "#fafafa" }}
    >
      <PerspectiveMarquee
        items={PERSPECTIVE_MARQUEE_ITEMS}
        rotateY={-28}
        rotateX={8}
        perspective={1200}
        pixelsPerFrame={2}
        speed={1}
        fontSize={72}
        background={isDark ? "#050505" : "#fafafa"}
        fadeColor={isDark ? "#050505" : "#fafafa"}
        color={isDark ? ZINC_MARQUEE : ZINC_MARQUEE_ON_LIGHT}
      />
    </div>
  );
}

/** Franja entre Features y FAQ en el landing (misma lista de palabras). */
export function PerspectiveMarqueeBand() {
  return (
    <section
      aria-label="Conceptos del análisis"
      className="relative w-full overflow-hidden border-y border-white/[0.06] bg-[#0a0a0a]"
    >
      <div className="relative mx-auto h-[140px] w-full max-w-[100vw] md:h-[180px]">
        <PerspectiveMarquee
          items={PERSPECTIVE_MARQUEE_ITEMS}
          rotateY={-26}
          rotateX={7}
          perspective={1100}
          pixelsPerFrame={1}
          speed={1}
          fontSize={52}
          fontWeight={700}
          background="#0a0a0a"
          fadeColor="#0a0a0a"
          color={ZINC_MARQUEE}
        />
      </div>
    </section>
  );
}
