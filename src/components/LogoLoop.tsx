import LogoLoopUI from './ui/logo-loop';

const techLogos = [
    { src: "/AWS Logo.svg", alt: "AWS" },
    { src: "/Claude Color Icon.svg", alt: "Claude" },
    { src: "/Nvidia Color Icon.svg", alt: "Nvidia" },
    { src: "/Microsoft Color Icon.svg", alt: "Microsoft" },
    { src: "/Meta Color.svg", alt: "Meta" },
    { src: "/Cloudflare Color Icon.svg", alt: "Cloudflare" },
    { src: "/Perplexity Color Icon.svg", alt: "Perplexity" },
    { src: "/Apple Logo.svg", alt: "Apple" },
    { src: "/OpenAI Logo.svg", alt: "OpenAI" },
    { src: "/Vercel Logo.svg", alt: "Vercel" },
    { src: "/Google Logo.svg", alt: "Google" },
    { src: "/Spotify Logo.svg", alt: "Spotify" },
    { src: "/Intel Logo.svg", alt: "Intel" },
    { src: "/X Logo.svg", alt: "X" },
];

export default function LogoLoop() {
    return (
        <div style={{ height: '92px', position: 'relative', overflow: 'hidden' }}>
            {/* Basic horizontal loop */}
            <LogoLoopUI
                logos={techLogos}
                speed={100}
                direction="left"
                logoHeight={54}
                gap={60}
                hoverSpeed={0}
                scaleOnHover
                ariaLabel="Technology partners"
            />
        </div>
    );
}