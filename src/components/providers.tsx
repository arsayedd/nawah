"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { pickOsState } from "@/lib/os/payload";
import { readStoredLocale } from "@/lib/locale";
import { useOS } from "@/store/use-os";

const PUBLIC =
  (pathname: string) =>
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/q/") ||
    pathname.startsWith("/book");

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useOS((s) => s.locale);
  const setHydrated = useOS((s) => s.setHydrated);
  const setLocale = useOS((s) => s.setLocale);
  const persistReady = useRef(false);
  const pending = useRef<number | null>(null);
  const lastSnap = useRef("");

  useEffect(() => {
    const stored = readStoredLocale();
    const now = useOS.getState();
    if (now.locale !== stored) setLocale(stored);
    if (!now.hydrated) setHydrated(true);
  }, [setLocale, setHydrated]);

  useEffect(() => {
    if (PUBLIC(pathname)) {
      persistReady.current = false;
      return;
    }
    persistReady.current = false;
    void fetch("/api/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((auth) => {
        if (!auth?.session) {
          if (!PUBLIC(pathname)) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return null;
        }
        useOS.getState().setSessionKind(auth.session.kind);
        return fetch("/api/os");
      })
      .then(async (res) => {
        if (!res || !res.ok) return;
        const data = await res.json();
        if (data.state) {
          useOS.getState().hydrateFromRemote({
            locale: data.locale ?? "en",
            state: pickOsState(data.state),
            revision: data.revision,
          });
        }
        persistReady.current = data?.session?.kind === "staff";
        lastSnap.current = JSON.stringify(pickOsState(useOS.getState()));
      })
      .catch(() => undefined);
  }, [pathname, router]);

  useEffect(() => {
    async function flush() {
      const state = useOS.getState();
      if (!persistReady.current || state.sessionKind !== "staff") return;
      const snapshot = JSON.stringify(pickOsState(state));
      if (snapshot === lastSnap.current) return;
      state.setSaveStatus("saving");
      const res = await fetch("/api/os", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: state.locale,
          state: pickOsState(state),
          revision: state.revision,
        }),
        keepalive: true,
      });
      if (res.status === 409) {
        state.setSaveStatus("conflict");
        toast.error("A newer copy is on the server. Reload to avoid overwriting it.");
        return;
      }
      if (!res.ok) {
        state.setSaveStatus("error");
        return;
      }
      lastSnap.current = snapshot;
      const data = (await res.json()) as { revision?: number };
      if (data.revision) state.setRevision(data.revision);
      state.setSaveStatus("saved");
    }

    const unsub = useOS.subscribe(() => {
      if (!persistReady.current) return;
      if (pending.current) window.clearTimeout(pending.current);
      pending.current = window.setTimeout(() => {
        void flush();
      }, 400);
    });

    const onHide = () => {
      if (pending.current) {
        window.clearTimeout(pending.current);
        pending.current = null;
      }
      void flush();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    return () => {
      unsub();
      if (pending.current) window.clearTimeout(pending.current);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  useEffect(() => {
    const englishSurface =
      pathname === "/" || pathname.startsWith("/q/") || pathname.startsWith("/book") || pathname === "/login";
    document.documentElement.lang = englishSurface || locale !== "ar" ? "en" : "ar";
    document.documentElement.dir = englishSurface || locale !== "ar" ? "ltr" : "rtl";
  }, [locale, pathname]);

  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster position={locale === "ar" ? "top-left" : "top-right"} richColors />
    </>
  );
}
