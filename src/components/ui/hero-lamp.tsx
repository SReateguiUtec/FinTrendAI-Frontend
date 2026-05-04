"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface HeroAction {
    label: string
    href: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
    title: string
    subtitle?: string
    actions?: HeroAction[]
    titleClassName?: string
    subtitleClassName?: string
    actionsClassName?: string
    children?: React.ReactNode
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
    (
        {
            className,
            title,
            subtitle,
            actions,
            titleClassName,
            subtitleClassName,
            actionsClassName,
            children,
            ...props
        },
        ref,
    ) => {
        const [isMobile, setIsMobile] = React.useState(false)

        React.useEffect(() => {
            const checkMobile = () => setIsMobile(window.innerWidth < 768)
            checkMobile()
            window.addEventListener("resize", checkMobile)
            return () => window.removeEventListener("resize", checkMobile)
        }, [])

        const lampWidth = isMobile ? "14rem" : "30rem"
        const innerLampWidth = isMobile ? "8rem" : "16rem"

        return (
            <section
                ref={ref}
                className={cn(
                    "relative z-0 flex h-[450px] md:h-[600px] w-full flex-col items-center justify-start overflow-hidden rounded-md bg-[#0a0a0a]",
                    className,
                )}
                {...props}
            >
                <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center">
                    <div className="absolute top-0 z-50 h-48 w-screen bg-transparent opacity-10 backdrop-blur-md" />

                    {/* Main glow */}
                    <div className={cn("absolute inset-auto z-50 h-36 -translate-y-[-30%] rounded-full bg-white opacity-20 blur-3xl", isMobile ? "w-[12rem]" : "w-[28rem]")} />

                    {/* Lamp effect */}
                    <motion.div
                        initial={{ width: isMobile ? "4rem" : "8rem" }}
                        viewport={{ once: true }}
                        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                        whileInView={{ width: innerLampWidth }}
                        className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-white opacity-40 blur-2xl"
                    />

                    {/* Top line */}
                    <motion.div
                        initial={{ width: isMobile ? "8rem" : "15rem" }}
                        viewport={{ once: true }}
                        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                        whileInView={{ width: lampWidth }}
                        className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-white/50"
                    />

                    {/* Left gradient cone */}
                    <motion.div
                        initial={{ opacity: 0.5, width: isMobile ? "8rem" : "15rem" }}
                        whileInView={{ opacity: 1, width: lampWidth }}
                        transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        style={{
                            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                        }}
                        className="absolute inset-auto right-1/2 h-56 overflow-visible bg-gradient-conic from-white/20 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
                    >
                        <div className="absolute w-[100%] left-0 bg-[#0a0a0a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                        <div className="absolute w-40 h-[100%] left-0 bg-[#0a0a0a] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
                    </motion.div>

                    {/* Right gradient cone */}
                    <motion.div
                        initial={{ opacity: 0.5, width: isMobile ? "8rem" : "15rem" }}
                        whileInView={{ opacity: 1, width: lampWidth }}
                        transition={{
                            delay: 0.3,
                            duration: 0.8,
                            ease: "easeInOut",
                        }}
                        style={{
                            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                        }}
                        className="absolute inset-auto left-1/2 h-56 overflow-visible bg-gradient-conic from-transparent via-transparent to-white/20 [--conic-position:from_290deg_at_center_top]"
                    >
                        <div className="absolute w-40 h-[100%] right-0 bg-[#0a0a0a] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
                        <div className="absolute w-[100%] right-0 bg-[#0a0a0a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 0, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="relative z-50 container flex justify-center flex-col px-5 md:px-10 gap-4 mt-32 md:mt-44"
                >
                    <div className="flex flex-col items-center text-center space-y-8">
                        <h1
                            className={cn(
                                "font-display bg-gradient-to-br from-white via-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-bold tracking-[0.2em] text-transparent md:text-7xl uppercase",
                                titleClassName
                            )}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p
                                className={cn(
                                    "max-w-2xl text-zinc-500 text-lg md:text-xl",
                                    subtitleClassName
                                )}
                            >
                                {subtitle}
                            </p>
                        )}
                        {actions && actions.length > 0 && (
                            <div className={cn("flex flex-wrap items-center justify-center gap-4", actionsClassName)}>
                                {actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        variant={action.variant || "outline"}
                                        asChild
                                        className={cn(
                                            "rounded-full px-10 py-7 text-xl font-bold transition-all duration-300 hover:scale-105 ring-offset-[#0a0a0a] text-white",
                                            isMobile 
                                                ? "bg-zinc-900 border-zinc-700" 
                                                : "bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                                        )}
                                    >
                                        <Link to={action.href}>{action.label}</Link>
                                    </Button>
                                ))}
                            </div>
                        )}
                        {children}
                    </div>
                </motion.div>
            </section>
        )
    },
)
Hero.displayName = "Hero"

export { Hero }
