import HeroSectionwithPixelBackground from "@/components/hero"
import { LaserFlowBoxExample } from "@/components/LaserFlowMain"
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/ui/announcement"
import { Bot } from "lucide-react"
import MotionTiles from "@/components/ui/motion-tiles"
import { SiteFooter } from "@/components/site-footer"
import { OpeningScramble } from "@/components/opening-scramble"

export const Home = () => {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a]">
            <HeroSectionwithPixelBackground />
            <div className="flex justify-center px-4 py-0 -mt-2">
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
            <br />
            <br />
            <MotionTiles />

            {/* Command Center Section */}
            <div id='comando' className='scroll-mt-28'>
                <OpeningScramble />
            </div>

            <SiteFooter />
        </div>
    )
}