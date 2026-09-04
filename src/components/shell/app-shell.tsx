"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  FileText,
  FolderKanban,
  Globe,
  Home,
  Menu,
  MessageSquare,
  Paperclip,
  Plus,
  Settings,
  Sparkles,
  Timer,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NawahLockup } from "@/components/brand/logo";
import { CommandSearch } from "@/components/shell/command-search";
import { QuickAdd } from "@/components/shell/quick-add";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { writeStoredLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const groups = [
  {
    label: "Operate",
    labelAr: "تشغيل",
    items: [
      { href: "/home", key: "home", icon: Home },
      { href: "/my-work", key: "myWork", icon: CheckSquare },
      { href: "/projects", key: "projects", icon: FolderKanban },
      { href: "/calendar", key: "calendar", icon: CalendarDays },
      { href: "/time", key: "time", icon: Timer },
      { href: "/workload", key: "workload", icon: Users },
    ],
  },
  {
    label: "Win work",
    labelAr: "المبيعات",
    items: [
      { href: "/crm", key: "crm", icon: Workflow },
      { href: "/clients", key: "clients", icon: Briefcase },
      { href: "/quotes", key: "quotes", icon: FileText },
      { href: "/catalog", key: "catalog", icon: Sparkles },
    ],
  },
  {
    label: "Delivery",
    labelAr: "التسليم",
    items: [
      { href: "/docs", key: "docs", icon: BookOpen },
      { href: "/inbox", key: "inbox", icon: MessageSquare },
      { href: "/files", key: "files", icon: Paperclip },
      { href: "/portal", key: "portal", icon: Globe },
    ],
  },
  {
    label: "Run the agency",
    labelAr: "إدارة",
    items: [
      { href: "/finance", key: "finance", icon: CircleDollarSign },
      { href: "/contracts", key: "contracts", icon: FileText },
      { href: "/retainers", key: "retainers", icon: Zap },
      { href: "/analytics", key: "analytics", icon: Sparkles },
      { href: "/automations", key: "automations", icon: Zap },
      { href: "/ai", key: "ai", icon: Bot },
      { href: "/team", key: "team", icon: Users },
      { href: "/hr", key: "hr", icon: Users },
      { href: "/settings", key: "settings", icon: Settings },
    ],
  },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useOS((s) => s.locale);
  const setLocale = useOS((s) => s.setLocale);
  const alerts = useOS((s) => s.alerts);
  const hydrated = useOS((s) => s.hydrated);
  const dict = t(locale);
  const [quick, setQuick] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setMobileNav(false);
    setNotesOpen(false);
  }, [pathname]);

  if (pathname === "/" || pathname.startsWith("/q/") || pathname.startsWith("/book")) {
    return <>{children}</>;
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            {locale === "ar" ? group.labelAr : group.label}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/home"
                  ? pathname === "/home"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-cobalt text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]"
                      : "text-white/65 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                  {dict.nav[item.key]}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-paper text-navy",
        locale === "ar" ? "font-cairo" : "font-sans",
      )}
    >
      <aside className="fixed inset-y-0 z-40 hidden w-[260px] flex-col bg-navy text-white lg:flex">
        <div className="px-5 py-6">
          <Link href="/">
            <NawahLockup inverted />
          </Link>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
            {dict.tagline}
          </p>
        </div>
        {nav}
        <div className="border-t border-white/8 px-5 py-4">
          <div className="text-[11px] font-medium text-white/55">Masar Digital</div>
          <div className="text-[11px] text-white/35">Agency workspace</div>
        </div>
      </aside>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/50"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 start-0 z-10 flex w-[min(280px,86vw)] flex-col bg-navy text-white shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4">
              <NawahLockup inverted />
              <button onClick={() => setMobileNav(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="lg:ps-[260px]">
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
          <div className="relative">
            <button
              className="relative rounded-[10px] p-2 text-navy/70 hover:bg-navy/5"
              aria-label="Notifications"
              onClick={() => setNotesOpen((v) => !v)}
            >
              <Bell className="h-5 w-5" />
              {alerts.length ? (
                <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />
              ) : null}
            </button>
            {notesOpen ? (
              <div className="absolute end-0 top-11 z-40 w-[min(360px,calc(100vw-32px))] rounded-[14px] border border-navy/8 bg-white p-2 shadow-xl">
                {alerts.slice(0, 6).map((a) => (
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
          <div className="hidden items-center gap-2 sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-semibold text-white">
              Ah
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Ahmed Raafat</div>
              <div className="text-[11px] text-navy/50">Owner</div>
            </div>
          </div>
        </header>
        <main className="px-4 py-7 md:px-8">
          {hydrated ? (
            children
          ) : (
            <div className="space-y-4">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-navy/8" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-[14px] bg-white" />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <QuickAdd open={quick} onOpenChange={setQuick} />
    </div>
  );
}
