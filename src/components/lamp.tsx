import { Hero } from "@/components/ui/hero-lamp"
import { TextScramble } from "@/components/ui/text-scramble"

function HeroDemo() {
    return (
        <Hero
            title="FinTrend"
            subtitle="Analítica impulsada por IA para decisiones más inteligentes."
            actions={[
                {
                    label: "Empezar",
                    href: "/dashboard",
                    variant: "default"
                }
            ]}
            titleClassName="text-4xl md:text-5xl font-black"
            subtitleClassName="text-lg md:text-xl max-w-[600px]"
            actionsClassName="mt-8"
        />
    );
}
export { HeroDemo }