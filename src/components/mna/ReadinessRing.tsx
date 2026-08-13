import { BAND_CLASS, readinessBand } from "@/lib/mna";
import { cn } from "@/lib/utils";

export function ReadinessRing({
  value,
  size = 168,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const band = readinessBand(value);
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn(BAND_CLASS[band.tone], "transition-[stroke-dashoffset] duration-700 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-bold">{value}%</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Prontidão</p>
          </div>
        </div>
      </div>
      <p className={cn("text-center text-sm font-medium", BAND_CLASS[band.tone])}>
        {band.dot} {band.label}
      </p>
    </div>
  );
}
