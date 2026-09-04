import { cn } from "@/lib/utils";
import { AGENCY_NAME, AGENCY_NAME_AR } from "@/lib/brand";

/** Official Nawah mark from the brand file. */
export function NawahMark({
  className,
  variant: _variant = "color",
}: {
  className?: string;
  variant?: "color" | "white" | "navy";
}) {
  return (
    <span
      role="img"
      aria-label={AGENCY_NAME}
      className={cn(
        "inline-block h-9 w-9 shrink-0 bg-contain bg-center bg-no-repeat",
        className,
      )}
      style={{ backgroundImage: "url(/brand/nawah-mark.png)" }}
    />
  );
}

/** Official lockup: mark + Arabic نواة above English Nawah. */
export function NawahLockup({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <NawahMark className="h-10 w-10" />
      <div className="leading-[1.05]">
        <div
          className={cn(
            "font-cairo text-[18px] font-bold tracking-tight",
            inverted ? "text-white" : "text-navy",
          )}
        >
          {AGENCY_NAME_AR}
        </div>
        <div
          className={cn(
            "mt-0.5 font-sans text-[13px] font-semibold tracking-tight",
            inverted ? "text-white/70" : "text-navy/70",
          )}
        >
          {AGENCY_NAME}
        </div>
      </div>
    </div>
  );
}
