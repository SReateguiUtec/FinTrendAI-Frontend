"use client"

import { useState, useCallback, useRef, useEffect } from "react"

/** Pantallas táctiles: no hay hover persistente; `mouseenter` suele no dispararse como en desktop. */
function usePrefersFinePointerHover() {
  const [fine, setFine] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setFine(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])
  return fine
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*"

function randomNoise(equalLengthAs: string): string {
  return equalLengthAs
    .split("")
    .map((char) => {
      if (char === " ") return " "
      return CHARS[Math.floor(Math.random() * CHARS.length)]
    })
    .join("")
}

/** Misma longitud que `target`; en huecos del objetivo respeta espacio; el resto cicla `phrase`. */
function cycleMaskPhrase(target: string, phrase: string): string {
  if (!phrase.length) return randomNoise(target)
  return target
    .split("")
    .map((char, i) => {
      if (char === " ") return " "
      return phrase[i % phrase.length]!
    })
    .join("")
}

function noiseChar(i: number, frame: number, maskCycle: string | undefined): string {
  if (!maskCycle?.length) return CHARS[Math.floor(Math.random() * CHARS.length)]
  return maskCycle[(frame + i) % maskCycle.length]!
}

interface TextScrambleProps {
  text: string
  className?: string
  /** Applied to the main text row (typography, color). */
  textClassName?: string
  /** Animated underline bar (defaults to theme foreground). */
  underlineClassName?: string
  /**
   * Arranca enmascarado (`maskClassName`) — aleatorio por defecto, o `maskCycle` si se pasa —
   * y al hover revela `text` con color `revealedTextClassName`. Sin hover vuelve al estado enmascarado.
   */
  decodeOnHover?: boolean
  /** Color/estilo de los caracteres “encriptados” (ej. blanco). */
  maskClassName?: string
  /** Color/estilo de los caracteres ya revelados cuando `decodeOnHover` está activo. */
  revealedTextClassName?: string
  /**
   * Si se define, los caracteres aún no revelados ciclan esta frase en lugar de símbolos aleatorios.
   */
  maskCycle?: string
}

export function TextScramble({
  text,
  className = "",
  textClassName,
  underlineClassName = "bg-foreground",
  decodeOnHover = false,
  maskClassName = "text-white",
  revealedTextClassName,
  maskCycle,
}: TextScrambleProps) {
  const prefersFinePointerHover = usePrefersFinePointerHover()
  const buildMask = useCallback(
    (t: string) => (maskCycle ? cycleMaskPhrase(t, maskCycle) : randomNoise(t)),
    [maskCycle]
  )
  const [displayText, setDisplayText] = useState(() =>
    decodeOnHover ? buildMask(text) : text
  )
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  /** Posiciones ya fijas al texto objetivo (0..text.length). */
  const [revealedUpTo, setRevealedUpTo] = useState(decodeOnHover ? 0 : text.length)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!decodeOnHover) {
      setDisplayText(text)
      setRevealedUpTo(text.length)
      return
    }
    setDisplayText(buildMask(text))
    setRevealedUpTo(0)
  }, [text, decodeOnHover, buildMask])

  const runDecodeReveal = useCallback(() => {
    setIsScrambling(true)
    frameRef.current = 0
    const duration = Math.max(6, Math.ceil(text.length * 2))

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      frameRef.current++

      const progress = frameRef.current / duration
      const revealedLength = Math.min(
        text.length,
        Math.floor(progress * text.length)
      )
      setRevealedUpTo(revealedLength)

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " "
          if (i < revealedLength) return text[i]
          return noiseChar(i, frameRef.current, maskCycle)
        })
        .join("")

      setDisplayText(newText)

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        setRevealedUpTo(text.length)
        setIsScrambling(false)
      }
    }, 20)
  }, [text, maskCycle])

  const scramble = useCallback(() => {
    setIsScrambling(true)
    frameRef.current = 0
    const duration = Math.max(6, Math.ceil(text.length * 2))

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      frameRef.current++

      const progress = frameRef.current / duration
      const revealedLength = Math.floor(progress * text.length)

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " "
          if (i < revealedLength) return text[i]
          return noiseChar(i, frameRef.current, maskCycle)
        })
        .join("")

      setDisplayText(newText)

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, 20)
  }, [text, maskCycle])

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (decodeOnHover) {
      runDecodeReveal()
    } else {
      scramble()
    }
  }

  const handleMouseLeave = () => {
    /* Con decodeOnHover en táctil, al soltar el dedo llega “leave” al instante y borraba la revelación. */
    if (decodeOnHover && !prefersFinePointerHover) {
      return
    }

    setIsHovering(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsScrambling(false)
    if (decodeOnHover) {
      setDisplayText(buildMask(text))
      setRevealedUpTo(0)
    }
  }

  /** Tap: revelar; otro tap cuando ya está claro: volver al ruido (solo sin hover fino). */
  const handleCoarsePointerToggle = useCallback(() => {
    if (!decodeOnHover || prefersFinePointerHover) return

    const fullyRevealed =
      !isScrambling && revealedUpTo >= text.length && displayText === text

    if (fullyRevealed) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsHovering(false)
      setDisplayText(buildMask(text))
      setRevealedUpTo(0)
      return
    }

    setIsHovering(true)
    runDecodeReveal()
  }, [
    decodeOnHover,
    prefersFinePointerHover,
    isScrambling,
    revealedUpTo,
    text,
    displayText,
    runDecodeReveal,
    buildMask,
  ])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const defaultTextRow =
    "relative font-mono text-lg tracking-widest uppercase text-foreground"

  return (
    <div
      className={`group relative inline-flex flex-col cursor-pointer select-none ${className}`}
      onMouseEnter={
        !decodeOnHover || prefersFinePointerHover ? handleMouseEnter : undefined
      }
      onMouseLeave={
        !decodeOnHover || prefersFinePointerHover ? handleMouseLeave : undefined
      }
      onClick={decodeOnHover && !prefersFinePointerHover ? handleCoarsePointerToggle : undefined}
      role={decodeOnHover && !prefersFinePointerHover ? "button" : undefined}
      tabIndex={decodeOnHover && !prefersFinePointerHover ? 0 : undefined}
      onKeyDown={
        decodeOnHover && !prefersFinePointerHover
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleCoarsePointerToggle()
              }
            }
          : undefined
      }
    >
      <span className={textClassName ?? defaultTextRow}>
        {displayText.split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              decodeOnHover
                ? `${i < revealedUpTo ? revealedTextClassName ?? "text-foreground" : maskClassName}${
                    isScrambling && i >= revealedUpTo ? " opacity-90 scale-110" : ""
                  }`
                : `text-inherit ${
                    isScrambling && char !== text[i] ? "opacity-90 scale-110" : ""
                  }`
            }`}
            style={{
              transitionDelay: decodeOnHover ? `${i * 5}ms` : `${i * 10}ms`,
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* Animated underline */}
      <span className="relative h-px w-full mt-2 overflow-hidden">
        <span
          className={`absolute inset-0 ${underlineClassName} transition-transform duration-280 ease-out origin-left ${
            isHovering ? "scale-x-100" : "scale-x-0"
          }`}
        />
        <span className="absolute inset-0 bg-border" />
      </span>

      {/* Subtle glow on hover */}
      <span
        className={`absolute -inset-4 rounded-lg bg-primary/5 transition-opacity duration-300 -z-10 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
