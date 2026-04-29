import HeroSectionwithPixelBackground from "@/components/hero"
import { LaserFlowBoxExample } from "@/components/LaserFlowMain"
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/ui/announcement"
import { Bot } from "lucide-react"
import MotionTiles from "@/components/ui/motion-tiles"
import FAQWithSpiral from "@/components/ui/faq-section"
import { PerspectiveMarqueeBand } from "@/components/PerspectiveDemo"
import { SiteFooter } from "@/components/site-footer"
import { OpeningScramble } from "@/components/opening-scramble"
import { BentoSection } from "@/components/bento-section"

export const Home = () => {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a]">
            <HeroSectionwithPixelBackground />
            <div className="h-6 shrink-0 md:h-6" aria-hidden />
            <div className="flex justify-center px-4 pb-0 pt-1 md:-mt-2 md:pt-0">
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

            {/* Command Center Section */}
            <div id='comando' className='scroll-mt-28'>
                <OpeningScramble />
            </div>

            <SiteFooter />
        </div>
    )
}