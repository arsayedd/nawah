"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { Task, TaskStatus } from "@/lib/types";
import { dayKey, daysBetween, egp, parseDay } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const views = ["board", "table", "gantt", "list", "calendar", "portfolio"] as const;
const columns: TaskStatus[] = ["todo", "doing", "review", "client", "done"];

function monthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const pad = first.getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: pad }, () => null);
  for (let d = 1; d <= count; d += 1) {
    cells.push(dayKey(new Date(year, monthIndex, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function ProjectsPage() {
  const locale = useOS((s) => s.locale);
  const projects = useOS((s) => s.projects);
  const tasks = useOS((s) => s.tasks);
  const clients = useOS((s) => s.clients);
  const employees = useOS((s) => s.employees);
  const dict = t(locale);
  const [view, setView] = useState<(typeof views)[number]>("board");
  const [dragging, setDragging] = useState<string | null>(null);
  const updateTaskStatus = useOS((s) => s.updateTaskStatus);
  const patchTask = useOS((s) => s.patchTask);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      doing: [],
      review: [],
      client: [],
      done: [],
    };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  const gantt = useMemo(() => {
    const dates = tasks.flatMap((task) => [task.start, task.due].filter(Boolean) as string[]);
    const from = dates.length ? [...dates].sort()[0] : "2026-09-01";
    const to = dates.length ? [...dates].sort().at(-1)! : "2026-09-30";
    const span = Math.max(7, daysBetween(from, to) + 1);
    return { from, to, span };
  }, [tasks]);

  const calMonth = useMemo(() => {
    const due = tasks.map((task) => task.due).filter(Boolean) as string[];
    const sample = due[0] ?? "2026-09-04";
    const d = parseDay(sample);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [tasks]);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Operations"
        title={dict.nav.projects}
        description={
          locale === "ar"
            ? "نفس المهام تظهر في اللوحة، الجدول، الجانت، والتقويم."
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
            const pts = tasks.filter((task) => task.projectId === p.id);
            const done = pts.filter((task) => task.status === "done").length;
            return (
              <RecordChrome key={p.id} collection="projects" id={p.id}>
                <Link href={`/projects/${p.id}`}>
                  <Card className="h-full p-4">
                    <Badge
                      tone={
                        p.status === "healthy" ? "mint" : p.status === "delayed" ? "coral" : "cobalt"
                      }
                    >
                      {dict.health[p.status]}
                    </Badge>
                    <div className="mt-2 font-semibold">{locale === "ar" ? p.nameAr : p.name}</div>
                    <div className="text-xs text-navy/50">{locale === "ar" ? client?.nameAr : client?.name}</div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/8">
                      <div
                        className="h-full bg-mint"
                        style={{ width: `${pts.length ? (done / pts.length) * 100 : 0}%` }}
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
                <div className="mb-2 text-sm font-semibold">{dict.taskStatus[col]}</div>
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
                          {task.due ? ` · ${task.due.slice(5)}` : ""}
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
            <p className="mb-3 text-sm text-navy/50">
              {new Date(calMonth.year, calMonth.month, 1).toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
                month: "long",
                year: "numeric",
              })}{" "}
              · drop a due date in the table view to move a card here.
            </p>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[12px] bg-navy/8 text-sm">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="bg-paper px-2 py-1.5 text-[11px] font-semibold uppercase text-navy/40">
                  {d}
                </div>
              ))}
              {monthCells(calMonth.year, calMonth.month).map((iso, i) => {
                const dayTasks = iso ? tasks.filter((task) => task.due === iso) : [];
                return (
                  <div key={iso ?? `pad-${i}`} className="min-h-[88px] bg-white p-1.5">
                    {iso ? <div className="text-[11px] text-navy/40">{iso.slice(8)}</div> : null}
                    {dayTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/projects/${task.projectId}`}
                        className="mt-1 block truncate rounded-md bg-cobalt/12 px-1.5 py-0.5 text-[10px] text-navy"
                      >
                        {task.title}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        ) : view === "portfolio" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((p) => {
              const pts = tasks.filter((task) => task.projectId === p.id);
              const client = clients.find((c) => c.id === p.clientId);
              return (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <Card className="p-4">
                    <div className="text-xs text-navy/40">{p.spaceId ?? "Delivery"}</div>
                    <div className="mt-1 font-semibold">{p.name}</div>
                    <div className="text-sm text-navy/50">{client?.name}</div>
                    <div className="mt-2 text-sm">
                      {pts.filter((task) => task.status === "done").length}/{pts.length} done ·{" "}
                      {egp(p.expectedRevenue - p.expectedCost, locale)} planned profit
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : view === "gantt" ? (
          <Card className="space-y-3">
            <p className="text-xs text-navy/45">
              {gantt.from} → {gantt.to} · bars follow start/due on the same tasks.
            </p>
            {tasks.map((task) => {
              const start = task.start ?? task.due ?? gantt.from;
              const due = task.due ?? start;
              const left = Math.max(0, (daysBetween(gantt.from, start) / gantt.span) * 100);
              const width = Math.max(4, ((daysBetween(start, due) + 1) / gantt.span) * 100);
              return (
                <div key={task.id}>
                  <div className="mb-1 flex justify-between text-xs text-navy/55">
                    <Link href={`/projects/${task.projectId}`} className="hover:text-cobalt">
                      {task.title}
                    </Link>
                    <span>
                      {start} → {due}
                    </span>
                  </div>
                  <div className="relative h-6 rounded-full bg-navy/8">
                    <div
                      className={`absolute top-0 h-6 rounded-full ${
                        task.status === "done" ? "bg-mint/80" : "bg-cobalt/80"
                      }`}
                      style={{ left: `${left}%`, width: `${Math.min(100 - left, width)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-paper text-xs text-navy/50">
                <tr>
                  <th className="px-4 py-3 text-start">Task</th>
                  <th className="text-start">Status</th>
                  <th className="text-start">Assignee</th>
                  <th className="text-start">Due</th>
                  <th className="text-start">Hours</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-navy/6">
                    <td className="px-4 py-2">
                      <Link href={`/projects/${task.projectId}`} className="font-medium hover:text-cobalt">
                        {locale === "ar" ? task.titleAr : task.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="h-8 rounded-[8px] border border-navy/10 px-2 text-xs"
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      >
                        {columns.map((s) => (
                          <option key={s} value={s}>
                            {dict.taskStatus[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <select
                        className="h-8 rounded-[8px] border border-navy/10 px-2 text-xs"
                        value={task.assigneeId ?? ""}
                        onChange={(e) => patchTask(task.id, { assigneeId: e.target.value || undefined })}
                      >
                        <option value="">Unassigned</option>
                        {employees
                          .filter((e) => e.id !== "u_ahmed")
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="date"
                        className="h-8 rounded-[8px] border border-navy/10 px-2 text-xs"
                        value={task.due ?? ""}
                        onChange={(e) => patchTask(task.id, { due: e.target.value || undefined })}
                      />
                    </td>
                    <td className="py-2 pr-4 text-navy/60">
                      {task.actualHours}/{task.estimateHours}
                    </td>
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
