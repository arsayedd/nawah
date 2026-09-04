"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
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
  MessageSquare,
  Paperclip,
  Settings,
  Sparkles,
  Timer,
  UserRound,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { NawahLockup } from "@/components/brand/logo";
import { AGENCY_NAME, AGENCY_NAME_AR } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export const SIDEBAR_WIDTH = 264;

const groups: {
  label: string;
  labelAr: string;
  items: { href: string; key: keyof ReturnType<typeof t>["nav"]; icon: LucideIcon }[];
}[] = [
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
      { href: "/accounts", key: "accounts", icon: UserRound },
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
    label: "Agency",
    labelAr: "الإدارة",
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
];

export function SidebarNav({
  locale,
  onNavigate,
}: {
  locale: Locale;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const dict = t(locale);

  return (
    <nav className="nawah-side-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3">
      {groups.map((group) => (
        <div key={group.label} className="mb-4 last:mb-0">
          <div className="px-2.5 pb-1.5 text-[11px] font-medium text-white/45">
            {locale === "ar" ? group.labelAr : group.label}
          </div>
          <div className="flex flex-col gap-px">
            {group.items.map((item) => {
              const active =
                item.href === "/home"
                  ? pathname === "/home"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] leading-none",
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-mint" />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  <span className="truncate">{dict.nav[item.key]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SidebarBrand({ locale }: { locale: Locale }) {
  return (
    <div className="shrink-0 border-b border-white/10 px-4 py-4">
      <Link href="/" className="block">
        <NawahLockup inverted />
      </Link>
      <p className="mt-2 text-[11px] font-medium tracking-wide text-mint/80">
        {locale === "ar" ? "نظام تشغيل الأجنسي" : "Agency OS"}
      </p>
    </div>
  );
}

export function SidebarFooter() {
  return (
    <div className="shrink-0 border-t border-white/10 p-3">
      <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
        <div className="text-[11px] font-semibold tracking-[0.16em] text-white">{AGENCY_NAME}</div>
        <div className="mt-0.5 text-[11px] text-white/45">
          {AGENCY_NAME_AR} · workspace
        </div>
      </div>
    </div>
  );
}
