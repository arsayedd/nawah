"use client";

import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function CalendarPage() {
  const locale = useOS((s) => s.locale);
  const meetings = useOS((s) => s.meetings);
  const tasks = useOS((s) => s.tasks.filter((t) => t.due));
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.calendar}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "اجتماعات" : "Meetings"}
          </h2>
          {meetings.map((m) => (
            <div key={m.id} className="border-b border-navy/6 py-3 text-sm">
              <div className="font-medium">
                {locale === "ar" ? m.titleAr : m.title}
              </div>
              <div className="text-xs text-navy/50">{m.when}</div>
              <p className="mt-1 text-navy/70">{m.notes}</p>
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "مواعيد التسليم" : "Deadlines"}
          </h2>
          {tasks.map((t) => (
            <div key={t.id} className="flex justify-between py-2 text-sm">
              <span>{locale === "ar" ? t.titleAr : t.title}</span>
              <span className="text-navy/50">{t.due}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
