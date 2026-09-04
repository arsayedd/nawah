"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { pageKeyFromPath, sectionsForPath } from "@/lib/page-layout";
import { useOS } from "@/store/use-os";

export function CustomizePageButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const key = pageKeyFromPath(pathname);
  const sections = sectionsForPath(pathname);
  const prefs = useOS((s) => s.prefs);
  const togglePageSection = useOS((s) => s.togglePageSection);
  const toggleNavItem = useOS((s) => s.toggleNavItem);
  const setEditLayout = useOS((s) => s.setEditLayout);

  const hidden =
    key === "/home" ? prefs.hiddenHomeWidgets : (prefs.hiddenPageSections[key] ?? []);

  return (
    <>
      <button
        type="button"
        className="rounded-[10px] p-2 text-navy/70 hover:bg-navy/5"
        aria-label="Customize this page"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Customize this page">
        <p className="mb-3 text-sm text-navy/55">
          Hide blocks on <span className="font-medium text-navy">{key}</span>, turn on layout
          edit to remove records, or hide the whole module from the sidebar.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={prefs.editLayout ? "default" : "outline"}
            onClick={() => setEditLayout(!prefs.editLayout)}
          >
            {prefs.editLayout ? "Editing layout" : "Edit layout"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleNavItem(pathname.split("/").slice(0, 2).join("/") || "/home")}
          >
            Toggle in sidebar
          </Button>
          <Link href="/customize" className="text-sm text-cobalt" onClick={() => setOpen(false)}>
            Open full customize
          </Link>
        </div>
        {sections.length === 0 ? (
          <p className="text-sm text-navy/45">No blocks registered. You can still hide the module.</p>
        ) : (
          <div className="grid gap-2">
            {sections.map((s) => {
              const on = !hidden.includes(s.id);
              return (
                <label
                  key={s.id}
                  className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm"
                >
                  <span>{s.label}</span>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => togglePageSection(key, s.id)}
                  />
                </label>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
