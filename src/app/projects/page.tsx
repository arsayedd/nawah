"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { TaskStatus } from "@/lib/types";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const views = ["board", "table", "gantt", "list", "calendar", "portfolio"] as const;

export default function ProjectsPage() {
  const locale = useOS((s) => s.locale);
  const projects = useOS((s) => s.projects);
  const tasks = useOS((s) => s.tasks);
  const clients = useOS((s) => s.clients);
  const dict = t(locale);
  const [view, setView] = useState<(typeof views)[number]>("board");
  const [dragging, setDragging] = useState<string | null>(null);
  const updateTaskStatus = useOS((s) => s.updateTaskStatus);

  const columns: TaskStatus[] = ["todo", "doing", "review", "client", "done"];

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, typeof tasks> = {
      todo: [],
      doing: [],
      review: [],
      client: [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Operations"
        title={dict.nav.projects}
        description={
          locale === "ar"
            ? "نفس المهام تظهر في اللوحة، القائمة، والربحية."
            : "One task list. Board, table, gantt, calendar, and portfolio all read the same work."
        }
        actions={
          <div className="flex rounded-[10px] border border-navy/10 p-1">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-[8px] px-3 py-1 text-xs font-medium ${
                  view === v ? "bg-navy text-white" : "text-navy/60"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <PageSection page="/projects" id="cards" label="Project cards">
      <div className="grid gap-3 md:grid-cols-3">
        {projects.map((p) => {
          const client = clients.find((c) => c.id === p.clientId);
          const pts = tasks.filter((t) => t.projectId === p.id);
          const done = pts.filter((t) => t.status === "done").length;
          return (
            <RecordChrome key={p.id} collection="projects" id={p.id}>
            <Link href={`/projects/${p.id}`}>
              <Card className="h-full p-4">
                <Badge
                  tone={
                    p.status === "healthy"
                      ? "mint"
                      : p.status === "delayed"
                        ? "coral"
                        : "cobalt"
                  }
                >
                  {dict.health[p.status]}
                </Badge>
                <div className="mt-2 font-semibold">
                  {locale === "ar" ? p.nameAr : p.name}
                </div>
                <div className="text-xs text-navy/50">
                  {locale === "ar" ? client?.nameAr : client?.name}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/8">
                  <div
                    className="h-full bg-mint"
                    style={{
                      width: `${pts.length ? (done / pts.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-navy/50">
                  {done}/{pts.length} · {egp(p.expectedRevenue, locale)}
                </div>
              </Card>
            </Link>
            </RecordChrome>
          );
        })}
      </div>
      </PageSection>

      <PageSection page="/projects" id="board" label="Task views">
      {view === "board" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((col) => (
            <div
              key={col}
              className="w-[240px] shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragging) updateTaskStatus(dragging, col);
                setDragging(null);
              }}
            >
              <div className="mb-2 text-sm font-semibold">
                {dict.taskStatus[col]}
              </div>
              <div className="min-h-40 space-y-2 rounded-[14px] bg-navy/[0.03] p-2">
                {grouped[col].map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    className="cursor-grab p-3 active:cursor-grabbing"
                  >
                    <Link href={`/projects/${task.projectId}`} className="block">
                      <div className="text-sm font-medium">
                        {locale === "ar" ? task.titleAr : task.title}
                      </div>
                      <div className="mt-1 text-[11px] text-navy/45">
                        {task.estimateHours}h · {task.priority}
                        {task.tags?.length ? ` · ${task.tags[0]}` : ""}
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        <Card className="p-2">
          {tasks.map((task) => {
            const p = projects.find((x) => x.id === task.projectId);
            return (
              <Link
                key={task.id}
                href={`/projects/${task.projectId}`}
                className="flex items-center justify-between rounded-[10px] px-3 py-2 text-sm hover:bg-paper"
              >
                <span>
                  {task.title}
                  <span className="text-navy/40"> · {p?.name}</span>
                </span>
                <span className="text-navy/45">
                  {dict.taskStatus[task.status]} · {task.due ?? "—"}
                </span>
              </Link>
            );
          })}
        </Card>
      ) : view === "calendar" ? (
        <Card>
          <p className="mb-3 text-sm text-navy/50">Tasks by due date · same records as the calendar module.</p>
          {tasks
            .filter((t) => t.due)
            .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""))
            .map((task) => (
              <div key={task.id} className="flex justify-between border-b border-navy/6 py-2 text-sm">
                <span>{task.title}</span>
                <span className="text-navy/45">{task.due}</span>
              </div>
            ))}
        </Card>
      ) : view === "portfolio" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => {
            const pts = tasks.filter((t) => t.projectId === p.id);
            const client = clients.find((c) => c.id === p.clientId);
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="p-4">
                  <div className="text-xs text-navy/40">{p.spaceId ?? "Delivery"}</div>
                  <div className="mt-1 font-semibold">{p.name}</div>
                  <div className="text-sm text-navy/50">{client?.name}</div>
                  <div className="mt-2 text-sm">
                    {pts.filter((t) => t.status === "done").length}/{pts.length} done ·{" "}
                    {egp(p.expectedRevenue - p.expectedCost, locale)} planned profit
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : view === "gantt" ? (
        <Card className="space-y-3">
          {tasks.map((task) => {
            const start = task.start ?? "2026-09-01";
            const due = task.due ?? "2026-09-20";
            const day = (d: string) => Number(d.replace(/-/g, "").slice(6));
            const left = Math.min(90, Math.max(0, (day(start) / 30) * 100));
            const width = Math.min(100 - left, Math.max(8, ((day(due) - day(start) + 2) / 30) * 100));
            return (
              <div key={task.id}>
                <div className="mb-1 text-xs text-navy/55">{task.title}</div>
                <div className="relative h-6 rounded-full bg-navy/8">
                  <div
                    className="absolute top-0 h-6 rounded-full bg-cobalt/80"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-paper text-xs text-navy/50">
              <tr>
                <th className="px-4 py-3 text-start">Task</th>
                <th className="text-start">Status</th>
                <th className="text-start">Hours</th>
                <th className="text-start">Billable</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t border-navy/6">
                  <td className="px-4 py-2">
                    {locale === "ar" ? task.titleAr : task.title}
                  </td>
                  <td>{dict.taskStatus[task.status]}</td>
                  <td>
                    {task.actualHours}/{task.estimateHours}
                  </td>
                  <td>{task.billable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      </PageSection>
    </div>
  );
}
