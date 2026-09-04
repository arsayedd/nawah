"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { NawahLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { seed } from "@/data/seed";
import { AGENCY_NAME } from "@/lib/brand";

const staffShown = seed.employees.filter((e) =>
  ["u_ahmed", "u_sara", "u_lina", "u_maya"].includes(e.id),
);
const clients = seed.clients.filter((c) => c.portalEnabled);

function LoginInner() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [kind, setKind] = useState<"staff" | "client">("staff");
  const [email, setEmail] = useState(staffShown[0]?.email ?? "");
  const [password, setPassword] = useState("nawah");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not sign in");
      return;
    }
    const dest =
      kind === "client"
        ? "/portal"
        : next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/home";
    router.replace(dest);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4 text-white">
      <div className="w-full max-w-md space-y-6">
        <NawahLockup inverted />
        <div>
          <h1 className="text-2xl font-semibold">Sign in to {AGENCY_NAME}</h1>
          <p className="mt-1 text-sm text-white/60">
            Staff see the OS. Clients open a portal with no agency sidebar and no internal cost.
          </p>
        </div>
        <div className="flex rounded-[10px] bg-white/10 p-1 text-sm">
          <button
            type="button"
            className={`flex-1 rounded-[8px] py-2 ${kind === "staff" ? "bg-white text-navy" : "text-white/70"}`}
            onClick={() => {
              setKind("staff");
              setEmail(staffShown[0]?.email ?? "");
              setPassword("nawah");
            }}
          >
            Team
          </button>
          <button
            type="button"
            className={`flex-1 rounded-[8px] py-2 ${kind === "client" ? "bg-white text-navy" : "text-white/70"}`}
            onClick={() => {
              setKind("client");
              setEmail(clients[0]?.email ?? "");
              setPassword("portal");
            }}
          >
            Client portal
          </button>
        </div>
        <Card className="space-y-3 bg-white p-5 text-navy">
          <div className="flex flex-wrap gap-2">
            {(kind === "staff" ? staffShown : clients).map((row) => {
              const mail = "email" in row ? row.email : "";
              const label = "name" in row ? row.name : "";
              return (
                <button
                  key={mail}
                  type="button"
                  onClick={() => setEmail(mail ?? "")}
                  className={`rounded-full px-3 py-1 text-xs ${
                    email === mail ? "bg-navy text-white" : "bg-paper text-navy/70"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {error ? <p className="text-sm text-coral">{error}</p> : null}
          <Button className="w-full" disabled={busy} onClick={() => void submit()}>
            {busy ? "Signing in…" : "Enter"}
          </Button>
          <p className="text-[11px] text-navy/45">
            Demo passwords: team <code>nawah</code> · portal <code>portal</code>. Set{" "}
            <code>NAWAH_SESSION_SECRET</code> in production.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
