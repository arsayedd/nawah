"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageSection } from "@/components/shell/page-section";
import { NawahLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

function PortalInner() {
  const params = useSearchParams();
  const locale = useOS((s) => s.locale);
  const sessionKind = useOS((s) => s.sessionKind);
  const clients = useOS((s) => s.clients);
  const lockedClient = sessionKind === "client" ? clients[0]?.id : undefined;
  const selected =
    lockedClient ?? params.get("client") ?? clients.find((c) => c.portalEnabled)?.id ?? "";
  const client = clients.find((c) => c.id === selected) ?? clients[0];
  const allProjects = useOS((s) => s.projects);
  const tasks = useOS((s) => s.tasks);
  const allQuotes = useOS((s) => s.quotes);
  const allInvoices = useOS((s) => s.invoices);
  const allTickets = useOS((s) => s.tickets);
  const projects = allProjects.filter((p) => p.clientId === client?.id);
  const quotes = allQuotes.filter((q) => q.clientId === client?.id);
  const invoices = allInvoices.filter((i) => i.clientId === client?.id);
  const tickets = allTickets.filter((t) => t.clientId === client?.id);
  const approveDeliverable = useOS((s) => s.approveDeliverable);
  const requestRevision = useOS((s) => s.requestRevision);
  const dict = t(locale);

  if (!client) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Client portal</h1>
        <p className="mt-2 text-sm text-navy/55">
          No portal-enabled client yet. Open Clients and turn on portal access.
        </p>
        <Link href="/clients" className="mt-3 inline-block text-sm text-cobalt">
          Go to clients
        </Link>
      </Card>
    );
  }

  const clientTasks = tasks.filter((t) =>
    projects.some((p) => p.id === t.projectId),
  );
  const waiting = clientTasks.filter((t) => t.status === "client");
  const doing = clientTasks.filter((t) => t.status === "doing" || t.status === "review");
  const done = clientTasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-paper px-4 py-8 text-navy">
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <NawahLockup />
        <button
          type="button"
          className="text-sm text-navy/50 hover:text-coral"
          onClick={() => {
            void fetch("/api/session", { method: "DELETE" }).then(() => {
              window.location.href = "/login";
            });
          }}
        >
          Log out
        </button>
        {sessionKind === "staff" ? (
          <Link href="/home" className="text-sm text-cobalt">
            Back to OS
          </Link>
        ) : null}
      </div>
      <div className="rounded-[18px] border border-navy/8 bg-white p-6">
        <h1 className="mt-4 text-2xl font-bold">
          {locale === "ar"
            ? `أهلاً بيك في بوابة ${client.nameAr}`
            : `Welcome to the ${client.name} portal`}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-navy/55">
          {locale === "ar"
            ? "تابع التقدم، شارك الملفات، ووافق على التسليمات. مش هتشوف التكلفة الداخلية ولا كلام الفريق."
            : "Track progress, share files, and approve deliverables. Internal cost and team chatter stay hidden."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {sessionKind === "client"
            ? null
            : clients.map((c) => (
            <Link
              key={c.id}
              href={`/portal?client=${c.id}`}
              className={`rounded-full px-3 py-1 text-xs ${
                c.id === client.id
                  ? "bg-navy text-white"
                  : "bg-paper text-navy/70"
              }`}
            >
              {locale === "ar" ? c.nameAr : c.name}
            </Link>
          ))}
        </div>
      </div>

      <PageSection page="/portal" id="work" label="Work & approvals">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "اتعمل" : "Done"}
          </div>
          <div className="text-2xl font-semibold">{done.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "بنشتغل عليه" : "In progress"}
          </div>
          <div className="text-2xl font-semibold">{doing.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "مطلوب منك" : "Waiting on you"}
          </div>
          <div className="text-2xl font-semibold">{waiting.length}</div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "التسليمات للموافقة" : "Deliverables for approval"}
        </h2>
        {waiting.length === 0 ? (
          <p className="text-sm text-navy/50">
            {locale === "ar" ? "لا يوجد شيء ينتظر موافقتك." : "Nothing waiting on you."}
          </p>
        ) : (
          waiting.map((task) => (
            <div
              key={task.id}
              className="mb-3 rounded-[14px] border border-navy/8 p-4"
            >
              <div className="font-medium">
                {locale === "ar" ? task.titleAr : task.title}
              </div>
              <div className="text-xs text-navy/50">
                {locale === "ar" ? "جولات متبقية" : "Rounds left"}{" "}
                {Math.max(0, 2 - task.revisionCount)}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="mint"
                  onClick={() => {
                    approveDeliverable(task.id);
                    if (sessionKind === "client") {
                      void fetch("/api/os/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "approveDeliverable", taskId: task.id }),
                      });
                    }
                  }}
                >
                  {locale === "ar" ? "اعتماد" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    requestRevision(task.id);
                    if (sessionKind === "client") {
                      void fetch("/api/os/action", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "requestRevision", taskId: task.id }),
                      });
                    }
                  }}
                >
                  {locale === "ar" ? "طلب تعديل" : "Request changes"}
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>
      </PageSection>

      <PageSection page="/portal" id="billing" label="Quotes & invoices">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">{dict.nav.projects}</h2>
          {projects.map((p) => (
            <div key={p.id} className="mb-2 text-sm">
              {locale === "ar" ? p.nameAr : p.name} · {dict.health[p.status]}
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "فواتير وكوتيشنات" : "Billing"}
          </h2>
          {quotes.map((q) => (
            <Link key={q.id} href={`/q/${q.id}`} className="mb-2 block text-sm text-cobalt">
              {q.number} · {dict.quoteStatus[q.status]}
            </Link>
          ))}
          {invoices.map((i) => (
            <div key={i.id} className="text-sm">
              {i.number} · {egp(i.amount, locale)} · {i.status}
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 font-semibold">
          {locale === "ar" ? "طلباتك" : "Your requests"}
        </h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-navy/50">—</p>
        ) : (
          tickets.map((tk) => (
            <div key={tk.id} className="text-sm">
              {locale === "ar" ? tk.titleAr : tk.title}{" "}
              {!tk.inScope ? (
                <Badge tone="coral">
                  {locale === "ar" ? "خارج الاتفاق — تكلفة إضافية" : "Out of scope — extra fee"}
                </Badge>
              ) : (
                <Badge tone="mint">In scope</Badge>
              )}
            </div>
          ))
        )}
        <Link href={`/book?client=${client.id}`}>
          <Button className="mt-4" size="sm" variant="outline">
            Book a meeting
          </Button>
        </Link>
      </Card>
      </PageSection>
    </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense>
      <PortalInner />
    </Suspense>
  );
}
