"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { TaskStatus } from "@/lib/types";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const views = ["list", "board", "table"] as const;

export default function ProjectsPage() {
  const locale = useOS((s) => s.locale);
  const projects = useOS((s) => s.projects);
  const tasks = useOS((s) => s.tasks);
  const clients = useOS((s) => s.clients);
  const dict = t(locale);
  const [view, setView] = useState<(typeof views)[number]>("board");

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
            : "One task list. Board, table, and profitability all read the same work."
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

      <div className="grid gap-3 md:grid-cols-3">
        {projects.map((p) => {
          const client = clients.find((c) => c.id === p.clientId);
          const pts = tasks.filter((t) => t.projectId === p.id);
          const done = pts.filter((t) => t.status === "done").length;
          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
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
          );
        })}
      </div>

      {view === "board" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((col) => (
            <div key={col} className="w-[240px] shrink-0">
              <div className="mb-2 text-sm font-semibold">
                {dict.taskStatus[col]}
              </div>
              <div className="space-y-2 rounded-[14px] bg-navy/[0.03] p-2 min-h-40">
                {grouped[col].map((task) => (
                  <Link key={task.id} href={`/projects/${task.projectId}`}>
                    <Card className="p-3">
                      <div className="text-sm font-medium">
                        {locale === "ar" ? task.titleAr : task.title}
                      </div>
                      <div className="mt-1 text-[11px] text-navy/45">
                        {task.estimateHours}h · {task.priority}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
