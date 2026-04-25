"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

// ── Module-level cache ──────────────────────────────────────────────────────
// El GeoJSON se descarga una sola vez por sesión aunque el componente
// se monte/desmonte varias veces al navegar entre pestañas.

interface DotData {
  lng: number
  lat: number
}

interface GeoCache {
  landFeatures: any
  allDots: DotData[]
}

let _geoCache: GeoCache | null = null
let _geoPromise: Promise<GeoCache> | null = null

// ── Pure helpers (module-level, sin estado React) ───────────────────────────

const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

const pointInFeature = (point: [number, number], feature: any): boolean => {
  const { type, coordinates } = feature.geometry
  if (type === "Polygon") {
    if (!pointInPolygon(point, coordinates[0])) return false
    for (let i = 1; i < coordinates.length; i++) {
      if (pointInPolygon(point, coordinates[i])) return false
    }
    return true
  }
  if (type === "MultiPolygon") {
    for (const polygon of coordinates) {
      if (pointInPolygon(point, polygon[0])) {
        let inHole = false
        for (let i = 1; i < polygon.length; i++) {
          if (pointInPolygon(point, polygon[i])) { inHole = true; break }
        }
        if (!inHole) return true
      }
    }
  }
  return false
}

const generateDotsInPolygon = (feature: any, dotSpacing = 16): [number, number][] => {
  const dots: [number, number][] = []
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature)
  const step = dotSpacing * 0.08
  for (let lng = minLng; lng <= maxLng; lng += step) {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      const pt: [number, number] = [lng, lat]
      if (pointInFeature(pt, feature)) dots.push(pt)
    }
  }
  return dots
}

/** Descarga y cachea los datos geográficos. Reutiliza el mismo Promise si ya
 *  hay una descarga en curso (evita doble-fetch con dos instancias simultáneas). */
function loadGeoData(): Promise<GeoCache> {
  if (_geoCache) return Promise.resolve(_geoCache)
  if (!_geoPromise) {
    _geoPromise = (async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
      )
      if (!res.ok) throw new Error("Failed to load land data")
      const landFeatures = await res.json()
      const allDots: DotData[] = []
      landFeatures.features.forEach((f: any) => {
        generateDotsInPolygon(f, 16).forEach(([lng, lat]) => allDots.push({ lng, lat }))
      })
      _geoCache = { landFeatures, allDots }
      _geoPromise = null
      return _geoCache
    })()
  }
  return _geoPromise
}

// ── Component ───────────────────────────────────────────────────────────────

/** Etiqueta tipo mercado: número + variación % encima de un punto (lng/lat). */
export interface GlobeStockMarker {
  lng: number
  lat: number
  /** Texto principal (ej. índice o volumen abreviado). */
  value: string
  /** Positivo = verde sube, negativo = rojo baja. */
  changePct: number
}

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  dotColor?: string
  outlineColor?: string
  graticuleColor?: string
  /** Marcadores flotantes estilo dashboard (demo). */
  markers?: GlobeStockMarker[]
}

function isFrontHemisphere(
  projection: d3.GeoOrthographic,
  lng: number,
  lat: number,
): boolean {
  const r = projection.rotate()
  const centerLon = -r[0]
  const centerLat = -r[1]
  return d3.geoDistance([lng, lat], [centerLon, centerLat]) <= Math.PI / 2 + 0.02
}

function drawStockMarkers(
  context: CanvasRenderingContext2D,
  projection: d3.GeoOrthographic,
  markers: GlobeStockMarker[] | undefined,
  containerWidth: number,
  containerHeight: number,
  sf: number,
) {
  if (!markers?.length) return

  context.textBaseline = "middle"
  const placed: { x: number; y: number; w: number; h: number }[] = []
  const overlaps = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
    pad: number,
  ) =>
    !(
      a.x + a.w < b.x - pad ||
      a.x > b.x + b.w + pad ||
      a.y + a.h < b.y - pad ||
      a.y > b.y + b.h + pad
    )

  const roundRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) => {
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, w, h, r)
      return
    }
    const rr = Math.min(r, w / 2, h / 2)
    ctx.moveTo(x + rr, y)
    ctx.arcTo(x + w, y, x + w, y + h, rr)
    ctx.arcTo(x + w, y + h, x, y + h, rr)
    ctx.arcTo(x, y + h, x, y, rr)
    ctx.arcTo(x, y, x + w, y, rr)
    ctx.closePath()
  }

  for (const m of markers) {
    if (!isFrontHemisphere(projection, m.lng, m.lat)) continue
    const p = projection([m.lng, m.lat])
    if (!p) continue
    const [px, py] = p
    if (px < -40 || px > containerWidth + 40 || py < -60 || py > containerHeight + 40) continue

    const up = m.changePct >= 0
    const moveColor = up ? "#22c55e" : "#ef4444"
    const pctLabel = `${up ? "+" : ""}${Math.abs(Math.round(m.changePct))}%`
    const subStr = `${up ? "▲" : "▼"} ${pctLabel}`

    const padX = 8 * sf
    const padY = 5 * sf
    context.font = `700 ${Math.max(12, 13 * sf)}px ui-sans-serif, system-ui, sans-serif`
    const wMain = context.measureText(m.value).width
    context.font = `600 ${Math.max(9, 10 * sf)}px ui-sans-serif, system-ui, sans-serif`
    const wSub = context.measureText(subStr).width
    const boxW = Math.max(wMain, wSub) + padX * 2
    const rowH = Math.max(14, 15 * sf)
    const boxH = rowH * 2 + padY * 2
    const rx = 6 * sf
    let bx = px - boxW / 2
    let by = py - boxH - 14 * sf
    bx = Math.max(2, Math.min(bx, containerWidth - boxW - 2))
    const stackStep = boxH + 6 * sf
    let guard = 0
    while (guard < 14) {
      const candidate = { x: bx, y: by, w: boxW, h: boxH }
      if (!placed.some((p) => overlaps(candidate, p, 2))) break
      by -= stackStep
      guard++
    }
    if (by < 2) by = 2
    placed.push({ x: bx, y: by, w: boxW, h: boxH })

    // Pin en el globo
    context.beginPath()
    context.arc(px, py, 4 * sf, 0, 2 * Math.PI)
    context.fillStyle = moveColor
    context.fill()
    context.strokeStyle = "rgba(255,255,255,0.35)"
    context.lineWidth = 1 * sf
    context.stroke()

    // Caja etiqueta
    context.beginPath()
    roundRectPath(context, bx, by, boxW, boxH, rx)
    context.fillStyle = "rgba(0,0,0,0.92)"
    context.fill()
    context.strokeStyle = "rgba(255,255,255,0.12)"
    context.lineWidth = 1 * sf
    context.stroke()

    const cx = bx + padX
    const y1 = by + padY + rowH / 2
    const y2 = by + padY + rowH + rowH / 2

    context.fillStyle = "#fafafa"
    context.textAlign = "left"
    context.font = `700 ${Math.max(12, 13 * sf)}px ui-sans-serif, system-ui, sans-serif`
    context.fillText(m.value, cx, y1)

    context.font = `600 ${Math.max(9, 10 * sf)}px ui-sans-serif, system-ui, sans-serif`
    context.fillStyle = moveColor
    context.fillText(subStr, cx, y2)
  }
}

export default function RotatingEarth({
  width = 480,
  height = 300,
  className = "",
  dotColor = "#D4AF37",
  outlineColor = "#D4AF37",
  graticuleColor = "#D4AF37",
  markers,
}: RotatingEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !container || !context) return

    let containerWidth = 0
    let containerHeight = 0
    let layoutRadius = 1

    const projection = d3.geoOrthographic().scale(1).translate([0, 0]).clipAngle(90)
    const pathGen = d3.geoPath().projection(projection).context(context)

    const applyLayout = (): boolean => {
      const cw = Math.max(160, Math.floor(container.clientWidth))
      const ch = Math.max(160, Math.floor(container.clientHeight))
      if (cw < 16 || ch < 16) return false
      containerWidth = cw
      containerHeight = ch
      layoutRadius = Math.min(cw, ch) / 2.5

      const dpr = window.devicePixelRatio || 1
      canvas.width = cw * dpr
      canvas.height = ch * dpr
      canvas.style.width = `${cw}px`
      canvas.style.height = `${ch}px`
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.scale(dpr, dpr)

      projection.scale(layoutRadius).translate([cw / 2, ch / 2])
      return true
    }

    const draw = (geo: GeoCache) => {
      if (containerWidth < 16 || containerHeight < 16) return
      context.clearRect(0, 0, containerWidth, containerHeight)

      const s = projection.scale()
      const sf = s / layoutRadius
      const markersRef = markers

      // Océano
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, s, 0, 2 * Math.PI)
      context.fillStyle = "#000000"
      context.fill()
      context.strokeStyle = outlineColor
      context.lineWidth = 2 * sf
      context.stroke()

      // Graticule
      context.beginPath()
      pathGen(d3.geoGraticule()())
      context.strokeStyle = graticuleColor
      context.lineWidth = 1 * sf
      context.globalAlpha = 0.15
      context.stroke()
      context.globalAlpha = 1

      // Contornos de tierra
      context.beginPath()
      geo.landFeatures.features.forEach((f: any) => pathGen(f))
      context.strokeStyle = outlineColor
      context.lineWidth = 1 * sf
      context.globalAlpha = 0.3
      context.stroke()
      context.globalAlpha = 1

      // Puntos
      geo.allDots.forEach(({ lng, lat }) => {
        const p = projection([lng, lat])
        if (p && p[0] >= 0 && p[0] <= containerWidth && p[1] >= 0 && p[1] <= containerHeight) {
          context.beginPath()
          context.arc(p[0], p[1], 1.2 * sf, 0, 2 * Math.PI)
          context.fillStyle = dotColor
          context.fill()
        }
      })

      drawStockMarkers(context, projection, markersRef, containerWidth, containerHeight, sf)
    }

    let geo: GeoCache | null = null
    let autoRotate = true
    const rotation: [number, number] = [0, 0]

    const rotationTimer = d3.timer(() => {
      if (!geo || !autoRotate) return
      rotation[0] += 0.5
      projection.rotate(rotation)
      draw(geo)
    })

    const handleMouseDown = (e: MouseEvent) => {
      autoRotate = false
      const startX = e.clientX
      const startY = e.clientY
      const startRot = [...rotation] as [number, number]

      const onMove = (me: MouseEvent) => {
        rotation[0] = startRot[0] + (me.clientX - startX) * 0.5
        rotation[1] = Math.max(-90, Math.min(90, startRot[1] - (me.clientY - startY) * 0.5))
        if (geo) { projection.rotate(rotation); draw(geo) }
      }
      const onUp = () => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
        setTimeout(() => { autoRotate = true }, 10)
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    }

    canvas.addEventListener("mousedown", handleMouseDown)

    let layoutRafAttempts = 0
    const tryLayoutAndDraw = () => {
      if (!geo) return
      if (!applyLayout()) {
        layoutRafAttempts++
        if (layoutRafAttempts < 24) requestAnimationFrame(tryLayoutAndDraw)
        return
      }
      projection.rotate(rotation)
      draw(geo)
    }

    const ro = new ResizeObserver(() => {
      if (!geo) return
      if (!applyLayout()) return
      projection.rotate(rotation)
      draw(geo)
    })
    ro.observe(container)

    loadGeoData()
      .then((data) => {
        geo = data
        tryLayoutAndDraw()
        setIsLoading(false)
      })
      .catch(() => {
        setError("Failed to load land map data")
        setIsLoading(false)
      })

    return () => {
      ro.disconnect()
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
    }
  }, [width, height, dotColor, outlineColor, graticuleColor, markers])

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-white/[0.02] p-8 ${className}`}>
        <p className="text-sm text-zinc-500 text-center">No se pudo cargar la visualización del globo</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto w-full ${className}`.trim()}
      style={{
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {/* Spinner visible solo mientras carga */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/[0.02]">
          <div className="size-8 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
        </div>
      )}

      {/* Canvas oculto hasta que los datos estén listos — ocupa el espacio correcto */}
      <canvas
        ref={canvasRef}
        className="rounded-2xl"
        style={{ visibility: isLoading ? "hidden" : "visible" }}
      />
    </div>
  )
}
