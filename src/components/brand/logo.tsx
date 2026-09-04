import { cn } from "@/lib/utils";

export function NawahMark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: "color" | "white" | "navy";
}) {
  const cobalt = variant === "white" ? "#FFFFFF" : "#2563EB";
  const mint = variant === "white" ? "#E8FFF8" : "#19D3AE";
  const navy = variant === "white" ? "#C5D0E0" : "#071B3A";
  const core = variant === "navy" ? "#071B3A" : "#F6F4EF";

  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden>
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
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <NawahMark className="h-9 w-9" variant={inverted ? "white" : "color"} />
      <div className="leading-none">
        <div
          className={cn(
            "font-sans text-[17px] font-semibold tracking-tight",
            inverted ? "text-white" : "text-navy",
          )}
        >
          Nawah
        </div>
        <div
          className={cn(
            "mt-0.5 font-cairo text-[12px] font-semibold",
            inverted ? "text-white/55" : "text-navy/45",
          )}
        >
          نواة
        </div>
      </div>
    </div>
  );
}
