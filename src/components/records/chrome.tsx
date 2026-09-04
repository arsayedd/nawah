"use client";

import type { ReactNode } from "react";
import type { OsState } from "@/lib/types";
import { useOS } from "@/store/use-os";

export type RecordCollection = {
  [K in keyof OsState]: OsState[K] extends Array<{ id: string }> ? K : never;
}[keyof OsState];

export function RecordChrome({
  collection,
  id,
  children,
}: {
  collection: RecordCollection;
  id: string;
  children: ReactNode;
}) {
  const editLayout = useOS((s) => s.prefs.editLayout);
  const removeRecord = useOS((s) => s.removeRecord);

  return (
    <div className="relative">
      {children}
      {editLayout ? (
        <button
          type="button"
          className="absolute top-2 end-2 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-coral shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            removeRecord(collection, id);
          }}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
