"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NawahLockup } from "@/components/brand/logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOS } from "@/store/use-os";

function BookInner() {
  const params = useSearchParams();
  const clientId = params.get("client") ?? undefined;
  const slots = useOS((s) => s.bookingSlots);
  const employees = useOS((s) => s.employees);
  const bookSlot = useOS((s) => s.bookSlot);
  const [name, setName] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const open = slots.filter((s) => !s.bookedName);

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-paper px-4 py-12 text-navy">
      <div className="mx-auto max-w-lg space-y-6">
        <NawahLockup />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/40">
            Client booking
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pick a time with Masar Digital</h1>
          <p className="mt-2 text-sm text-navy/55">
            Same calendar the agency runs internally. No Calendly tab on the side.
          </p>
        </div>
        {done ? (
          <Card className="p-5 text-sm">
            Booked. We’ll meet you at <strong>{done}</strong>. A confirmation sits on the agency calendar.
          </Card>
        ) : (
          <Card className="space-y-4 p-5">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="space-y-2">
              {open.length === 0 ? (
                <p className="text-sm text-navy/50">No open slots this week.</p>
              ) : (
                open.map((s) => {
                  const who = employees.find((e) => e.id === s.ownerId);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!name.trim()}
                      onClick={() => {
                        bookSlot(s.id, name.trim(), clientId);
                        setDone(s.start.replace("T", " "));
                      }}
                      className="flex w-full items-center justify-between rounded-[12px] border border-navy/10 px-3 py-3 text-start text-sm hover:border-cobalt disabled:opacity-40"
                    >
                      <span>
                        {s.start.replace("T", " ")} · {s.durationMin} min
                      </span>
                      <span className="text-navy/45">{who?.name}</span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-navy/40">Enter your name, then choose a slot.</p>
          </Card>
        )}
        <Link href="/portal" className="text-sm text-cobalt">
          Back to portal
        </Link>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <BookInner />
    </Suspense>
  );
}
