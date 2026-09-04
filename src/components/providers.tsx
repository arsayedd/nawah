"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { pickOsState } from "@/lib/os/payload";
import { useOS } from "@/store/use-os";

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useOS((s) => s.locale);
  const hydrateFromRemote = useOS((s) => s.hydrateFromRemote);
  const setHydrated = useOS((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/os")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        hydrateFromRemote({ locale: data.locale, state: data.state });
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrateFromRemote, setHydrated]);

  useEffect(() => {
    let timer: number | undefined;
    const unsub = useOS.subscribe((state) => {
      if (!state.hydrated) return;
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
      }, 500);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "ar" ? "ar" : "en";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster position={locale === "ar" ? "top-left" : "top-right"} richColors />
    </>
  );
}
