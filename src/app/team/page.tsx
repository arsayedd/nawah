"use client";

import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function TeamPage() {
  const locale = useOS((s) => s.locale);
  const employees = useOS((s) => s.employees);
  const tasks = useOS((s) => s.tasks);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.team}</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {employees.map((e) => {
          const mine = tasks.filter((t) => t.assigneeId === e.id);
          const booked = mine
            .filter((t) => t.status !== "done")
            .reduce((s, t) => s + t.estimateHours, 0);
          const actual = mine.reduce((s, t) => s + t.actualHours, 0);
          const late = mine.filter(
            (t) => t.due && t.due < "2026-09-04" && t.status !== "done",
          ).length;
          const util = booked / e.weeklyHours;
          return (
            <Card key={e.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    {locale === "ar" ? e.nameAr : e.name}
                  </div>
                  <div className="text-xs text-navy/50">
                    {locale === "ar" ? e.roleAr : e.role} · {e.department}
                    {e.kind === "freelancer" ? " · freelancer" : ""}
                  </div>
                </div>
                <Badge
                  tone={util > 1 ? "coral" : util < 0.4 ? "cobalt" : "mint"}
                >
                  {util > 1
                    ? "Overbooked"
                    : util < 0.4
                      ? "Underutilized"
                      : "Healthy"}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  {locale === "ar" ? "تكلفة الساعة" : "Cost / h"}{" "}
                  {egp(e.hourlyCost, locale)}
                </div>
                <div>
                  {locale === "ar" ? "سعر البيع" : "Bill / h"}{" "}
                  {egp(e.billRate, locale)}
                </div>
                <div>
                  {locale === "ar" ? "محجوز" : "Booked"} {booked}h
                </div>
                <div>
                  {locale === "ar" ? "فعلي" : "Actual"} {actual}h
                </div>
                <div>
                  {locale === "ar" ? "متأخر" : "Late"} {late}
                </div>
                <div>Skills: {e.skills.join(", ") || "—"}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
