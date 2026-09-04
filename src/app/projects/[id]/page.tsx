"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CommentThread } from "@/components/comments/thread";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { TaskStatus } from "@/lib/types";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const project = useOS((s) => s.projects.find((p) => p.id === id));
  const client = useOS((s) => s.clients.find((c) => c.id === project?.clientId));
  const tasks = useOS((s) => s.tasks.filter((t) => t.projectId === id));
  const employees = useOS((s) => s.employees);
  const expenses = useOS((s) => s.expenses.filter((e) => e.projectId === id));
  const invoices = useOS((s) => s.invoices.filter((i) => i.projectId === id));
  const updateTaskStatus = useOS((s) => s.updateTaskStatus);
  const requestRevision = useOS((s) => s.requestRevision);
  const approveDeliverable = useOS((s) => s.approveDeliverable);
  const logTime = useOS((s) => s.logTime);
  const assignTask = useOS((s) => s.assignTask);
  const assignByCapacity = useOS((s) => s.assignByCapacity);
  const addSubtask = useOS((s) => s.addSubtask);
  const dict = t(locale);

  if (!project) {
    return <p>{locale === "ar" ? "المشروع مش موجود." : "Project not found."}</p>;
  }

  const labor = tasks.reduce((s, t) => {
    const emp = employees.find((e) => e.id === t.assigneeId);
    return s + t.actualHours * (emp?.hourlyCost ?? 160);
  }, 0);
  const extra = expenses.reduce((s, e) => s + e.amount, 0);
  const revenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const expectedProfit = project.expectedRevenue - project.expectedCost;
  const actualProfit = revenue - labor - extra;
  const margin =
    project.expectedRevenue === 0 ? 0 : expectedProfit / project.expectedRevenue;
  const hoursUsed = tasks.reduce((s, t) => s + t.actualHours, 0);
  const hourRisk = project.expectedHours > 0 && hoursUsed / project.expectedHours > 0.8;

  const statuses: TaskStatus[] = ["todo", "doing", "review", "client", "done"];

  return (
    <div className="space-y-5">
      <div>
        <Link href="/projects" className="text-sm text-cobalt">
          ← {dict.nav.projects}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {locale === "ar" ? project.nameAr : project.name}
        </h1>
        <p className="text-sm text-navy/55">
          <Link href={`/clients/${client?.id}`} className="text-cobalt">
            {locale === "ar" ? client?.nameAr : client?.name}
          </Link>{" "}
          · {project.startDate} → {project.dueDate}
        </p>
      </div>

      {hourRisk ? (
        <Card className="border-coral/30 bg-coral/8 text-sm">
          {locale === "ar"
            ? "الساعات المستهلكة قربت من الميزانية — راجع الـ Scope قبل ما المشروع يخسر."
            : "Consumed hours are approaching the budget — review scope before this turns unprofitable."}
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        {[
          [locale === "ar" ? "إيراد متوقع" : "Planned revenue", egp(project.expectedRevenue, locale)],
          [locale === "ar" ? "تكلفة متوقعة" : "Planned cost", egp(project.expectedCost, locale)],
          [locale === "ar" ? "هامش مخطط" : "Planned margin", pct(margin, locale)],
          [locale === "ar" ? "ربح فعلي حتى الآن" : "Profit so far", egp(actualProfit, locale)],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs text-navy/50">{k}</div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "المهام والتسليمات" : "Tasks & deliverables"}
        </h2>
        <div className="space-y-3">
          {tasks.map((task) => {
            const emp = employees.find((e) => e.id === task.assigneeId);
            const cost = task.actualHours * (emp?.hourlyCost ?? 160);
            const sell = task.estimateHours * (emp?.billRate ?? 400);
            return (
              <div
                key={task.id}
                className="rounded-[14px] border border-navy/8 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {locale === "ar" ? task.titleAr : task.title}
                      {task.parentId ? (
                        <span className="ms-2 text-[11px] font-normal text-navy/40">subtask</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-navy/50">
                      {task.milestone} · {locale === "ar" ? emp?.nameAr : emp?.name} ·{" "}
                      {task.actualHours}/{task.estimateHours}h · {egp(cost, locale)}{" "}
                      {locale === "ar" ? "تكلفة" : "cost"}
                      {task.dependsOn?.length ? ` · waits on ${task.dependsOn.join(", ")}` : ""}
                      {task.tags?.length ? ` · ${task.tags.join(", ")}` : ""}
                    </div>
                  </div>
                  <Badge
                    tone={
                      task.approvalStatus === "approved"
                        ? "mint"
                        : task.approvalStatus === "revision"
                          ? "coral"
                          : "cobalt"
                    }
                  >
                    {task.approvalStatus}
                    {task.revisionCount
                      ? ` · r${task.revisionCount}`
                      : ""}
                  </Badge>
                </div>
                {task.revisionCount >= 2 ? (
                  <div className="mt-2 text-xs text-coral">
                    {locale === "ar"
                      ? "جولة التعديل التالتة تتحول لـ Change Request."
                      : "The third revision round becomes a change request."}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    className="h-8 rounded-[10px] border border-navy/10 px-2 text-xs"
                    value={task.status}
                    onChange={(e) =>
                      updateTaskStatus(task.id, e.target.value as TaskStatus)
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {dict.taskStatus[s]}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-8 rounded-[10px] border border-navy/10 px-2 text-xs"
                    value={task.assigneeId ?? ""}
                    onChange={(e) => assignTask(task.id, e.target.value)}
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => assignByCapacity(task.id)}
                  >
                    Auto-assign
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSubtask(task.id, `Check: ${task.title}`)}
                  >
                    + Subtask
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => logTime(task.id, task.assigneeId ?? "u_lina", 1)}
                  >
                    +1h
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => requestRevision(task.id)}
                  >
                    {locale === "ar" ? "طلب تعديل" : "Request changes"}
                  </Button>
                  <Button
                    size="sm"
                    variant="mint"
                    onClick={() => approveDeliverable(task.id)}
                  >
                    {locale === "ar" ? "اعتماد" : "Approve"}
                  </Button>
                </div>
                <div className="mt-2 text-[11px] text-navy/40">
                  {locale === "ar" ? "قيمة مباعة تقديرية" : "Est. sold value"}{" "}
                  {egp(sell, locale)}
                </div>
                <div className="mt-3">
                  <CommentThread entity="task" entityId={task.id} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <CommentThread entity="project" entityId={project.id} />
    </div>
  );
}
