import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import ReactMarkdown from "react-markdown"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { MessageSquare, Send, User, X, BotMessageSquare } from "lucide-react"

import { sendChatMessage } from "@/services/api"
import { ColorOrb, type OrbProps } from "@/components/ui/color-orb"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const BOT_NAME = "Finbot"

const ORB_TONES: NonNullable<OrbProps["tones"]> = { base: "oklch(22.64% 0 0)" }

type ChatMessage = { role: "user" | "bot"; text: string }

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "bot",
    text:
      "¡Hola! Soy Finbot, tu asistente financiero. ¿Qué deseas saber sobre el mercado?",
  },
]

function FinbotOrb({
  dimension,
  className,
  tones = ORB_TONES,
}: {
  dimension: string
  className?: string
  tones?: NonNullable<OrbProps["tones"]>
}) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-full", className)}
    >
      <ColorOrb dimension={dimension} tones={tones} />
    </div>
  )
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98, transformOrigin: "bottom right" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 28, stiffness: 320 },
  },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.2 } },
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    ...INITIAL_MESSAGES,
  ])
  const [draft, setDraft] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages, isTyping, scrollToBottom])

  const toggleOpen = useCallback(() => setIsOpen((o) => !o), [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || isTyping) return

    setMessages((prev) => [...prev, { role: "user", text }])
    setDraft("")
    setIsTyping(true)

    const historyForRequest = [...messages, { role: "user" as const, text }]

    try {
      const contextStr = localStorage.getItem("fintrend_portafolios")
      const context = contextStr ? JSON.parse(contextStr) : null
      const response = await sendChatMessage(historyForRequest, context)
      if (response?.mensaje) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: String(response.mensaje) },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "Lo siento, hubo un error procesando tu solicitud.",
          },
        ])
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Hubo un error de conexión con el orquestador de señales.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto w-[380px] overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-950/70 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
          >
            <div className="relative border-b border-zinc-800/60 bg-zinc-900/40 p-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/30 to-zinc-950/60" />
              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex shrink-0">
                    <FinbotOrb dimension="40px" />
                    <span
                      className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-500"
                      title="En línea"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {BOT_NAME}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      Asistente financiero
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-zinc-200"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex h-[min(50vh,420px)] min-h-[200px] flex-col gap-3 overflow-y-auto p-4 bg-gradient-to-b from-zinc-950/40 to-zinc-900/20">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 self-end",
                      msg.role === "user" ? "pt-0.5" : "pb-0.5"
                    )}
                  >
                    {msg.role === "user" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-600/60 bg-zinc-800/60 text-zinc-300">
                        <User className="h-4 w-4" aria-hidden />
                      </div>
                    ) : (
                      <FinbotOrb dimension="24px" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "min-w-0 max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-zinc-100 text-zinc-900 rounded-tr-sm"
                        : "border border-zinc-700/40 bg-zinc-800/50 text-zinc-200 rounded-tl-sm"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:leading-snug prose-pre:border prose-pre:border-zinc-700 prose-pre:bg-zinc-900">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full flex-row gap-2">
                  <div className="self-end pb-0.5">
                    <FinbotOrb dimension="24px" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-zinc-700/40 bg-zinc-800/50 px-3 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} className="h-px w-full shrink-0" />
            </div>

            <div className="border-t border-zinc-800/60 bg-zinc-900/30 p-3 backdrop-blur-md">
              <form
                className="flex items-center gap-2"
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Pregunta sobre el mercado o tus portafolios..."
                  disabled={isTyping}
                  className="min-w-0 flex-1 rounded-full border border-zinc-700/50 bg-zinc-950/50 px-4 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500 focus:bg-zinc-900 focus:ring-2 focus:ring-zinc-500/20 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full border border-zinc-600/80 bg-zinc-100 text-zinc-900 shadow-sm transition-transform hover:scale-105 hover:bg-white disabled:opacity-40"
                  disabled={!draft.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "pointer-events-auto relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-zinc-600/80 bg-zinc-900/95 text-zinc-100 shadow-2xl transition-transform hover:scale-105",
          isOpen && "bg-red-600 text-white border-red-500/50"
        )}
        aria-label={isOpen ? "Cerrar chat" : "Abrir Finbot"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <BotMessageSquare className="h-6 w-6" strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}

export default FloatingChatWidget
