import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[10px] border border-navy/10 bg-white px-3 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-[88px] w-full rounded-[10px] border border-navy/10 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40 outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20",
        className,
      )}
      {...props}
    />
  );
}
