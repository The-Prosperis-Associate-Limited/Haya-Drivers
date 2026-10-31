import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string | null;
  caption?: string;
  className?: string;
  valueClassName?: string;
  light?: boolean;
}

// Renders exactly what the API returns - the score is never computed here.
export const TrustRing = function ({
  score,
  size = 64,
  strokeWidth = 4,
  label = "Trust Score",
  caption,
  className,
  valueClassName,
  light,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(score, 100) / 100);

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      aria-label={`Trust score ${score} out of 100`}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={
              light ? "rgba(255,255,255,0.25)" : "var(--color-brand-soft)"
            }
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={light ? "#ffffff" : "var(--color-brand)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-lg font-semibold",
              light ? "text-white" : "text-ink",
              valueClassName,
            )}
          >
            {score}
          </span>
          {caption && (
            <span
              className={cn(
                "text-[11px]",
                light ? "text-white/75" : "text-muted-foreground",
              )}
            >
              {caption}
            </span>
          )}
        </span>
      </div>
      {label && <span className="text-muted-foreground text-xs">{label}</span>}
    </div>
  );
};
