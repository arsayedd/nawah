"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function MyWorkPage() {
  const locale = useOS((s) => s.locale);
  const tasks = useOS((s) => s.tasks.filter((t) => t.assigneeId === "u_lina"));
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{dict.nav.myWork}</h1>
        <p className="text-sm text-navy/55">
          {locale === "ar"
            ? "عرض لينا كمثال لعضو الفريق: المهام المعينة لها فقط."
            : "Lina’s queue as a team-member view: only assigned work."}
        </p>
      </div>
      <div className="grid gap-3">
        {tasks.map((task) => (
          <Link key={task.id} href={`/projects/${task.projectId}`}>
            <Card className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">
                  {locale === "ar" ? task.titleAr : task.title}
                </div>
                <div className="text-xs text-navy/50">
                  {dict.taskStatus[task.status]} · due {task.due ?? "—"}
                </div>
              </div>
              <div className="text-xs text-navy/45">
                {task.actualHours}/{task.estimateHours}h
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
