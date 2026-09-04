"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { isSparseState, pickOsState } from "@/lib/os/payload";
import { readStoredLocale } from "@/lib/locale";
import { useOS } from "@/store/use-os";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useOS((s) => s.locale);
  const setHydrated = useOS((s) => s.setHydrated);
  const setLocale = useOS((s) => s.setLocale);
  const persistReady = useRef(false);

  useEffect(() => {
    const stored = readStoredLocale();
    const now = useOS.getState();
    if (now.locale !== stored) setLocale(stored);
    if (!now.hydrated) setHydrated(true);
    persistReady.current = true;
  }, [setLocale, setHydrated]);

  useEffect(() => {
    void fetch("/api/os")
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && isSparseState(data.state)) {
          void fetch("/api/os/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale: "en" }),
          });
        }
      })
      .catch(() => undefined);
  }, []);

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
