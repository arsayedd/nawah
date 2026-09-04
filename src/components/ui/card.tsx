import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-navy/8 bg-white p-5 shadow-[0_8px_30px_rgba(7,27,58,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "navy",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "navy" | "cobalt" | "mint" | "coral" | "slate";
}) {
  const tones = {
    navy: "bg-navy/8 text-navy",
    cobalt: "bg-cobalt/10 text-cobalt",
    mint: "bg-mint/15 text-emerald-800",
    coral: "bg-coral/15 text-[#c2410c]",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
