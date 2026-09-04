"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
  Globe,
  MessageSquare,
  Paperclip,
  Sparkles,
  Timer,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { NawahLockup, NawahMark } from "@/components/brand/logo";

const modules = [
  {
    icon: Workflow,
    title: "CRM & sales",
    copy: "Leads, pipeline, discovery, and forecast. A won deal becomes delivery — not a dead card.",
  },
  {
    icon: Sparkles,
    title: "Quotations",
    copy: "Catalog, hours, team cost, and live margin. Branded PDF. Accept tracking from the client.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    copy: "Board, table, and gantt. Approvals, retainers, revisions, and capacity-aware assignment.",
  },
  {
    icon: BookOpen,
    title: "Docs",
    copy: "Wiki, briefs, and SOPs that turn into checklists so delivery does not live in a side doc.",
  },
  {
    icon: MessageSquare,
    title: "Inbox",
    copy: "Project and client threads next to the work. Status stays in Nawah, not WhatsApp.",
  },
  {
    icon: Paperclip,
    title: "Files & review",
    copy: "Versions on the deliverable. Clients mark up without seeing internal cost or chatter.",
  },
  {
    icon: Globe,
    title: "Client portal",
    copy: "Status, files, and approvals in one guest surface. Never internal rates or team notes.",
  },
  {
    icon: Timer,
    title: "Time & capacity",
    copy: "Timers that know cost. Who is over booked this week, and what that does to margin.",
  },
  {
    icon: CircleDollarSign,
    title: "Finance",
    copy: "Deposit invoices, expenses, SaaS burn, and real project P&L — not a spreadsheet after the fact.",
  },
  {
    icon: Users,
    title: "Team",
    copy: "Roles, workload, and cost rates. The same people who appear on quotes and timesheets.",
  },
  {
    icon: Zap,
    title: "Automations",
    copy: "Accept a quote and the OS spins: client, contract draft, project, tasks, invoice, portal invite.",
  },
  {
    icon: Bot,
    title: "Nawah AI",
    copy: "Answers only from workspace data. No invented numbers, no generic chat pretending to be ops.",
  },
];

const loop = [
  "Lead",
  "Quote",
  "Scope",
  "Hours",
  "Team cost",
  "Project",
  "Approval",
  "Invoice",
  "Payment",
  "Real profit",
  "Renewal",
];

const replaces = [
  { from: "Notion", for: "Docs, wiki, SOPs" },
  { from: "ClickUp", for: "Projects, tasks, workload" },
  { from: "HubSpot", for: "CRM that continues after Won" },
  { from: "Harvest", for: "Time that knows cost" },
  { from: "Drive", for: "Files on the deliverable" },
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
];

const orbits = [
  { label: "Clients", delay: "0s", orbit: "132px" },
  { label: "Team", delay: "-4s", orbit: "158px" },
  { label: "Delivery", delay: "-8s", orbit: "184px" },
];

export default function LandingPage() {
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
        <nav className="flex items-center gap-5">
          <a href="#modules" className="hidden text-sm text-white/55 hover:text-white md:inline">
            Product
          </a>
          <a href="#loop" className="hidden text-sm text-white/55 hover:text-white md:inline">
            Spine
          </a>
          <a href="#accept" className="hidden text-sm text-white/55 hover:text-white md:inline">
            Quote accept
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
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-mint"
          >
            Agency operating system
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl"
          >
            Your agency,
            <br />
            in one core.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-lg text-lg leading-8 text-white/65"
          >
            Nawah is not another task list. It is the spine from first lead to
            cash in the bank — CRM, quotes, projects, docs, portal, time, and
            finance sharing one source of truth.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-8 flex flex-wrap gap-3"
          >
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
              See a live quotation
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-white/40"
          >
            Demo workspace · Masar Digital · English first
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto grid h-[380px] w-full max-w-[380px] place-items-center"
        >
          <div
            className="absolute h-56 w-56 rounded-full border border-white/10"
            style={{ animation: "nawah-pulse 5s ease-in-out infinite" }}
          />
          <div className="absolute h-72 w-72 rounded-full border border-dashed border-white/10" />
          <motion.div
            initial={{ rotate: -48, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={{ animation: "nawah-float 6s ease-in-out infinite" }}
          >
            <NawahMark className="h-52 w-52" />
          </motion.div>
          {orbits.map((item) => (
            <span
              key={item.label}
              className="absolute left-1/2 top-1/2 text-[11px] tracking-wide text-white/80"
              style={{
                animation: "nawah-orbit 14s linear infinite",
                animationDelay: item.delay,
                ["--orbit" as string]: item.orbit,
              }}
            >
              <span className="block -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-navy/80 px-3 py-1 backdrop-blur-sm">
                {item.label}
              </span>
            </span>
          ))}
        </motion.div>
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
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex shrink-0 items-center gap-2"
            >
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm">{step}</span>
              {i < loop.length - 1 ? (
                <ArrowRight className="h-3.5 w-3.5 text-mint/80" />
              ) : null}
            </motion.div>
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
              One click should start the agency — not a checklist in Slack.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/55">
              When a client accepts a quotation, Nawah does the work owners
              usually chase by hand. The demo path is Bloom Café, quote NW-1042.
            </p>
            <Link
              href="/q/q_bloom"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-mint"
            >
              Open NW-1042
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {acceptCascade.map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-[12px] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-mint" />
                <span className="text-sm text-white/80">{line}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="relative z-10 mx-auto max-w-6xl px-5 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">
            Everything in the OS
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Not another task app.
            <br />
            The operating system.
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, borderColor: "rgba(25,211,174,0.45)" }}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] p-5"
              >
                <Icon className="h-5 w-5 text-mint" />
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{m.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[22px] border border-white/10 bg-gradient-to-br from-cobalt/35 to-transparent p-8"
          >
            <Bot className="h-6 w-6 text-mint" />
            <h2 className="mt-4 text-2xl font-semibold">The difference is money</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Nawah does not try to beat Notion at writing or ClickUp at feature
              count. It tells the owner: is this project still profitable, who
              is over capacity, which service is underpriced, and what needs a
              decision today.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {replaces.map((r, i) => (
              <motion.div
                key={r.from}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[16px] border border-white/10 p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                  Instead of {r.from}
                </div>
                <div className="mt-1 text-sm font-medium">{r.for}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[28px] bg-white px-8 py-12 text-navy md:px-14"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cobalt">
            Clearer decisions. Faster delivery.
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Open the core and run the agency from here.
          </h2>
          <p className="mt-3 max-w-xl text-navy/60">
            Demo workspace is live: pipeline, Bloom Café quotation NW-1042,
            client portal, and profitability — in English.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/home"
              className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-navy px-6 text-sm font-semibold text-white"
            >
              Launch Nawah
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/q/q_bloom"
              className="inline-flex h-12 items-center rounded-[10px] border border-navy/15 px-6 text-sm font-medium text-navy/70"
            >
              Client-facing quote
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-5 py-8 text-center text-xs text-white/35">
        Nawah · نواة · All-in-one operating system for modern agencies
      </footer>
    </div>
  );
}
