"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function TimePage() {
  const locale = useOS((s) => s.locale);
  const tasks = useOS((s) => s.tasks);
  const employees = useOS((s) => s.employees);
  const timeEntries = useOS((s) => s.timeEntries);
  const runningTimer = useOS((s) => s.runningTimer);
  const startTimer = useOS((s) => s.startTimer);
  const stopTimer = useOS((s) => s.stopTimer);
  const logTime = useOS((s) => s.logTime);
  const dict = t(locale);

  const open = tasks.filter((t) => t.status !== "done");

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Capacity"
        title={dict.nav.time}
        description="Timers post billable hours onto the task, the timesheet, and the project P&L."
        actions={
          runningTimer ? (
            <div className="flex items-center gap-2">
              <LiveElapsed startedAt={runningTimer.startedAt} />
              <Button variant="coral" onClick={() => stopTimer()}>
                Stop timer
              </Button>
            </div>
          ) : null
        }
      />
      <PageSection page="/time" id="people" label="People load">
      <div className="grid gap-3 md:grid-cols-3">
        {employees
          .filter((e) => e.id !== "u_ahmed")
          .map((e) => {
            const booked = tasks
              .filter((t) => t.assigneeId === e.id && t.status !== "done")
              .reduce((s, t) => s + t.estimateHours, 0);
            const actual = tasks
              .filter((t) => t.assigneeId === e.id)
              .reduce((s, t) => s + t.actualHours, 0);
            return (
              <Card key={e.id} className="p-4">
                <div className="font-semibold">{e.name}</div>
                <div className="mt-1 text-xs text-navy/45">
                  Booked {booked}h · Actual {actual}h · {e.weeklyHours}h week
                </div>
                <Badge
                  className="mt-2"
                  tone={booked > e.weeklyHours ? "coral" : booked < 16 ? "cobalt" : "mint"}
                >
                  {booked > e.weeklyHours
                    ? "Overbooked"
                    : booked < 16
                      ? "Underutilized"
                      : "Healthy"}
                </Badge>
              </Card>
            );
          })}
      </div>
      </PageSection>
      <PageSection page="/time" id="entries" label="Timers & entries">
      <Card>
        <h2 className="mb-3 font-semibold">Open tasks</h2>
        {open.map((task) => (
          <div
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/6 py-2 text-sm"
          >
            <div>
              {task.title}
              <div className="text-[11px] text-navy/45">
                {task.actualHours}/{task.estimateHours}h ·{" "}
                {task.billable ? "Billable" : "Non-billable"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => logTime(task.id, task.assigneeId ?? "u_lina", 0.5)}>
                +0.5h
              </Button>
              {runningTimer?.taskId === task.id ? (
                <div className="flex items-center gap-2">
                  <LiveElapsed startedAt={runningTimer.startedAt} />
                  <Button size="sm" variant="coral" onClick={() => stopTimer()}>
                    Stop
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => startTimer(task.id)}>
                  Start
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Timesheet</h2>
        {timeEntries.map((te) => {
          const task = tasks.find((t) => t.id === te.taskId);
          const who = employees.find((e) => e.id === te.userId);
          return (
            <div key={te.id} className="flex justify-between py-1 text-sm">
              <span>
                {who?.name} · {task?.title}
              </span>
              <span>
                {te.hours}h · {te.date}
              </span>
            </div>
          );
        })}
      </Card>
      </PageSection>
    </div>
  );
}

function LiveElapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const sec = Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return (
    <span className="font-mono text-sm tabular-nums">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}
