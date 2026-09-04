"use client";

import Link from "next/link";
import { Fragment } from "react";
import { PageSection } from "@/components/shell/page-section";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

const days = ["2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12"];
const hours = [9, 10, 11, 12, 13, 14, 15, 16];

export default function CalendarPage() {
  const locale = useOS((s) => s.locale);
  const meetings = useOS((s) => s.meetings);
  const allTasks = useOS((s) => s.tasks);
  const tasks = allTasks.filter((t) => t.due);
  const slots = useOS((s) => s.bookingSlots);
  const types = useOS((s) => s.bookingTypes);
  const employees = useOS((s) => s.employees);
  const dict = t(locale);

  function eventsOn(day: string, hour: number) {
    const stamp = `${day}T${String(hour).padStart(2, "0")}`;
    const meets = meetings.filter((m) => m.when.startsWith(stamp));
    const books = slots.filter((s) => s.start.startsWith(stamp));
    return { meets, books };
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{dict.nav.calendar}</h1>
          <p className="text-sm text-navy/55">
            Agency week plus the public booking types — one calendar, not Calendly on the side.
          </p>
        </div>
        <Link href="/book" className="text-sm text-cobalt">
          Open public booking
        </Link>
      </div>
      <PageSection page="/calendar" id="types" label="Booking types">
      <div className="flex flex-wrap gap-2">
        {types.map((bt) => (
          <Card key={bt.id} className="px-3 py-2 text-sm">
            <span className="font-medium">{bt.name}</span>
            <span className="text-navy/45"> · {bt.durationMin}m · {employees.find((e) => e.id === bt.hostId)?.name}</span>
          </Card>
        ))}
      </div>
      </PageSection>
      <PageSection page="/calendar" id="week" label="Week grid">
      <div className="overflow-x-auto rounded-[16px] border border-navy/8 bg-white">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `72px repeat(${days.length}, 1fr)` }}>
          <div className="border-b border-navy/8 p-2 text-xs text-navy/40" />
          {days.map((d) => (
            <div key={d} className="border-b border-s border-navy/8 p-2 text-center text-xs font-semibold">
              {d.slice(5)}
            </div>
          ))}
          {hours.map((h) => (
            <Fragment key={h}>
              <div className="border-b border-navy/6 p-2 text-[11px] text-navy/40">
                {h}:00
              </div>
              {days.map((d) => {
                const { meets, books } = eventsOn(d, h);
                return (
                  <div key={`${d}-${h}`} className="min-h-[56px] border-b border-s border-navy/6 p-1">
                    {meets.map((m) => (
                      <div key={m.id} className="mb-1 rounded-md bg-cobalt/15 px-1.5 py-1 text-[10px] text-navy">
                        {m.title}
                      </div>
                    ))}
                    {books.map((s) => (
                      <div
                        key={s.id}
                        className={`mb-1 rounded-md px-1.5 py-1 text-[10px] ${s.bookedName ? "bg-mint/25" : "bg-navy/8 text-navy/50"}`}
                      >
                        {s.bookedName ?? "Open slot"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      </PageSection>
      <Card>
        <h2 className="mb-3 font-semibold">Deadlines</h2>
        {tasks.map((t) => (
          <div key={t.id} className="flex justify-between py-1.5 text-sm">
            <span>{locale === "ar" ? t.titleAr : t.title}</span>
            <span className="text-navy/50">{t.due}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
