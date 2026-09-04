"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { pickOsState } from "@/lib/os/payload";
import { readStoredLocale } from "@/lib/locale";
import { useOS } from "@/store/use-os";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useOS((s) => s.locale);
  const hydrateFromRemote = useOS((s) => s.hydrateFromRemote);
  const setHydrated = useOS((s) => s.setHydrated);
  const setLocale = useOS((s) => s.setLocale);
  const persistReady = useRef(false);

  useEffect(() => {
    setLocale(readStoredLocale());
  }, [setLocale]);

  useEffect(() => {
    const ac = new AbortController();
    const timer = window.setTimeout(() => ac.abort(), 8000);

    void fetch("/api/os", { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        const next = pickOsState(data?.state);
        persistReady.current = true;
        hydrateFromRemote({ locale: readStoredLocale(), state: next });
      })
      .catch(() => {
        setHydrated(true);
      })
      .finally(() => {
        window.clearTimeout(timer);
        persistReady.current = true;
      });

    return () => {
      window.clearTimeout(timer);
    };
  }, [hydrateFromRemote, setHydrated]);

  useEffect(() => {
    let timer: number | undefined;
    const unsub = useOS.subscribe((state) => {
      if (!persistReady.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void fetch("/api/os", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locale: state.locale,
            state: pickOsState(state),
          }),
        });
      }, 800);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const englishSurface =
      pathname === "/" || pathname.startsWith("/q/") || pathname.startsWith("/book");
    document.documentElement.lang =
      englishSurface || locale !== "ar" ? "en" : "ar";
    document.documentElement.dir =
      englishSurface || locale !== "ar" ? "ltr" : "rtl";
  }, [locale, pathname]);

  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster position={locale === "ar" ? "top-left" : "top-right"} richColors />
    </>
  );
}
