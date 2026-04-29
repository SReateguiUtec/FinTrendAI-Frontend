import { useEffect, useState } from "react";
import FlatLogoLoop from "@/components/ui/logo-loop";

const LOGO_H_MOBILE = 44;
const LOGO_H_DESKTOP = 54;

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
  const logos = techLogos.map(({ src, alt }) => ({ src, alt }));
  const [logoHeight, setLogoHeight] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
      ? LOGO_H_DESKTOP
      : LOGO_H_MOBILE,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () =>
      setLogoHeight(mq.matches ? LOGO_H_DESKTOP : LOGO_H_MOBILE);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="relative w-full shrink-0 py-4 md:py-5">
      <FlatLogoLoop
        logos={logos}
        logoHeight={logoHeight}
        gap={52}
        speed={72}
        direction="left"
        fadeOut
        ariaLabel="Technology partners"
        className="w-full py-1"
      />
    </div>
  );
}
