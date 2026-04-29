"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PrecioData {
  fecha: string
  close: number
  open?: number
  high?: number
  low?: number
}

interface ChartHistorialProps {
  data: PrecioData[]
  simbolo: string
  timeRange: string
  onTimeRangeChange: (value: string) => void
}

const chartConfig = {
  close: {
    label: "Precio de cierre",
    color: "#D4AF37",
  },
} satisfies ChartConfig

export function ChartHistorial({
  data,
  simbolo,
  timeRange,
  onTimeRangeChange,
}: ChartHistorialProps) {
  const formatPrice = (value: number) => `$${value.toFixed(2)}`

  const hasData = data.length > 0
  const minPrice = hasData
    ? Math.min(...data.map((d) => d.close))
    : 0
  const maxPrice = hasData
    ? Math.max(...data.map((d) => d.close))
    : 0

  return (
    <Card className="pt-0 border-white/10 bg-white/[0.02]">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 border-b border-white/5 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold text-white leading-none">
            {simbolo}
          </CardTitle>
          <CardDescription className="text-[11px] text-zinc-500 mt-0.5">
            Histórico de precios de cierre
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger
            className="w-[130px] shrink-0 rounded-lg bg-white/5 border-white/10 text-zinc-300 text-xs h-8"
            aria-label="Seleccionar período"
          >
            <SelectValue placeholder="Últimos 30 días" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-[#111] border-white/10">
            <SelectItem value="30d" className="rounded-lg text-zinc-300 focus:bg-white/10 focus:text-white">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg text-zinc-300 focus:bg-white/10 focus:text-white">
              Últimos 90 días
            </SelectItem>
            <SelectItem value="1y" className="rounded-lg text-zinc-300 focus:bg-white/10 focus:text-white">
              Último año
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-zinc-500 text-sm">
            No hay datos en este rango. Puedes elegir otro período arriba.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[280px] w-full aspect-auto justify-start [&_.recharts-cartesian-axis-tick_text]:fill-zinc-500"
          >
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#D4AF37"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#D4AF37"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                domain={[minPrice * 0.98, maxPrice * 1.02]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickFormatter={formatPrice}
                width={65}
              />
              <ChartTooltip
                cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    }}
                    formatter={(value) => [
                      formatPrice(Number(value)),
                      "Cierre",
                    ]}
                    indicator="dot"
                    className="bg-[#111] border border-white/10"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--color-close)"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}