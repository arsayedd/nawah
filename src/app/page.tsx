"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
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
import { NawahLockup, NawahMark } from "@/components/brand/logo";
import { AGENCY_NAME } from "@/lib/brand";
import { egp } from "@/lib/utils";
import { useKpis } from "@/store/selectors";
import { useOS } from "@/store/use-os";

const modules = [
  { href: "/map", icon: Workflow, title: "Agency OS map", copy: "Every pillar on one page. Click through to the live module — one data core." },
  { href: "/home", icon: Home, title: "Executive home", copy: "Cash, pipeline, risk, workload, and the decisions that need you today." },
  { href: "/crm", icon: Workflow, title: "CRM & sales", copy: "Leads, pipeline, discovery, forecast. Won becomes delivery — not a dead card." },
  { href: "/accounts", icon: UserRound, title: "Account managers", copy: "Sara’s book: health, overdue invoices, waiting quotes, upsell, next meeting." },
  { href: "/clients", icon: Briefcase, title: "Client 360", copy: "Contacts, projects, contracts, profit, CSAT, and portal access on one page." },
  { href: "/catalog", icon: Sparkles, title: "Service catalog", copy: "Hours, role, cost, sell, revisions, deliverables. Quotes assemble from here." },
  { href: "/quotes", icon: FileText, title: "Quotations", copy: "Live margin, deposit, branded client link, open/accept tracking, PDF." },
  { href: "/contracts", icon: FileText, title: "Contracts", copy: "Accepting a quote drafts the contract. Sign to lock dates." },
  { href: "/projects", icon: FolderKanban, title: "Projects", copy: "ClickUp-class: board, table, gantt, list, calendar, portfolio. Drag tasks." },
  { href: "/my-work", icon: CheckSquare, title: "My work", copy: "Personal queue with tags and blockers. Switch person to see assigned load." },
  { href: "/workload", icon: Users, title: "Workload", copy: "Capacity by person. Auto-assign by skill, hours, and cost." },
  { href: "/retainers", icon: Zap, title: "Retainers", copy: "Monthly hours, consumption, renewal. Generate the cycle: tasks + invoice." },
  { href: "/docs", icon: BookOpen, title: "Docs", copy: "Notion-like wiki, templates, linked databases, comments. Lines become tasks." },
  { href: "/inbox", icon: MessageSquare, title: "Inbox", copy: "Project and client threads. Turn a message into a task without WhatsApp." },
  { href: "/files", icon: Paperclip, title: "Files & review", copy: "Versions on the deliverable. Pins on creative. Clients never see cost." },
  { href: "/portal", icon: Globe, title: "Client portal", copy: "Status, files, approvals, invoices, requests. Internal chatter stays hidden." },
  { href: "/book", icon: CalendarDays, title: "Booking", copy: "Calendly-style event types on the same calendar: discovery, kickoff, review." },
  { href: "/calendar", icon: CalendarDays, title: "Calendar", copy: "Week grid of meetings, open slots, and deadlines — one agency week." },
  { href: "/time", icon: Timer, title: "Time & capacity", copy: "Timers that know cost. Sold vs consumed hours. Overbooked vs idle." },
  { href: "/finance", icon: CircleDollarSign, title: "Finance", copy: "Invoices, record payment, expenses, cash after costs, project P&L." },
  { href: "/hr", icon: Users, title: "People / HR", copy: "Attendance, leave, payroll, commissions, freelancer vs staff, performance." },
  { href: "/team", icon: Users, title: "Team", copy: "Cost rates, bill rates, skills, departments — the same people on quotes." },
  { href: "/analytics", icon: Sparkles, title: "Analytics", copy: "Sales, ops, client health, service profit, people load — same numbers as Home." },
  { href: "/automations", icon: Zap, title: "Automations", copy: "Quote accept already spins the OS. Toggle the rest as the agency grows." },
  { href: "/ai", icon: Bot, title: "Nawah AI", copy: "Answers only from workspace data. No invented numbers." },
  { href: "/settings", icon: Settings, title: "Settings", copy: "Roles, audit log, SaaS seats, integrations placeholders, demo reset." },
];

const loop = [
  "Lead",
  "Opportunity",
  "Quotation",
  "Contract",
  "Client",
  "Project",
  "Tasks",
  "Deliverables",
  "Approval",
  "Invoice",
  "Payment",
  "Real profit",
  "Renewal",
];

const replaces = [
  { from: "Notion", for: "Docs, wiki, databases, SOPs" },
  { from: "ClickUp", for: "Board, gantt, workload, my work" },
  { from: "HubSpot", for: "CRM that continues after Won" },
  { from: "Calendly", for: "Booking types on the agency calendar" },
  { from: "Harvest", for: "Time that knows cost" },
  { from: "Drive", for: "Files on the deliverable" },
  { from: "Slack", for: "Inbox next to the work" },
  { from: "Zapier", for: "Agency automations" },
];

const acceptCascade = [
  "Register the client",
  "Draft the contract",
  "Open the project from a template",
  "Generate tasks",
  "Assign by capacity",
  "Create the deposit invoice",
  "Invite them to the portal",
  "Show expected profit",
  "Start reminders and automations",
];

const walk = [
  { href: "/crm", title: "1. Pipeline", copy: "Drag Bloom Café across stages." },
  { href: "/q/q_bloom", title: "2. Quote", copy: "Open NW-1042 and accept & sign." },
  { href: "/projects", title: "3. Delivery", copy: "Board, assign, approve, log time." },
  { href: "/portal", title: "4. Portal", copy: "Client sees status — never cost." },
  { href: "/finance", title: "5. Cash", copy: "Deposit invoice and real P&L." },
];

export default function MarketingHome() {
  const k = useKpis();
  const alerts = useOS((s) => s.alerts);
  const invoices = useOS((s) => s.invoices);
  const overdueInv = invoices.find((i) => i.status === "overdue");
  const decision = alerts.slice(0, 3).map((a) => a.title);

  return (
    <div dir="ltr" lang="en" className="relative min-h-screen overflow-x-hidden bg-navy font-sans text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-cobalt/30 blur-3xl" />
        <div className="absolute right-[-4rem] top-40 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />
        <div
          className="absolute left-1/2 top-28 h-28 w-28 -translate-x-1/2 rounded-full bg-white/10"
          style={{ animation: "nawah-pulse 4.5s ease-in-out infinite" }}
        />
      </div>

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <NawahLockup inverted />
        <nav className="flex items-center gap-4">
          <a href="#modules" className="hidden text-sm text-white/55 hover:text-white lg:inline">
            Product
          </a>
          <a href="#loop" className="hidden text-sm text-white/55 hover:text-white lg:inline">
            Spine
          </a>
          <a href="#tour" className="hidden text-sm text-white/55 hover:text-white lg:inline">
            Demo
          </a>
          <Link
            href="/home"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-cobalt px-4 text-sm font-medium shadow-[0_10px_28px_rgba(37,99,235,0.35)]"
          >
            Open Agency OS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-8 lg:grid-cols-2 lg:pt-14">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
            نواة · Agency operating system
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Your agency,
            <br />
            in one core.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/65">
            CRM, quotations, ClickUp-class projects, Notion-like docs, account
            managers, calendar, client booking, portal, time, finance, HR, and
            AI — one data spine from first lead to real profit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/home"
              className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-white px-5 text-sm font-semibold text-navy"
            >
              Enter the workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/q/q_bloom"
              className="inline-flex h-12 items-center rounded-[10px] border border-white/15 px-5 text-sm text-white/80 hover:border-white/35"
            >
              Live quotation
            </Link>
            <Link
              href="/book"
              className="inline-flex h-12 items-center rounded-[10px] border border-white/15 px-5 text-sm text-white/80 hover:border-white/35"
            >
              Book a meeting
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="overflow-hidden rounded-[22px] border border-white/15 bg-white text-navy shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-2 border-b border-navy/8 bg-navy px-4 py-3">
              <NawahMark className="h-7 w-7" />
              <span className="text-sm font-semibold text-white">{AGENCY_NAME}</span>
              <span className="ms-auto text-[11px] text-white/50">Owner home</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {[
                ["Revenue", egp(k.revenue, "en")],
                ["Pipeline", egp(k.pipeline, "en")],
                ["Overdue", overdueInv?.number ?? egp(k.overdue, "en")],
                ["Win rate", `${Math.round(k.winRate * 100)}%`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-[12px] bg-paper p-3">
                  <div className="text-[10px] uppercase tracking-wide text-navy/40">{l}</div>
                  <div className="mt-1 text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 px-4 pb-4">
              {(decision.length
                ? decision
                : ["Cairo Bites health 42", "Lina overbooked", "NW-1042 waiting"]
              ).map((row) => (
                <div key={row} className="rounded-[10px] border border-navy/8 px-3 py-2 text-xs">
                  {row}
                </div>
              ))}
            </div>
          </div>
          <div
            className="pointer-events-none absolute -right-6 -top-6 hidden h-24 w-24 sm:block"
            style={{ animation: "nawah-float 6s ease-in-out infinite" }}
          >
            <NawahMark className="h-24 w-24" />
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden border-y border-white/8 py-3">
        <div
          className="flex w-max gap-8 text-[12px] uppercase tracking-[0.18em] text-white/35"
          style={{ animation: "nawah-marquee 28s linear infinite" }}
        >
          {[...loop, ...loop].map((step, i) => (
            <span key={`${step}-${i}`} className="flex items-center gap-8">
              {step}
              <span className="h-1 w-1 rounded-full bg-mint/70" />
            </span>
          ))}
        </div>
      </div>

      <section id="loop" className="relative z-10 mx-auto max-w-6xl px-5 py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          The spine
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          One loop. Every module hangs on it.
        </h2>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {loop.map((step, i) => (
            <div
              key={step}
              className="flex shrink-0 items-center gap-2"
            >
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm">{step}</span>
              {i < loop.length - 1 ? <ArrowRight className="h-3.5 w-3.5 text-mint/80" /> : null}
            </div>
          ))}
        </div>
      </section>

      <section id="accept" className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
              Quote accept
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              One click starts the agency.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              Bloom Café quotation NW-1042 is live. Accept it and Nawah registers
              the client, drafts the contract, opens the project, assigns the
              team, invoices the deposit, and invites them to the portal.
            </p>
            <Link href="/q/q_bloom" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-mint">
              Open NW-1042
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {acceptCascade.map((line) => (
              <div
                key={line}
                className="flex items-center gap-3 rounded-[12px] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" />
                <span className="text-sm text-white/80">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tour" className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Demo path</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Walk the core in five clicks.</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {walk.map((s) => (
            <div key={s.title}>
              <Link href={s.href} className="block h-full rounded-[16px] border border-white/10 bg-white/[0.04] p-4 hover:border-mint/40">
                <div className="text-sm font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-white/55">{s.copy}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="modules" className="relative z-10 mx-auto max-w-6xl px-5 py-8 pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">Everything in the OS</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Nothing lives in another tab.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-white/50">
          Every card opens the live workspace. Same data. English first.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
              >
                <Link
                  href={m.href}
                  className="block h-full rounded-[18px] border border-white/10 bg-white/[0.04] p-5 hover:border-mint/45"
                >
                  <Icon className="h-5 w-5 text-mint" />
                  <h3 className="mt-4 font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{m.copy}</p>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div
            className="rounded-[22px] border border-white/10 bg-gradient-to-br from-cobalt/35 to-transparent p-8"
          >
            <Bot className="h-6 w-6 text-mint" />
            <h2 className="mt-4 text-2xl font-semibold">The difference is money</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Nawah does not try to beat Notion at writing or ClickUp at feature
              count. It tells the owner: is this project still profitable, who is
              over capacity, which service is underpriced, and what needs a
              decision today.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {replaces.map((r) => (
              <div
                key={r.from}
                className="rounded-[16px] border border-white/10 p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                  Instead of {r.from}
                </div>
                <div className="mt-1 text-sm font-medium">{r.for}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <div
          className="overflow-hidden rounded-[28px] bg-white px-8 py-12 text-navy md:px-14"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cobalt">
            Clearer decisions. Faster delivery.
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Open the core and run the agency from here.
          </h2>
          <p className="mt-3 max-w-xl text-navy/60">
            Demo workspace for a modern agency. English first. Arabic toggle inside the OS.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/home" className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-navy px-6 text-sm font-semibold text-white">
              Launch Nawah
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portal" className="inline-flex h-12 items-center rounded-[10px] border border-navy/15 px-6 text-sm font-medium text-navy/70">
              Client portal
            </Link>
            <Link href="/docs" className="inline-flex h-12 items-center rounded-[10px] border border-navy/15 px-6 text-sm font-medium text-navy/70">
              Wiki
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Win work", l: [["/crm", "Pipeline"], ["/accounts", "Accounts"], ["/quotes", "Quotes"], ["/catalog", "Catalog"]] },
            { t: "Deliver", l: [["/projects", "Projects"], ["/docs", "Docs"], ["/inbox", "Inbox"], ["/portal", "Portal"]] },
            { t: "Run", l: [["/finance", "Finance"], ["/time", "Time"], ["/hr", "People"], ["/analytics", "Analytics"]] },
            { t: "Schedule", l: [["/calendar", "Calendar"], ["/book", "Booking"], ["/workload", "Workload"], ["/ai", "Nawah AI"]] },
          ].map((col) => (
            <div key={col.t}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">{col.t}</div>
              <div className="mt-3 space-y-2">
                {col.l.map(([href, label]) => (
                  <Link key={href} href={href} className="block text-sm text-white/70 hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-white/35">Nawah · نواة · All-in-one operating system for modern agencies</p>
      </footer>
    </div>
  );
}
