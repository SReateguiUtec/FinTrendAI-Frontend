import { motion } from "framer-motion"
import HeroSectionwithPixelBackground from "@/components/hero"
import { LaserFlowBoxExample } from "@/components/LaserFlowMain"
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/ui/announcement"
import { Bot } from "lucide-react"
import MotionTiles from "@/components/ui/motion-tiles"
import FAQWithSpiral from "@/components/ui/faq-section"
import { PerspectiveMarqueeBand } from "@/components/PerspectiveDemo"
import { SiteFooter } from "@/components/site-footer"
import { BentoSection } from "@/components/bento-section"
import { HeroDemo } from "@/components/lamp"

export const Home = () => {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a]">
            <HeroSectionwithPixelBackground />
            <div className="h-6 shrink-0 md:h-6" aria-hidden />
            <div className="flex justify-center px-4 pb-0 pt-1 md:-mt-2 md:pt-0 translate-y-6 relative z-10">
                <Announcement
                    className="bg-[#0a0a0a]/30"
                    movingBorder
                    movingBorderClassName="bg-[radial-gradient(#D4AF37_50%,transparent_70%)]"
                >
                    <AnnouncementTag>
                        <Bot className="size-4 text-[#D4AF37]" />
                    </AnnouncementTag>
                    <AnnouncementTitle>
                        IA para ayudarte a tomar decisiones
                    </AnnouncementTitle>
                </Announcement>
            </div>
            <section id='demo' className='scroll-mt-28' aria-label='Demostración interactiva'>
                <LaserFlowBoxExample />
            </section>
            <div className="h-6 shrink-0 md:h-12" aria-hidden />
            <BentoSection />
            <div className="h-6 shrink-0 md:h-12" aria-hidden />
            <MotionTiles />
            <br />
            <PerspectiveMarqueeBand />
            <br />
            <br />
            <FAQWithSpiral />
            
            {/* Visual Bridge / Transition Section */}
            <div className="flex flex-col items-center py-24 relative overflow-hidden">
                <div className="h-32 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent opacity-50" />
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 0.6, y: 0 }}
                    transition={{ duration: 1 }}
                    className="mt-8 text-[9px] md:text-[11px] tracking-[0.6em] uppercase text-[#D4AF37]/60 font-light text-center px-4"
                >
                    Transformando datos en oportunidades estratégicas
                </motion.p>
                <div className="mt-8 h-32 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent opacity-50" />
            </div>

            <HeroDemo />
            <SiteFooter />
        </div>
    )
}