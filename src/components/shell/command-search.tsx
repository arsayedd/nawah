"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export function CommandSearch() {
  const locale = useOS((s) => s.locale);
  const dict = t(locale);
  const leads = useOS((s) => s.leads);
  const clients = useOS((s) => s.clients);
  const projects = useOS((s) => s.projects);
  const quotes = useOS((s) => s.quotes);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const name = (en: string, ar: string) => (locale === "ar" ? ar : en);
    return [
      ...leads.map((l) => ({
        href: `/crm/${l.id}`,
        label: `${l.company} · ${l.name}`,
        kind: "Lead",
      })),
      ...clients.map((c) => ({
        href: `/clients/${c.id}`,
        label: name(c.name, c.nameAr),
        kind: "Client",
      })),
      ...projects.map((p) => ({
        href: `/projects/${p.id}`,
        label: name(p.name, p.nameAr),
        kind: "Project",
      })),
      ...quotes.map((quote) => ({
        href: `/quotes/${quote.id}`,
        label: `${quote.number} · ${name(quote.title, quote.titleAr)}`,
        kind: "Quote",
      })),
    ]
      .filter((row) => row.label.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [q, leads, clients, projects, quotes, locale]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-navy/8 bg-paper px-3 text-start text-sm text-navy/40"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">{dict.search}</span>
        <kbd className="ms-auto hidden rounded-md border border-navy/10 bg-white px-1.5 py-0.5 text-[10px] font-medium text-navy/45 sm:inline">
          ⌘K
        </kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close search"
          />
          <div className="absolute left-1/2 top-[18%] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 rounded-[18px] bg-white p-3 shadow-2xl">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={dict.search}
              className="h-11 w-full rounded-[10px] border border-navy/10 px-3 text-sm outline-none focus:border-cobalt"
            />
            <div className="mt-2 max-h-72 overflow-y-auto">
              {q && results.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-navy/45">
                  {locale === "ar" ? "لا توجد نتائج." : "No matches."}
                </p>
              ) : (
                results.map((row) => (
                  <Link
                    key={row.href}
                    href={row.href}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex items-center justify-between rounded-[10px] px-3 py-2.5 text-sm hover:bg-paper"
                  >
                    <span>{row.label}</span>
                    <span className="text-[11px] text-navy/40">{row.kind}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
