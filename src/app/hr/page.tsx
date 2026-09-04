"use client";

import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function HrPage() {
  const locale = useOS((s) => s.locale);
  const employees = useOS((s) => s.employees);
  const leaves = useOS((s) => s.leaves);
  const attendance = useOS((s) => s.attendance);
  const payroll = useOS((s) => s.payroll);
  const tasks = useOS((s) => s.tasks);
  const decideLeave = useOS((s) => s.decideLeave);
  const clockAttendance = useOS((s) => s.clockAttendance);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="People"
        title={dict.nav.hr}
        description="Attendance, leave, payroll, and performance sit on the same people who appear on quotes and timesheets. Full payroll runs stay out of this demo."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <PageSection page="/hr" id="attendance" label="Attendance">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Today’s attendance</h2>
            <Button size="sm" variant="outline" onClick={() => clockAttendance()}>
              Clock +1h
            </Button>
          </div>
          {attendance.map((a) => {
            const e = employees.find((x) => x.id === a.userId);
            return (
              <div key={a.id} className="flex justify-between py-1.5 text-sm">
                <span>{e?.name}</span>
                <span className="text-navy/50">
                  {a.status} · {a.hours}h
                </span>
              </div>
            );
          })}
        </Card>
        </PageSection>
        <PageSection page="/hr" id="leave" label="Leave">
        <Card>
          {leaves.map((l) => {
            const e = employees.find((x) => x.id === l.userId);
            return (
              <div key={l.id} className="mb-3 rounded-[12px] border border-navy/8 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{e?.name}</span>
                  <Badge tone={l.status === "approved" ? "mint" : l.status === "pending" ? "cobalt" : "coral"}>
                    {l.status}
                  </Badge>
                </div>
                <div className="text-navy/50">
                  {l.type} · {l.start} → {l.end} ({l.days}d)
                </div>
                {l.status === "pending" ? (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="mint" onClick={() => decideLeave(l.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => decideLeave(l.id, "denied")}>
                      Deny
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </Card>
        </PageSection>
        <PageSection page="/hr" id="payroll" label="Payroll">
        <Card>
          <h2 className="mb-3 font-semibold">Payroll & commissions</h2>
          {payroll.map((p) => {
            const e = employees.find((x) => x.id === p.userId);
            return (
              <div key={p.id} className="flex justify-between py-1.5 text-sm">
                <span>
                  {e?.name} · {p.month}
                </span>
                <span>
                  {egp(p.total, locale)}
                  {p.commission ? ` · comm ${egp(p.commission, locale)}` : ""} · {p.status}
                </span>
              </div>
            );
          })}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Performance (this workspace)</h2>
          {employees
            .filter((e) => e.id !== "u_ahmed")
            .map((e) => {
              const mine = tasks.filter((t) => t.assigneeId === e.id);
              const done = mine.filter((t) => t.status === "done").length;
              const late = mine.filter((t) => t.due && t.due < "2026-09-04" && t.status !== "done").length;
              const est = mine.reduce((s, t) => s + t.estimateHours, 0);
              const act = mine.reduce((s, t) => s + t.actualHours, 0);
              return (
                <div key={e.id} className="border-b border-navy/6 py-2 text-sm">
                  <div className="font-medium">
                    {e.name}
                    {e.kind === "freelancer" ? (
                      <Badge tone="cobalt" className="ms-2">
                        Freelancer
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-navy/50">
                    Done {done}/{mine.length} · late {late} · est/act {est}/{act}h
                  </div>
                </div>
              );
            })}
        </Card>
        </PageSection>
      </div>
    </div>
  );
}
