"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

import { ArrowRight } from "lucide-react"

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

                    {/* Main glow - CHAMPAGNE GOLD - Optimized */}
                    <div className={cn(
                        "absolute inset-auto z-50 h-36 -translate-y-[-30%] rounded-full bg-[#D4AF37] opacity-10 blur-3xl transform-gpu will-change-transform", 
                        isMobile ? "w-[12rem]" : "w-[28rem]"
                    )} />

                    {/* Lamp effect - CHAMPAGNE GOLD - Optimized */}
                    <motion.div
                        initial={{ width: isMobile ? "4rem" : "8rem" }}
                        viewport={{ once: true }}
                        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                        whileInView={{ width: innerLampWidth }}
                        className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-[#D4AF37] opacity-20 blur-2xl transform-gpu will-change-[width]"
                    />

                    {/* Top line - GOLD - Optimized */}
                    <motion.div
                        initial={{ width: isMobile ? "8rem" : "15rem" }}
                        viewport={{ once: true }}
                        transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
                        whileInView={{ width: lampWidth }}
                        className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-[#D4AF37]/40 transform-gpu will-change-[width]"
                    />

                    {/* Left gradient cone - GOLD - Optimized */}
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
                        className="absolute inset-auto right-1/2 h-56 overflow-visible bg-gradient-conic from-[#D4AF37]/20 via-transparent to-transparent [--conic-position:from_70deg_at_center_top] transform-gpu will-change-[width,opacity]"
                    >
                        <div className="absolute w-[100%] left-0 bg-[#0a0a0a] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
                        <div className="absolute w-40 h-[100%] left-0 bg-[#0a0a0a] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
                    </motion.div>

                    {/* Right gradient cone - GOLD - Optimized */}
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
                        className="absolute inset-auto left-1/2 h-56 overflow-visible bg-gradient-conic from-transparent via-transparent to-[#D4AF37]/20 [--conic-position:from_290deg_at_center_top] transform-gpu will-change-[width,opacity]"
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
                    className="relative z-50 container flex justify-center flex-col px-5 md:px-10 gap-4 mt-32 md:mt-44 transform-gpu"
                >
                    <div className="flex flex-col items-center text-center">
                        <h1
                            className={cn(
                                "font-display bg-gradient-to-br from-white via-[#D4AF37] to-[#8A6D2E] py-2 bg-clip-text text-center text-4xl font-bold tracking-[0.2em] text-transparent md:text-7xl uppercase transform-gpu",
                                titleClassName
                            )}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p
                                className={cn(
                                    "max-w-2xl text-zinc-500 text-lg md:text-xl transform-gpu mt-3",
                                    subtitleClassName
                                )}
                            >
                                {subtitle}
                            </p>
                        )}
                        {actions && actions.length > 0 && (
                            <div className={cn("flex flex-wrap items-center justify-center gap-4 mt-8", actionsClassName)}>
                                {actions.map((action, index) => (
                                    <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                            to={action.href}
                                            className={cn(
                                                "group flex items-center justify-center gap-2 rounded-xl bg-[#0a0a0a] border border-white/20 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-[#D4AF37]/[0.1] hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] active:scale-95 transform-gpu",
                                                isMobile && "px-5 py-2 text-xs"
                                            )}
                                        >
                                            {action.label}
                                        </Link>
                                    </motion.div>
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
