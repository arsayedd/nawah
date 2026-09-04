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
  const types = useOS((s) => s.bookingTypes);
  const employees = useOS((s) => s.employees);
  const bookSlot = useOS((s) => s.bookSlot);
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const selected = types.find((t) => t.id === typeId);
  const open = slots.filter(
    (s) => !s.bookedName && (!typeId || s.typeId === typeId || !s.typeId),
  );

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-paper px-4 py-12 text-navy">
      <div className="mx-auto max-w-lg space-y-6">
        <NawahLockup />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/40">
            Client booking
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Book time with Masar Digital
          </h1>
          <p className="mt-2 text-sm text-navy/55">
            Pick an event type, then a slot. It lands on the agency calendar — no extra Calendly account.
          </p>
        </div>
        {done ? (
          <Card className="p-5 text-sm">
            Booked <strong>{selected?.name}</strong> at <strong>{done}</strong>.
          </Card>
        ) : (
          <>
            <div className="grid gap-2">
              {types.map((bt) => {
                const host = employees.find((e) => e.id === bt.hostId);
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setTypeId(bt.id)}
                    className={`rounded-[14px] border p-4 text-start ${
                      typeId === bt.id ? "border-cobalt bg-cobalt/8" : "border-navy/10 bg-white"
                    }`}
                  >
                    <div className="font-semibold">{bt.name}</div>
                    <div className="text-sm text-navy/55">
                      {bt.durationMin} min · {host?.name}
                    </div>
                    <p className="mt-1 text-sm text-navy/60">{bt.description}</p>
                  </button>
                );
              })}
            </div>
            {typeId ? (
              <Card className="space-y-4 p-5">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="space-y-2">
                  {open.length === 0 ? (
                    <p className="text-sm text-navy/50">No open slots for this type.</p>
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
              </Card>
            ) : null}
          </>
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
