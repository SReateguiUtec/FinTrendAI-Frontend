import React, { useMemo } from 'react';
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
    <div className="w-full flex items-center justify-center relative z-10 overflow-hidden mx-auto">
      <Earth width={480} height={290} markers={globeMarkers} className="max-w-full" />
    </div>
  );
};
