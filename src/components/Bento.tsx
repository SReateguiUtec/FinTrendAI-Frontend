"use client"

import { Bell, Search, Share2, MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"
import AnimatedBeamDemo from "@/components/ui/animated-beam-demo"
import AnimatedListDemo from "@/components/ui/animated-list-demo"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"

// ── Stock Tickers ─────────────────────────────────────────────────────────────
const stocks = [
  { sym: "AAPL", name: "Apple Inc.",   price: "$183.42", change: "+1.24%", pos: true  },
  { sym: "NVDA", name: "NVIDIA Corp",  price: "$891.20", change: "+5.82%", pos: true  },
  { sym: "TSLA", name: "Tesla Inc.",   price: "$248.73", change: "+2.14%", pos: true  },
  { sym: "MSFT", name: "Microsoft",   price: "$420.55", change: "+1.22%", pos: true  },
  { sym: "AMZN", name: "Amazon",      price: "$185.61", change: "-0.73%", pos: false },
  { sym: "META", name: "Meta",        price: "$520.30", change: "-1.05%", pos: false },
  { sym: "GOOGL", name: "Alphabet",   price: "$175.98", change: "+0.89%", pos: true  },
  { sym: "AMD",  name: "AMD",         price: "$165.42", change: "+3.15%", pos: true  },
]

function StockCard({ stock }: { stock: typeof stocks[0] }) {
  return (
    <figure
      className={cn(
        "relative w-36 cursor-pointer overflow-hidden rounded-xl border p-3",
        "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]",
        "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none hover:scale-105"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">{stock.sym}</span>
          <span className={cn("text-[10px] font-medium", stock.pos ? "text-emerald-400" : "text-red-400")}>
            {stock.change}
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 truncate">{stock.name}</span>
        <span className="text-sm font-bold text-white">{stock.price}</span>
      </div>
    </figure>
  )
}

// ── Chat AI Visual ────────────────────────────────────────────────────────────
function ChatAIVisual() {
  const messages = [
    { role: "user", text: "¿Cómo está NVDA?" },
    { role: "ai",   text: "NVDA subió +5.82% esta semana. Señal alcista con 91% de confianza." },
    { role: "user", text: "¿Debo comprar?" },
    { role: "ai",   text: "Señal de entrada favorable. RSI en 62, volumen +18%." },
  ]

  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 gap-2 [mask-image:linear-gradient(to_top,transparent_20%,#000_80%)]">
      {messages.map((m, i) => (
        <div key={i} className={cn("flex max-w-[85%]", m.role === "user" ? "ml-auto" : "")}>
          <div
            className={cn(
              "px-3 py-2 rounded-2xl text-[10px] leading-relaxed",
              m.role === "user"
                ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-br-sm"
                : "bg-white/[0.06] text-zinc-300 border border-white/[0.08] rounded-bl-sm"
            )}
          >
            {m.text}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06]">
        <span className="text-[10px] text-zinc-500 flex-1">Pregunta algo...</span>
        <div className="size-5 rounded-full bg-[#D4AF37] flex items-center justify-center">
          <svg viewBox="0 0 10 10" className="w-2 h-2">
            <path d="M2 8L8 5 2 2V5.5L6 5 2 4.5V8Z" fill="black" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    Icon: Search,
    name: "Analiza",
    description: "Nuestra IA procesa miles de datos en tiempo real para detectar patrones y oportunidades.",
    href: "#",
    cta: "Ver análisis",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s]"
      >
        {stocks.map((stock, idx) => (
          <StockCard key={idx} stock={stock} />
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: "Recibe Alertas",
    description: "Notificaciones instantáneas cuando detectamos señales de compra, venta o eventos importantes.",
    href: "#",
    cta: "Configurar alertas",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2,
    name: "Múltiples Fuentes",
    description: "Procesamos noticias, precios y sentimiento de mercado simultáneamente para darte la imagen completa.",
    href: "#",
    cta: "Explorar fuentes",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamDemo className="absolute top-4 right-2 h-[300px] w-full border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105" />
    ),
  },
  {
    Icon: MessageSquare,
    name: "Consulta con IA",
    description: "Pregunta en lenguaje natural sobre cualquier acción.",
    href: "#",
    cta: "Probar chat",
    className: "col-span-3 lg:col-span-1",
    background: <ChatAIVisual />,
  },
]

// ── Export ────────────────────────────────────────────────────────────────────
export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}
