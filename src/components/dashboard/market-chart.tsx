import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import Earth from "@/components/Earth";
import type { GlobeStockMarker } from "@/components/ui/wireframe-dotted-globe";

/** Centroides aproximados capital / región (sin duplicados). */
const COUNTRY_POINTS_RAW: { lng: number; lat: number }[] = [
  { lng: -99.13, lat: 19.43 }, // México
  { lng: -58.38, lat: -34.6 }, // Argentina
  { lng: -47.93, lat: -15.78 }, // Brasil
  { lng: -74.07, lat: 4.71 }, // Colombia
  { lng: -77.04, lat: -12.05 }, // Perú
  { lng: -70.67, lat: -33.45 }, // Chile
  { lng: -74.07, lat: 40.71 }, // EE.UU. (NY)
  { lng: -122.42, lat: 37.77 }, // EE.UU. (SF)
  { lng: -79.38, lat: 43.65 }, // Canadá
  { lng: -3.7, lat: 40.42 }, // España
  { lng: 2.35, lat: 48.86 }, // Francia
  { lng: 13.4, lat: 52.52 }, // Alemania
  { lng: -0.13, lat: 51.51 }, // Reino Unido
  { lng: 12.57, lat: 55.68 }, // Dinamarca
  { lng: -9.14, lat: 38.72 }, // Portugal
  { lng: 12.5, lat: 41.9 }, // Italia
  { lng: 4.9, lat: 52.37 }, // Países Bajos
  { lng: 18.07, lat: 59.33 }, // Suecia
  { lng: 103.82, lat: 1.35 }, // Singapur
  { lng: 139.69, lat: 35.69 }, // Japón
  { lng: 127.77, lat: 37.57 }, // Corea
  { lng: 116.41, lat: 39.9 }, // China
  { lng: 77.21, lat: 28.61 }, // India
  { lng: 144.96, lat: -37.81 }, // Australia
  { lng: 151.21, lat: -33.87 }, // Sydney
  { lng: 174.76, lat: -36.85 }, // NZ
  { lng: 31.24, lat: 30.04 }, // Egipto
  { lng: 18.42, lat: -33.92 }, // Sudáfrica
  { lng: 3.38, lat: 6.52 }, // Nigeria
  { lng: -43.17, lat: -22.91 }, // Brasil (Río)
  { lng: 55.27, lat: 25.2 }, // UAE
  { lng: 35.21, lat: 31.77 }, // Israel
  { lng: 29.06, lat: 41.01 }, // Turquía
  { lng: 37.62, lat: 55.76 }, // Rusia
  { lng: 106.83, lat: -6.21 }, // Indonesia
  { lng: 100.5, lat: 13.76 }, // Tailandia
  { lng: -95.99, lat: 36.15 }, // EE.UU. central
  { lng: -80.25, lat: 25.76 }, // EE.UU. Miami
  { lng: 14.5, lat: 50.08 }, // Chequia
  { lng: 21.01, lat: 52.23 }, // Polonia
  { lng: -68.12, lat: -16.5 }, // Bolivia
  { lng: -56.16, lat: -34.9 }, // Uruguay
]

const COUNTRY_POINTS = (() => {
  const seen = new Set<string>()
  return COUNTRY_POINTS_RAW.filter((p) => {
    const k = `${p.lng.toFixed(1)},${p.lat.toFixed(1)}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
})()

/**
 * Pocas etiquetas (franjas anchas): un nodo por zona del mundo para que siga
 * habiendo algo visible al girar, sin saturar el globo.
 */
function markersForContinuousCoverage(
  list: { lng: number; lat: number }[],
  bands = 6,
): GlobeStockMarker[] {
  const byBand: { lng: number; lat: number }[][] = Array.from({ length: bands }, () => [])
  for (const p of list) {
    const i = Math.floor(((p.lng + 180) / 360) * bands)
    const idx = Math.min(bands - 1, Math.max(0, i))
    byBand[idx]!.push(p)
  }

  const out: GlobeStockMarker[] = []
  for (const band of byBand) {
    if (band.length === 0) continue
    const p = band[Math.floor(Math.random() * band.length)]!
    out.push({
      lng: p.lng,
      lat: p.lat,
      value: String(2200 + Math.floor(Math.random() * 800)),
      changePct:
        Math.random() > 0.45
          ? Math.floor(3 + Math.random() * 18)
          : -Math.floor(2 + Math.random() * 12),
    })
  }

  return out
}

export const MarketChart = () => {
  const globeMarkers = useMemo(() => markersForContinuousCoverage(COUNTRY_POINTS), []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-1 lg:col-span-2 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group min-h-0 sm:min-h-[500px]"
    >
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-start sm:justify-between relative z-20">
        <div className="min-w-0 pr-0 sm:pr-4">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight">
            Presencia de Mercado Global
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-prose">
            Actividad en tiempo real a través de los principales nodos financieros
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {['LIVE', '24H', 'HISTORY'].map((period) => (
            <button 
              key={period}
              type="button"
              className="px-3 py-1.5 sm:py-1 rounded-lg text-[10px] font-bold transition-all hover:bg-[#D4AF37]/10 text-zinc-500 hover:text-[#D4AF37] border border-white/5 hover:border-[#D4AF37]/20 tracking-widest"
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] min-h-[220px] sm:h-[300px] sm:min-h-0 w-full flex items-center justify-center relative z-10 overflow-hidden mx-auto">
        <Earth width={480} height={290} markers={globeMarkers} className="max-w-full" />
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-4 border-t border-white/5 pt-4 sm:pt-6 relative z-20">
        {[
          { label: 'Nodos Activos', value: '1,240' },
          { label: 'Regiones', value: '182' },
          { label: 'Latencia Prom.', value: '14ms' },
          { label: 'Uptime Sistema', value: '99.99%' },
        ].map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-1 leading-tight">{item.label}</p>
            <p className="text-sm font-bold text-white tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
