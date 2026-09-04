"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  SIDEBAR_WIDTH,
  SidebarBrand,
  SidebarFooter,
  SidebarNav,
} from "@/components/shell/sidebar";
import { CommandSearch } from "@/components/shell/command-search";
import { CustomizePageButton } from "@/components/shell/customize-page";
import { PageComposer } from "@/components/shell/page-composer";
import { QuickAdd } from "@/components/shell/quick-add";
import { Button } from "@/components/ui/button";
import { canAccessPath } from "@/lib/access";
import { t } from "@/lib/i18n";
import { writeStoredLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useOS((s) => s.locale);
  const setLocale = useOS((s) => s.setLocale);
  const alerts = useOS((s) => s.alerts);
  const employees = useOS((s) => s.employees);
  const meId = useOS((s) => s.prefs.currentUserId);
  const saveStatus = useOS((s) => s.saveStatus);
  const notices = useOS((s) => s.notices);
  const markNoticeRead = useOS((s) => s.markNoticeRead);
  const editLayout = useOS((s) => s.prefs.editLayout);
  const setEditLayout = useOS((s) => s.setEditLayout);
  const dict = t(locale);
  const me = employees.find((e) => e.id === meId);
  const unread = notices.filter((n) => n.userId === meId && !n.read);
  const [quick, setQuick] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setMobileNav(false);
    setNotesOpen(false);
  }, [pathname]);

  if (
    pathname === "/" ||
    pathname.startsWith("/q/") ||
    pathname.startsWith("/book") ||
    pathname === "/login" ||
    pathname.startsWith("/portal")
  ) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-paper text-navy",
        locale === "ar"
          ? "[font-family:var(--font-cairo),var(--font-inter),sans-serif]"
          : "font-sans",
      )}
    >
      <aside
        className="fixed inset-y-0 start-0 z-40 hidden flex-col overflow-hidden border-e border-white/10 bg-navy text-white lg:flex"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <SidebarBrand locale={locale} />
        <SidebarNav locale={locale} />
        <SidebarFooter />
      </aside>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/50"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 start-0 z-10 flex w-[min(280px,86vw)] flex-col overflow-hidden bg-navy text-white shadow-2xl">
            <div className="relative shrink-0">
              <SidebarBrand locale={locale} />
              <button
                className="absolute end-2 top-3 rounded-lg p-2 text-white/70 hover:bg-white/10"
                onClick={() => setMobileNav(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav locale={locale} onNavigate={() => setMobileNav(false)} />
            <SidebarFooter />
          </aside>
        </div>
      ) : null}

      <div className="lg:ps-[264px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy/8 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-[10px] p-2 text-navy lg:hidden"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <CommandSearch />
          <Button size="sm" onClick={() => setQuick(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{dict.quickAdd}</span>
          </Button>
          <CustomizePageButton />
          <div className="relative">
            <button
              className="relative rounded-[10px] p-2 text-navy/70 hover:bg-navy/5"
              aria-label="Notifications"
              onClick={() => setNotesOpen((v) => !v)}
            >
              <Bell className="h-5 w-5" />
              {unread.length || alerts.length ? (
                <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />
              ) : null}
            </button>
            {notesOpen ? (
              <div className="absolute end-0 top-11 z-40 w-[min(360px,calc(100vw-32px))] rounded-[14px] border border-navy/8 bg-white p-2 shadow-xl">
                <Link
                  href="/notifications"
                  className="block px-3 py-2 text-xs font-semibold text-cobalt"
                  onClick={() => setNotesOpen(false)}
                >
                  Open notifications
                </Link>
                {unread.slice(0, 6).map((n) => (
                  <Link
                    key={n.id}
                    href={n.href ?? "/notifications"}
                    className="block rounded-[10px] px-3 py-2.5 text-sm hover:bg-paper"
                    onClick={() => {
                      markNoticeRead(n.id);
                      setNotesOpen(false);
                    }}
                  >
                    {n.title}
                  </Link>
                ))}
                {alerts.slice(0, 4).map((a) => (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="block rounded-[10px] px-3 py-2.5 text-sm hover:bg-paper"
                    onClick={() => setNotesOpen(false)}
                  >
                    {locale === "ar" ? a.titleAr : a.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <span className="hidden text-[11px] text-navy/40 sm:inline">
            {saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "saved"
                ? "Saved"
                : saveStatus === "conflict"
                  ? "Newer copy on server"
                  : saveStatus === "error"
                    ? "Save failed"
                    : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              const next = locale === "ar" ? "en" : "ar";
              writeStoredLocale(next);
              setLocale(next);
            }}
            className="rounded-[10px] border border-navy/10 px-2.5 py-1.5 text-xs font-semibold"
            aria-label={locale === "ar" ? "Switch to English" : "Switch to Arabic"}
          >
            {locale === "ar" ? "EN" : "AR"}
          </button>
          <Link href="/login" className="text-xs text-navy/50 hover:text-navy">
            Switch account
          </Link>
          <button
            type="button"
            className="text-xs text-navy/50 hover:text-coral"
            onClick={() => {
              void fetch("/api/session", { method: "DELETE" }).then(() => {
                window.location.href = "/login";
              });
            }}
          >
            Log out
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-semibold text-white">
              {(me?.name ?? "Ah").slice(0, 2)}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{me?.name ?? "Ahmed Raafat"}</div>
              <div className="text-[11px] text-navy/50">{me?.role ?? "Owner"}</div>
            </div>
          </div>
        </header>
        {editLayout ? (
          <div className="flex items-center justify-between gap-3 bg-navy px-4 py-2 text-xs text-white md:px-8">
            <span>Layout edit is on. Hide any block, or remove a record from this page.</span>
            <button type="button" className="font-semibold text-mint" onClick={() => setEditLayout(false)}>
              Done
            </button>
          </div>
        ) : null}
        <main className="px-4 py-7 text-[#071B3A] md:px-8">
          <ErrorBoundary>
            {canAccessPath(me, pathname) ? (
              <>
                <PageComposer />
                {children}
              </>
            ) : (
              <div className="rounded-[16px] border border-navy/10 bg-white p-8">
                <h1 className="text-xl font-semibold">No access</h1>
                <p className="mt-2 text-sm text-navy/55">
                  {me?.name} cannot open this module. Change their role under People.
                </p>
                <Link href="/people" className="mt-3 inline-block text-sm text-cobalt">
                  Open people
                </Link>
              </div>
            )}
          </ErrorBoundary>
        </main>
      </div>
      <QuickAdd open={quick} onOpenChange={setQuick} />
    </div>
  );
}
