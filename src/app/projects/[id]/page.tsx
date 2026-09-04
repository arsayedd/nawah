"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CommentThread } from "@/components/comments/thread";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { Employee, Locale, Task, TaskStatus } from "@/lib/types";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const project = useOS((s) => s.projects.find((p) => p.id === id));
  const client = useOS((s) => s.clients.find((c) => c.id === project?.clientId));
  const allTasks = useOS((s) => s.tasks);
  const tasks = allTasks.filter((t) => t.projectId === id);
  const employees = useOS((s) => s.employees);
  const allExpenses = useOS((s) => s.expenses);
  const expenses = allExpenses.filter((e) => e.projectId === id);
  const allInvoices = useOS((s) => s.invoices);
  const invoices = allInvoices.filter((i) => i.projectId === id);
  const updateTaskStatus = useOS((s) => s.updateTaskStatus);
  const requestRevision = useOS((s) => s.requestRevision);
  const approveDeliverable = useOS((s) => s.approveDeliverable);
  const logTime = useOS((s) => s.logTime);
  const assignTask = useOS((s) => s.assignTask);
  const assignByCapacity = useOS((s) => s.assignByCapacity);
  const addSubtask = useOS((s) => s.addSubtask);
  const quickAdd = useOS((s) => s.quickAdd);
  const addChecklistItem = useOS((s) => s.addChecklistItem);
  const toggleChecklist = useOS((s) => s.toggleChecklist);
  const dict = t(locale);
  const [taskTitle, setTaskTitle] = useState("");
  const [subDraft, setSubDraft] = useState<Record<string, string>>({});
  const [checkDraft, setCheckDraft] = useState<Record<string, string>>({});

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
      <PageSection page="/projects/:id" id="header" label="Project header">
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
      </PageSection>

      <PageSection page="/projects/:id" id="tasks" label="Tasks">
      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "المهام والتسليمات" : "Tasks & deliverables"}
        </h2>
        <form
          className="mb-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const name = taskTitle.trim();
            if (!name) return;
            quickAdd("task", name, { projectId: id });
            setTaskTitle("");
          }}
        >
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder={locale === "ar" ? "مهمة جديدة" : "New task"}
          />
          <Button type="submit" size="sm">
            Add task
          </Button>
        </form>
        <div className="space-y-3">
          {tasks
            .filter((task) => !task.parentId)
            .map((task) => (
              <TaskBlock
                key={task.id}
                task={task}
                childrenTasks={tasks.filter((c) => c.parentId === task.id)}
                locale={locale}
                dict={dict}
                employees={employees}
                statuses={statuses}
                subDraft={subDraft[task.id] ?? ""}
                checkDraft={checkDraft[task.id] ?? ""}
                onSubDraft={(v) => setSubDraft((s) => ({ ...s, [task.id]: v }))}
                onCheckDraft={(v) => setCheckDraft((s) => ({ ...s, [task.id]: v }))}
                onAddSub={() => {
                  const name = (subDraft[task.id] ?? "").trim();
                  if (!name) return;
                  addSubtask(task.id, name);
                  setSubDraft((s) => ({ ...s, [task.id]: "" }));
                }}
                onAddCheck={() => {
                  const name = (checkDraft[task.id] ?? "").trim();
                  if (!name) return;
                  addChecklistItem(task.id, name);
                  setCheckDraft((s) => ({ ...s, [task.id]: "" }));
                }}
                updateTaskStatus={updateTaskStatus}
                assignTask={assignTask}
                assignByCapacity={assignByCapacity}
                logTime={logTime}
                requestRevision={requestRevision}
                approveDeliverable={approveDeliverable}
                toggleChecklist={toggleChecklist}
              />
            ))}
        </div>
      </Card>
      </PageSection>
      <PageSection page="/projects/:id" id="comments" label="Project comments">
        <CommentThread entity="project" entityId={project.id} />
      </PageSection>
    </div>
  );
}

function TaskBlock({
  task,
  childrenTasks,
  locale,
  dict,
  employees,
  statuses,
  subDraft,
  checkDraft,
  onSubDraft,
  onCheckDraft,
  onAddSub,
  onAddCheck,
  updateTaskStatus,
  assignTask,
  assignByCapacity,
  logTime,
  requestRevision,
  approveDeliverable,
  toggleChecklist,
}: {
  task: Task;
  childrenTasks: Task[];
  locale: Locale;
  dict: ReturnType<typeof t>;
  employees: Employee[];
  statuses: TaskStatus[];
  subDraft: string;
  checkDraft: string;
  onSubDraft: (v: string) => void;
  onCheckDraft: (v: string) => void;
  onAddSub: () => void;
  onAddCheck: () => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  assignTask: (id: string, userId: string) => void;
  assignByCapacity: (id: string) => void;
  logTime: (taskId: string, userId: string, hours: number) => void;
  requestRevision: (id: string) => void;
  approveDeliverable: (id: string) => void;
  toggleChecklist: (taskId: string, itemId: string) => void;
}) {
  const emp = employees.find((e) => e.id === task.assigneeId);
  const cost = task.actualHours * (emp?.hourlyCost ?? 160);
  const sell = task.estimateHours * (emp?.billRate ?? 400);

  return (
    <div className="rounded-[14px] border border-navy/8 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-medium">{locale === "ar" ? task.titleAr : task.title}</div>
          <div className="text-xs text-navy/50">
            {task.milestone} · {locale === "ar" ? emp?.nameAr : emp?.name} · {task.actualHours}/
            {task.estimateHours}h · {egp(cost, locale)} {locale === "ar" ? "تكلفة" : "cost"}
          </div>
        </div>
        <Badge
          tone={
            task.approvalStatus === "approved" ? "mint" : task.approvalStatus === "revision" ? "coral" : "cobalt"
          }
        >
          {task.approvalStatus}
          {task.revisionCount ? ` · r${task.revisionCount}` : ""}
        </Badge>
      </div>
      {task.checklist.length ? (
        <ul className="mt-3 space-y-1">
          {task.checklist.map((item) => (
            <li key={item.id}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(task.id, item.id)} />
                <span className={item.done ? "text-navy/40 line-through" : ""}>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddCheck();
        }}
      >
        <Input
          className="h-8 text-xs"
          placeholder="Checklist item"
          value={checkDraft}
          onChange={(e) => onCheckDraft(e.target.value)}
        />
        <Button type="submit" size="sm" variant="outline">
          Add
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          className="h-8 rounded-[10px] border border-navy/10 px-2 text-xs"
          value={task.status}
          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
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
        <Button size="sm" variant="outline" onClick={() => assignByCapacity(task.id)}>
          Auto-assign
        </Button>
        <Button size="sm" variant="outline" onClick={() => logTime(task.id, task.assigneeId ?? "u_lina", 1)}>
          +1h
        </Button>
        <Button size="sm" variant="outline" onClick={() => requestRevision(task.id)}>
          {locale === "ar" ? "طلب تعديل" : "Request changes"}
        </Button>
        <Button size="sm" variant="mint" onClick={() => approveDeliverable(task.id)}>
          {locale === "ar" ? "اعتماد" : "Approve"}
        </Button>
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddSub();
        }}
      >
        <Input
          className="h-8 text-xs"
          placeholder="Subtask title"
          value={subDraft}
          onChange={(e) => onSubDraft(e.target.value)}
        />
        <Button type="submit" size="sm" variant="outline">
          + Subtask
        </Button>
      </form>
      {childrenTasks.length ? (
        <div className="mt-3 space-y-2 border-s-2 border-navy/10 ps-3">
          {childrenTasks.map((child) => (
            <div key={child.id} className="flex items-center justify-between text-sm">
              <span>{child.title}</span>
              <select
                className="h-8 rounded-[10px] border border-navy/10 px-2 text-xs"
                value={child.status}
                onChange={(e) => updateTaskStatus(child.id, e.target.value as TaskStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {dict.taskStatus[s]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-2 text-[11px] text-navy/40">
        {locale === "ar" ? "قيمة مباعة تقديرية" : "Est. sold value"} {egp(sell, locale)}
      </div>
      <div className="mt-3">
        <CommentThread entity="task" entityId={task.id} />
      </div>
    </div>
  );
}
