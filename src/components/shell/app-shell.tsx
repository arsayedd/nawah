"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Home,
  Kanban,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NawahLockup } from "@/components/brand/logo";
import { QuickAdd } from "@/components/shell/quick-add";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const items = [
  { href: "/", key: "home", icon: Home },
  { href: "/my-work", key: "myWork", icon: Kanban },
  { href: "/crm", key: "crm", icon: LayoutDashboard },
  { href: "/clients", key: "clients", icon: Briefcase },
  { href: "/quotes", key: "quotes", icon: FileText },
  { href: "/projects", key: "projects", icon: Kanban },
  { href: "/docs", key: "docs", icon: BookOpen },
  { href: "/calendar", key: "calendar", icon: CalendarDays },
  { href: "/finance", key: "finance", icon: CircleDollarSign },
  { href: "/team", key: "team", icon: Users },
  { href: "/portal", key: "portal", icon: Briefcase },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useOS((s) => s.locale);
  const setLocale = useOS((s) => s.setLocale);
  const alerts = useOS((s) => s.alerts);
  const dict = t(locale);
  const [quick, setQuick] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const isPortal = pathname.startsWith("/portal") || pathname.startsWith("/q/");

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  if (isPortal && pathname.startsWith("/q/")) {
    return <>{children}</>;
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors",
              active
                ? "bg-cobalt text-white"
                : "text-white/70 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {dict.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-paper text-navy",
        locale === "ar" ? "font-cairo" : "font-sans",
      )}
    >
      <aside className="fixed inset-y-0 z-40 hidden w-[248px] flex-col bg-navy text-white lg:flex">
        <div className="px-5 py-6">
          <NawahLockup inverted />
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
            {dict.tagline}
          </p>
        </div>
        {nav}
        <div className="p-4 text-[11px] text-white/40">
          Masar Digital · Workspace
        </div>
      </aside>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/50"
            onClick={() => setMobileNav(false)}
            aria-label="Close"
          />
          <aside className="absolute inset-y-0 flex w-[248px] flex-col bg-navy text-white start-0">
            <div className="flex items-center justify-between px-4 py-4">
              <NawahLockup inverted />
              <button onClick={() => setMobileNav(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="lg:ps-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-navy/8 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-[10px] p-2 text-navy lg:hidden"
            onClick={() => setMobileNav(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-navy/35 start-3" />
            <input
              className="h-10 w-full rounded-[10px] border border-navy/8 bg-paper ps-10 pe-3 text-sm outline-none placeholder:text-navy/35"
              placeholder={dict.search}
            />
          </div>
          <Button size="sm" onClick={() => setQuick(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{dict.quickAdd}</span>
          </Button>
          <button
            className="relative rounded-[10px] p-2 text-navy/70 hover:bg-navy/5"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {alerts.length ? (
              <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />
            ) : null}
          </button>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            className="hidden rounded-[10px] border border-navy/10 px-2.5 py-1.5 text-xs font-semibold sm:block"
          >
            {locale === "ar" ? "EN" : "عربي"}
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-semibold text-white">
              AR
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Ahmed</div>
              <div className="text-[11px] text-navy/50">Owner</div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
      <QuickAdd open={quick} onOpenChange={setQuick} />
    </div>
  );
}
