"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function WorkloadPage() {
  const locale = useOS((s) => s.locale);
  const employees = useOS((s) => s.employees);
  const tasks = useOS((s) => s.tasks);
  const projects = useOS((s) => s.projects);
  const assignByCapacity = useOS((s) => s.assignByCapacity);
  const dict = t(locale);
  const unassigned = tasks.filter((t) => !t.assigneeId && t.status !== "done");

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="ClickUp-class"
        title={dict.nav.workload}
        description="Capacity by person. Unassigned work can be auto-placed by skill load and hourly cost."
      />
      {unassigned.length ? (
        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Unassigned ({unassigned.length})</h2>
          {unassigned.map((t) => (
            <div key={t.id} className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{t.title}</span>
              <Button size="sm" onClick={() => assignByCapacity(t.id)}>
                Assign by capacity
              </Button>
            </div>
          ))}
        </Card>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {employees
          .filter((e) => e.id !== "u_ahmed")
          .map((e) => {
            const mine = tasks.filter((t) => t.assigneeId === e.id && t.status !== "done");
            const booked = mine.reduce((s, t) => s + t.estimateHours, 0);
            const ratio = booked / e.weeklyHours;
            return (
              <Card key={e.id} className="p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-semibold">{locale === "ar" ? e.nameAr : e.name}</div>
                    <div className="text-xs text-navy/50">
                      {e.role} · {e.department}
                      {e.kind === "freelancer" ? " · freelancer" : ""}
                    </div>
                  </div>
                  <Badge tone={ratio > 1 ? "coral" : ratio < 0.4 ? "cobalt" : "mint"}>
                    {Math.round(ratio * 100)}%
                  </Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/8">
                  <div
                    className={`h-full ${ratio > 1 ? "bg-coral" : "bg-cobalt"}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {mine.map((t) => {
                    const p = projects.find((x) => x.id === t.projectId);
                    return (
                      <Link key={t.id} href={`/projects/${t.projectId}`} className="block text-navy/70">
                        {t.title}
                        <span className="text-navy/40"> · {t.estimateHours}h · {p?.name}</span>
                      </Link>
                    );
                  })}
                  {mine.length === 0 ? <p className="text-navy/40">Underutilized this week.</p> : null}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
