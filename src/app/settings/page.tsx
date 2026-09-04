"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AGENCY_NAME } from "@/lib/brand";
import { t } from "@/lib/i18n";
import type { SaasSub } from "@/lib/types";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const COVERED = [
  { from: "ClickUp / Asana / Monday", to: "Projects, My work, Workload", href: "/projects" },
  { from: "Notion / Confluence", to: "Docs", href: "/docs" },
  { from: "Slack / Teams", to: "Chat & Inbox", href: "/chat" },
  { from: "Gmail threads", to: "Mail", href: "/mail" },
  { from: "Calendly", to: "Booking + Calendar", href: "/calendar" },
  { from: "Harvest / Toggl", to: "Time", href: "/time" },
  { from: "HubSpot pipeline", to: "CRM", href: "/crm" },
] as const;

export default function SettingsPage() {
  const locale = useOS((s) => s.locale);
  const resetDemo = useOS((s) => s.resetDemo);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.settings}</h1>
      <PageSection page="/settings" id="workspace" label="Workspace">
      <Card>
        <h2 className="font-semibold">
          {locale === "ar" ? "مساحة العمل" : "Workspace"}
        </h2>
        <p className="mt-1 text-sm text-navy/55">{AGENCY_NAME} · EGP · VAT 14%</p>
        <p className="mt-2 text-sm text-navy/55">
          {locale === "ar"
            ? "الأدوار: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."
            : "Roles: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => resetDemo()}>
          {dict.reset}
        </Button>
      </Card>
      </PageSection>
      <SupabaseCard locale={locale} />
      <SaasCard locale={locale} />
      <Card>
        <h2 className="font-semibold">Roles</h2>
        <p className="mt-1 text-sm text-navy/55">
          Field-level finance lock is enforced in the portal (clients never see cost). Workspace roles below are the operating model.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-navy/40">
                <th className="py-2 text-start">Role</th>
                <th className="text-start">CRM</th>
                <th className="text-start">Delivery</th>
                <th className="text-start">Money</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Owner", "Full", "Full", "Full"],
                ["Account Manager", "Clients", "Comments", "Invoices send"],
                ["Project Manager", "Read", "Full", "Hidden cost"],
                ["Finance", "Read", "Read", "Full"],
                ["Freelancer", "None", "Assigned tasks", "None"],
                ["Client", "None", "Portal only", "Pay / approve"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-navy/6">
                  {row.map((c, i) => (
                    <td key={`${row[0]}-${i}`} className="py-2">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AuditCard />
      <Card>
        <h2 className="mb-3 font-semibold">API & webhooks</h2>
        <p className="mb-3 text-sm text-navy/55">
          Workspace events can POST to your URL. Keys stay in this tenant — never across agencies.
        </p>
        <div className="space-y-2 text-sm">
          <div className="rounded-[10px] bg-paper px-3 py-2 font-mono text-xs">POST /api/os · workspace snapshot</div>
          <div className="rounded-[10px] bg-paper px-3 py-2">quote.accepted · invoice.overdue · task.late · retainer.ending</div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Already in Nawah</h2>
        <p className="mb-3 text-sm text-navy/55">
          These are live modules — not “Connect” placeholders. Open them and work.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {COVERED.map((row) => (
            <Link
              key={row.href + row.from}
              href={row.href}
              className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm hover:border-cobalt/40"
            >
              <span>
                <span className="text-navy/45">{row.from}</span>
                <span className="mx-2 text-navy/25">→</span>
                <span className="font-medium">{row.to}</span>
              </span>
              <span className="text-xs text-cobalt">Open</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SaasCard({ locale }: { locale: "ar" | "en" }) {
  const subscriptions = useOS((s) => s.subscriptions);
  const upsertSubscription = useOS((s) => s.upsertSubscription);
  const removeRecord = useOS((s) => s.removeRecord);
  const [name, setName] = useState("");
  const [monthly, setMonthly] = useState("");
  const [seats, setSeats] = useState("1");
  const spend = subscriptions.filter((s) => !s.replacesHref).reduce((n, s) => n + s.monthly, 0);
  const recoverable = subscriptions.filter((s) => s.replacesHref).reduce((n, s) => n + s.monthly, 0);

  function patch(tool: SaasSub, field: "used" | "seats" | "monthly" | "renew", value: string) {
    const n = field === "renew" ? 0 : Number(value);
    upsertSubscription({
      ...tool,
      [field]: field === "renew" ? value : Number.isFinite(n) ? n : tool[field],
    });
  }

  return (
    <PageSection page="/settings" id="saas" label="SaaS subscriptions">
      <Card>
        <h2 className="font-semibold">{locale === "ar" ? "اشتراكات الأدوات" : "Tool subscriptions"}</h2>
        <p className="mt-1 text-sm text-navy/55">
          Track Adobe, Figma, and the rest you still pay. ClickUp and Notion already live in this OS — open the module
          instead of keeping empty seats.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-paper px-3 py-1">
            Still paying {egp(spend, locale)} / month
          </span>
          {recoverable ? (
            <span className="rounded-full bg-mint/15 px-3 py-1 text-navy">
              Can drop {egp(recoverable, locale)} / month
            </span>
          ) : null}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-navy/40">
                <th className="pb-2 text-start">Tool</th>
                <th className="text-start">Used / seats</th>
                <th className="text-start">Monthly</th>
                <th className="text-start">Renews</th>
                <th className="text-start">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((tool) => {
                const idle = Math.max(0, tool.seats - tool.used);
                return (
                  <tr key={tool.id} className="border-t border-navy/6">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-[11px] text-navy/40">{tool.plan}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1">
                        <input
                          className="h-8 w-12 rounded-[8px] border border-navy/10 px-1 text-center text-sm"
                          value={tool.used}
                          onChange={(e) => patch(tool, "used", e.target.value)}
                        />
                        <span className="text-navy/40">/</span>
                        <input
                          className="h-8 w-12 rounded-[8px] border border-navy/10 px-1 text-center text-sm"
                          value={tool.seats}
                          onChange={(e) => patch(tool, "seats", e.target.value)}
                        />
                      </div>
                      {idle > 0 && !tool.replacesHref ? (
                        <div className="mt-0.5 text-[11px] text-navy/40">{idle} idle</div>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3">
                      <input
                        className="h-8 w-24 rounded-[8px] border border-navy/10 px-2 text-sm"
                        value={tool.monthly}
                        onChange={(e) => patch(tool, "monthly", e.target.value)}
                      />
                    </td>
                    <td className="py-2.5 pr-3">
                      <input
                        type="date"
                        className="h-8 rounded-[8px] border border-navy/10 px-2 text-sm"
                        value={tool.renew}
                        onChange={(e) => patch(tool, "renew", e.target.value)}
                      />
                    </td>
                    <td className="py-2.5">
                      {tool.replacesHref ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={tool.replacesHref} className="text-xs font-medium text-cobalt">
                            Open {tool.replacesLabel}
                          </Link>
                          <button
                            type="button"
                            className="text-[11px] text-navy/40 hover:text-coral"
                            onClick={() => removeRecord("subscriptions", tool.id)}
                          >
                            Drop seat
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-navy/40">Keep — creative tool</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            upsertSubscription({
              name: name.trim(),
              monthly: Number(monthly) || 0,
              seats: Number(seats) || 1,
              used: 1,
            });
            setName("");
            setMonthly("");
            setSeats("1");
          }}
        >
          <Input placeholder="Add a tool (Canva, Later…)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input className="sm:max-w-[120px]" placeholder="EGP / mo" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          <Input className="sm:max-w-[80px]" placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} />
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </Card>
    </PageSection>
  );
}

function AuditCard() {
  const audit = useOS((s) => s.audit);
  const employees = useOS((s) => s.employees);
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Audit log</h2>
      {audit.map((e) => (
        <div key={e.id} className="border-b border-navy/6 py-2 text-sm">
          <div className="font-medium">{e.action}</div>
          <div className="text-navy/50">
            {employees.find((x) => x.id === e.actorId)?.name} · {e.at.slice(0, 16)} · {e.detail}
          </div>
        </div>
      ))}
    </Card>
  );
}

function SupabaseCard({ locale }: { locale: "ar" | "en" }) {
  const [status, setStatus] = useState<{
    postgres?: boolean;
    storage?: boolean;
    projectUrl?: string;
    tableError?: string | null;
    backend?: string;
  } | null>(null);

  useEffect(() => {
    void fetch("/api/os")
      .then((r) => r.json())
      .then((d) =>
        setStatus({
          backend: d.backend,
          postgres: d.status?.postgres,
          storage: d.status?.storage,
          projectUrl: d.status?.projectUrl,
          tableError: d.status?.tableError,
        }),
      )
      .catch(() => setStatus({ postgres: false, storage: false }));
  }, []);

  return (
    <Card>
      <h2 className="font-semibold">Supabase</h2>
      <p className="mt-1 text-sm text-navy/55">
        {locale === "ar"
          ? "بيانات الأجنسي بتتحفظ على مشروع Supabase، مش في المتصفح."
          : "Agency data is stored on your Supabase project, not in the browser."}
      </p>
      <div className="mt-3 space-y-1 text-sm">
        <div>Project: {status?.projectUrl ?? "—"}</div>
        <div>
          Backend: {status?.backend ?? "…"} · Postgres tables:{" "}
          {status?.postgres ? "ready" : "pending schema"} · Storage:{" "}
          {status?.storage ? "ready" : "missing"}
        </div>
        {status?.tableError ? (
          <p className="text-xs text-navy/50">
            {locale === "ar"
              ? "الجداول لسه متعملتش. شغّل ملف supabase/migrations في SQL Editor عشان تتحول من Storage لـ Postgres."
              : "Tables are not created yet. Run supabase/migrations in the SQL Editor to move from Storage to Postgres."}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
