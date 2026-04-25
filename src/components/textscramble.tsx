import { TextScramble } from "@/components/ui/text-scramble";

/**
 * Vista demo del efecto scramble (puedes montarla en una ruta `/dev` o similar).
 * Para otros usos, importa `TextScramble` desde `@/components/ui/text-scramble`.
 */
export default function ScrambleText() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-20 bg-background px-6">
      <div className="flex flex-col items-center gap-12">
        <TextScramble text="Predicelo" />
      </div>
    </main>
  );
}
