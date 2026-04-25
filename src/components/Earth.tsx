import RotatingEarth, {
  type GlobeStockMarker,
} from "@/components/ui/wireframe-dotted-globe";

interface EarthProps {
  width?: number;
  height?: number;
  markers?: GlobeStockMarker[];
  className?: string;
}

export default function Earth({
  width = 480,
  height = 300,
  markers,
  className,
}: EarthProps) {
  return (
    <RotatingEarth
      width={width}
      height={height}
      markers={markers}
      className={className}
    />
  );
}
