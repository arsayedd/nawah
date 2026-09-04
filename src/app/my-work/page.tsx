"use client";

import Link from "next/link";
import { useState } from "react";
import { PageSection } from "@/components/shell/page-section";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function MyWorkPage() {
  const locale = useOS((s) => s.locale);
  const allEmployees = useOS((s) => s.employees);
  const employees = allEmployees.filter((e) => e.id !== "u_ahmed");
  const [who, setWho] = useState("u_lina");
  const allTasks = useOS((s) => s.tasks);
  const tasks = allTasks.filter((t) => t.assigneeId === who);
  const dict = t(locale);
  const person = employees.find((e) => e.id === who);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{dict.nav.myWork}</h1>
        <p className="text-sm text-navy/55">
          ClickUp-style “me” queue. Switch person to see assigned work, tags, and blockers.
        </p>
      </div>
      <PageSection page="/my-work" id="people" label="Person switcher">
      <div className="flex flex-wrap gap-2">
        {employees.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setWho(e.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              who === e.id ? "bg-navy text-white" : "bg-white text-navy/70"
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>
      </PageSection>
      <p className="text-sm text-navy/50">{person?.role} · {tasks.length} open items</p>
      <PageSection page="/my-work" id="queue" label="Work queue">
      <div className="grid gap-3">
        {tasks.length === 0 ? (
          <Card className="p-6 text-sm text-navy/50">Inbox zero for this person.</Card>
        ) : (
          tasks.map((task) => (
            <Link key={task.id} href={`/projects/${task.projectId}`}>
              <Card className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">
                    {locale === "ar" ? task.titleAr : task.title}
                  </div>
                  <div className="text-xs text-navy/50">
                    {dict.taskStatus[task.status]} · due {task.due ?? "—"}
                    {task.dependsOn?.length ? ` · blocked by ${task.dependsOn.join(", ")}` : ""}
                  </div>
                  {task.tags?.length ? (
                    <div className="mt-1 text-[11px] text-navy/40">{task.tags.join(" · ")}</div>
                  ) : null}
                </div>
                <div className="text-xs text-navy/45">
                  {task.actualHours}/{task.estimateHours}h
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
      </PageSection>
    </div>
  );
}
