"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import type { ElementType } from "react"
import {
  BarChart3,
  Check,
  CheckCircle2,
  Circle,
  CircleDotDashed,
  Newspaper,
  Sparkles,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

// (Senales)
interface Subtask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  tools?: string[]
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  level: number
  dependencies: string[]
  subtasks: Subtask[]
}

const createInitialTasks = (): Task[] => [
  {
    id: "1",
    title: "Recopilar Datos de Mercado",
    description: "Obtener historial de precios y velas del activo.",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      {
        id: "1.1",
        title: "Conectar con historial de precios",
        description:
          "Establecer conexión con la fuente de datos de mercado.",
        status: "pending",
        priority: "high",
        tools: ["ms2-connector", "api-fetch"],
      },
      {
        id: "1.2",
        title: "Obtener últimas velas",
        description:
          "Descargar y validar los precios históricos más recientes.",
        status: "pending",
        priority: "high",
        tools: ["data-validator"],
      },
    ],
  },
  {
    id: "2",
    title: "Analizar Sentimiento de Noticias",
    description: "Recopilar y analizar las últimas noticias relevantes.",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      {
        id: "2.1",
        title: "Conectar con feed de noticias",
        description: "Establecer conexión con la fuente de noticias.",
        status: "pending",
        priority: "high",
        tools: ["ms3-connector"],
      },
      {
        id: "2.2",
        title: "Análisis NLP de sentimiento",
        description:
          "Procesar las noticias mediante modelos de lenguaje para extraer sentimiento (bullish/bearish).",
        status: "pending",
        priority: "medium",
        tools: ["nlp-analyzer", "sentiment-model"],
      },
    ],
  },
  {
    id: "3",
    title: "Generar recomendación",
    description: "Combinar precio y sentimiento para emitir una decisión.",
    status: "pending",
    priority: "high",
    level: 1,
    dependencies: ["1", "2"],
    subtasks: [
      {
        id: "3.1",
        title: "Ponderar variables",
        description:
          "Calcular el peso relativo entre la tendencia de precio y el sentimiento general.",
        status: "pending",
        priority: "high",
        tools: ["weight-calculator"],
      },
      {
        id: "3.2",
        title: "Emitir señal final",
        description:
          "Generar la recomendación final de Compra, Venta o Mantener con su nivel de confianza.",
        status: "pending",
        priority: "high",
        tools: ["signal-generator", "decision-engine"],
      },
    ],
  },
]

const WIZ_STEPS: {
  id: number
  name: string
  description: string
  icon: ElementType
}[] = [
  {
    id: 1,
    name: "Recopilar Datos de Mercado",
    description: "Precios y velas",
    icon: BarChart3,
  },
  {
    id: 2,
    name: "Analizar Sentimiento de Noticias",
    description: "NLP y contexto",
    icon: Newspaper,
  },
  {
    id: 3,
    name: "Generar recomendación",
    description: "Señal final",
    icon: Sparkles,
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 },
  },
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
}

function SubtaskStatusIcon({ status }: { status: string }) {
  if (status === "completed")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
  if (status === "in-progress")
    return <CircleDotDashed className="h-3.5 w-3.5 text-sky-400 shrink-0" />
  return <Circle className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
}

/**
 * Trazo vertical solo entre círculos; el avance (oro) nunca pasa encima de los iconos.
 * Se llena al completar el paso `index0` (cuando currentStep >= index0 + 1).
 */
function StepConnector({
  index0,
  currentStep: c,
}: {
  index0: number
  currentStep: number
}) {
  const filled = c >= 0 && c >= index0 + 1

  return (
    <div
      className="flex w-12 justify-center py-1.5"
      aria-hidden
    >
      <div className="relative h-5 w-0.5 overflow-hidden rounded-full bg-zinc-800/90">
        <motion.div
          className="absolute left-0 right-0 top-0 bg-[#D4AF37]"
          initial={false}
          animate={{ height: filled ? "100%" : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

function taskStatus(s: string) {
  if (s === "completed") return { label: "Completada", className: "bg-emerald-500/15 text-emerald-300" }
  if (s === "in-progress")
    return { label: "En curso", className: "bg-sky-500/15 text-sky-300" }
  return { label: "Pendiente", className: "bg-zinc-500/20 text-zinc-400" }
}

export interface WizardPlanProps {
  currentStep?: number
}

/**
 * Misma progresión que `agent-plan`: `currentStep` 0–2 = tarea en curso;
 * `3` = las tres tareas y subtareas se marcan completadas. `-1` reinicia.
 */
export function WizardPlan({ currentStep = -1 }: WizardPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(() => createInitialTasks())

  useEffect(() => {
    if (currentStep < 0) {
      setTasks(createInitialTasks())
      return
    }
    setTasks((prev) =>
      prev.map((task, idx) => {
        if (idx < currentStep) {
          return {
            ...task,
            status: "completed",
            subtasks: task.subtasks.map((s) => ({ ...s, status: "completed" })),
          }
        }
        if (idx === currentStep) {
          return {
            ...task,
            status: "in-progress",
            subtasks: task.subtasks.map((s) => ({ ...s, status: "in-progress" })),
          }
        }
        return {
          ...task,
          status: "pending",
          subtasks: task.subtasks.map((s) => ({ ...s, status: "pending" })),
        }
      })
    )
  }, [currentStep])

  const displayTask: Task | null = useMemo(() => {
    if (currentStep < 0) return null
    if (currentStep >= 3) return null
    return tasks[currentStep] ?? null
  }, [currentStep, tasks])

  const allDone = currentStep >= 3

  return (
    <div className="w-full text-zinc-100">
      <div className="mb-6 text-left">
        <Badge
          variant="outline"
          className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
          Agente de análisis
        </Badge>
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
          Progreso del análisis
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Los pasos se actualizan en tiempo real mientras se combinan precios
          y noticias, igual que en el plan del agente.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40 shadow-xl backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
            <div>
              {WIZ_STEPS.map((step, index0) => {
                const c = currentStep
                const s = step.id
                const isLast = index0 === WIZ_STEPS.length - 1
                const Icon = step.icon
                const isComplete = c >= 0 && c >= s
                const isCurrent = c >= 0 && c === s - 1

                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-4 py-2.5"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center">
                      <motion.div
                        className={cn(
                          "z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300",
                          isComplete
                            ? "border-[#D4AF37]/50 bg-zinc-950 text-[#D4AF37]"
                            : isCurrent
                              ? "border-white/20 bg-zinc-950 text-white shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
                              : "border-zinc-700/60 bg-zinc-950 text-zinc-500"
                        )}
                        whileHover={{ scale: 1.04 }}
                      >
                        {isComplete && c >= 0 && !isCurrent ? (
                          <Check className="h-5 w-5" strokeWidth={2.5} />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </motion.div>
                      {!isLast && (
                        <StepConnector index0={index0} currentStep={c} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-semibold leading-snug transition-colors",
                          isCurrent || (isComplete && c >= 0)
                            ? "text-zinc-100"
                            : "text-zinc-500"
                        )}
                      >
                        {step.name}
                      </span>
                      <span className="text-xs text-zinc-500">{step.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex min-h-[240px] flex-col p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {allDone && (
                <motion.div
                  key="done"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex h-full flex-col items-center justify-center text-center"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Fuentes y modelo listos
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-zinc-500">
                    Precios, sentimiento y recomendación alineados. A
                    continuación se muestran el resultado y la señal.
                  </p>
                </motion.div>
              )}

              {!allDone && displayTask && currentStep >= 0 && (
                <motion.div
                  key={displayTask.id}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-5"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {displayTask.title}
                      </h3>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          taskStatus(displayTask.status).className
                        )}
                      >
                        {taskStatus(displayTask.status).label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {displayTask.description}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Subtareas
                    </p>
                    <ul className="space-y-2">
                      {displayTask.subtasks.map((st) => (
                        <li
                          key={st.id}
                          className="rounded-xl border border-white/8 bg-zinc-900/50 p-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="pt-0.5">
                              <SubtaskStatusIcon status={st.status} />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  st.status === "completed"
                                    ? "text-zinc-500 line-through"
                                    : "text-zinc-200"
                                )}
                              >
                                {st.title}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {st.description}
                              </p>
                              {st.tools && st.tools.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {st.tools.map((t) => (
                                    <span
                                      key={t}
                                      className="rounded border border-zinc-700/80 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {currentStep < 0 && (
                <motion.div
                  key="idle"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="py-4 text-sm text-zinc-500"
                >
                  Inicia un análisis con un símbolo: el progreso aparecerá
                  automáticamente.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WizardPlan
