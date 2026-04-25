import { MorphPanel } from "@/components/ui/ai-input";

/**
 * Chat bubble fijo en la esquina inferior izquierda del viewport.
 * Visualmente vive dentro del sidebar en desktop; al expandirse (360 px)
 * se abre hacia la derecha, entrando al área de contenido.
 */
export default function AiChat() {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-30"
      aria-label="Asistente IA"
    >
      <div className="pointer-events-auto">
        <MorphPanel />
      </div>
    </div>
  );
}
