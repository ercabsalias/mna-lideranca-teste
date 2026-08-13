import { cn } from "@/lib/utils";
import logoAsset from "@/assets/mna-logo.png.asset.json";

/**
 * Official MNA leaders emblem.
 */
export function Logo({
  className,
  size = 44,
  label = true,
  tone = "dark",
}: {
  className?: string;
  size?: number;
  label?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logoAsset.url}
        alt="Logotipo dos Líderes da Missão Norte de Angola"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
        
      />
      {label && (
        <div className="leading-tight">
          <p
            className={cn(
              "font-display text-sm font-semibold tracking-tight",
              tone === "dark" ? "text-foreground" : "text-primary-foreground",
            )}
          >
            MNA Leadership Portal
          </p>
          <p
            className={cn(
              "text-[11px]",
              tone === "dark" ? "text-muted-foreground" : "text-primary-foreground/70",
            )}
          >
            Missão Norte de Angola
          </p>
        </div>
      )}
    </div>
  );
}
