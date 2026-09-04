import { cn } from "@/lib/utils";

type MarkProps = {
  className?: string;
  variant?: "color" | "white" | "navy";
};

export function NawahMark({ className, variant = "color" }: MarkProps) {
  const cobalt = variant === "white" ? "#FFFFFF" : "#2563EB";
  const mint = variant === "white" ? "#E8FFF8" : "#19D3AE";
  const navy = variant === "white" ? "#C5D0E0" : "#071B3A";
  const core = variant === "navy" ? "#071B3A" : "#F6F4EF";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g transform="translate(32 32)">
        <path
          d="M0-6 C16-30 30-16 18 8 C10 22 -4 14 0-6Z"
          fill={cobalt}
          opacity="0.95"
        />
        <path
          d="M0-6 C16-30 30-16 18 8 C10 22 -4 14 0-6Z"
          fill={mint}
          opacity="0.92"
          transform="rotate(120)"
        />
        <path
          d="M0-6 C16-30 30-16 18 8 C10 22 -4 14 0-6Z"
          fill={navy}
          opacity="0.92"
          transform="rotate(240)"
        />
        <circle r="6.2" fill={core} />
      </g>
    </svg>
  );
}

export function NawahLockup({
  className,
  stacked = true,
  inverted = false,
}: {
  className?: string;
  stacked?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <NawahMark
        className="h-9 w-9"
        variant={inverted ? "white" : "color"}
      />
      {stacked ? (
        <div className="leading-none">
          <div
            className={cn(
              "font-cairo text-[18px] font-bold tracking-tight",
              inverted ? "text-white" : "text-navy",
            )}
          >
            نواة
          </div>
          <div
            className={cn(
              "mt-0.5 font-sans text-[13px] font-semibold tracking-wide",
              inverted ? "text-white/80" : "text-navy/70",
            )}
          >
            Nawah
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-baseline gap-2 font-semibold",
            inverted ? "text-white" : "text-navy",
          )}
        >
          <span className="font-cairo text-lg">نواة</span>
          <span className="text-white/30">|</span>
          <span className="font-sans text-sm">Nawah</span>
        </div>
      )}
    </div>
  );
}
