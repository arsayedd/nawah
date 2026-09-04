"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { useOS } from "@/store/use-os";

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useOS((s) => s.locale);
  const setHydrated = useOS((s) => s.setHydrated);

  useEffect(() => {
    void Promise.resolve(useOS.persist.rehydrate()).then(() => setHydrated(true));
  }, [setHydrated]);

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
