"use client";

import type { ReactNode } from "react";
import { useOS } from "@/store/use-os";

const EMPTY_HIDDEN: string[] = [];

export function PageSection({
  page,
  id,
  label,
  children,
}: {
  page: string;
  id: string;
  label?: string;
  children: ReactNode;
}) {
  const hiddenRaw = useOS((s) => s.prefs.hiddenPageSections[page]);
  const hidden = hiddenRaw ?? EMPTY_HIDDEN;
  const homeHidden = useOS((s) => s.prefs.hiddenHomeWidgets);
  const editLayout = useOS((s) => s.prefs.editLayout);
  const togglePageSection = useOS((s) => s.togglePageSection);
  const off = page === "/home" ? homeHidden.includes(id) : hidden.includes(id);

  if (off && !editLayout) return null;

  if (off && editLayout) {
    return (
      <button
        type="button"
        onClick={() => togglePageSection(page, id)}
        className="w-full rounded-[14px] border border-dashed border-navy/20 bg-white/60 px-4 py-3 text-start text-sm text-navy/45"
      >
        Show section: {label ?? id}
      </button>
    );
  }

  return (
    <div className={editLayout ? "relative rounded-[16px] ring-1 ring-cobalt/25 ring-offset-2 ring-offset-paper" : undefined}>
      {editLayout ? (
        <button
          type="button"
          onClick={() => togglePageSection(page, id)}
          className="absolute -top-2 end-3 z-10 rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
        >
          Hide {label ?? id}
        </button>
      ) : null}
      {children}
    </div>
  );
}
