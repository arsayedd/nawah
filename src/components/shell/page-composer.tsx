"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOS } from "@/store/use-os";
import type { QuickKind } from "@/store/use-os";

type Kind = QuickKind;

type Spec = {
  kind: Kind;
  label: string;
  placeholder: string;
  money?: boolean;
  alts?: { kind: Kind; label: string; money?: boolean }[];
  href?: (id: string) => string;
};

function specFor(pathname: string): Spec | null {
  if (pathname.startsWith("/crm/") && pathname.includes("/discover")) return null;
  if (pathname.startsWith("/crm/") && pathname !== "/crm") return null;
  if (pathname === "/crm")
    return { kind: "lead", label: "Add lead", placeholder: "Company name", href: (id) => `/crm/${id}` };
  if (pathname === "/clients")
    return { kind: "client", label: "Add client", placeholder: "Client name", href: (id) => `/clients/${id}` };
  if (pathname.startsWith("/clients/"))
    return { kind: "project", label: "Add project for this client", placeholder: "Project name" };
  if (pathname === "/quotes")
    return { kind: "quote", label: "Add quotation", placeholder: "Optional title", href: (id) => `/quotes/${id}` };
  if (pathname === "/catalog")
    return { kind: "catalog", label: "Add service package", placeholder: "Package name", money: true };
  if (pathname === "/finance")
    return {
      kind: "invoice",
      label: "Add invoice",
      placeholder: "Note",
      money: true,
      alts: [
        { kind: "invoice", label: "Invoice", money: true },
        { kind: "expense", label: "Expense", money: true },
        { kind: "hours", label: "Time", money: true },
      ],
    };
  if (pathname === "/calendar")
    return {
      kind: "meeting",
      label: "Add meeting",
      placeholder: "Meeting title",
      alts: [
        { kind: "meeting", label: "Meeting" },
        { kind: "booking", label: "Booking type" },
      ],
    };
  if (pathname === "/projects")
    return {
      kind: "project",
      label: "Add project",
      placeholder: "Project name",
      href: (id) => `/projects/${id}`,
      alts: [
        { kind: "project", label: "Project" },
        { kind: "task", label: "Task" },
      ],
    };
  if (pathname.startsWith("/projects/"))
    return { kind: "task", label: "Add task on this project", placeholder: "Task title" };
  if (pathname === "/my-work" || pathname === "/workload")
    return { kind: "task", label: "Add task", placeholder: "Task title" };
  if (pathname === "/spaces")
    return { kind: "space", label: "Add department", placeholder: "Space name" };
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return null;
  if (pathname === "/files")
    return { kind: "file", label: "Add file", placeholder: "File name" };
  if (pathname === "/portal")
    return { kind: "request", label: "Add portal request", placeholder: "Request title" };
  if (pathname === "/book")
    return { kind: "booking", label: "Add booking type", placeholder: "Event type" };
  if (pathname === "/time")
    return { kind: "hours", label: "Log hours", placeholder: "Note (optional)", money: true };
  if (pathname === "/contracts")
    return { kind: "contract", label: "Add contract draft", placeholder: "Reference" };
  if (pathname === "/retainers")
    return { kind: "retainer", label: "Add retainer", placeholder: "Retainer name", money: true };
  if (pathname === "/people" || pathname === "/team")
    return { kind: "employee", label: "Add person", placeholder: "Full name", href: (id) => `/people/${id}` };
  if (pathname.startsWith("/people/"))
    return { kind: "leave", label: "Request leave for this workspace", placeholder: "Leave note" };
  if (pathname === "/hr")
    return { kind: "leave", label: "Add leave request", placeholder: "Who / reason" };
  if (pathname === "/automations")
    return { kind: "automation", label: "Add automation", placeholder: "Rule name" };
  if (pathname === "/home")
    return { kind: "lead", label: "Quick add a lead", placeholder: "Company name", href: (id) => `/crm/${id}` };
  if (pathname === "/accounts")
    return { kind: "client", label: "Add account", placeholder: "Client name", href: (id) => `/clients/${id}` };
  return null;
}

export function PageComposer() {
  const pathname = usePathname();
  const router = useRouter();
  const quickAdd = useOS((s) => s.quickAdd);
  const spec = specFor(pathname);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);

  if (!spec) return null;
  const page = spec;

  const activeKind = kind ?? page.kind;
  const activeAlt = page.alts?.find((a) => a.kind === activeKind);
  const money = activeAlt?.money ?? page.money;
  const projectId = pathname.startsWith("/projects/") ? pathname.split("/")[2] : undefined;
  const clientId = pathname.startsWith("/clients/") ? pathname.split("/")[2] : undefined;

  function submit() {
    const name = title.trim();
    if (!name && activeKind !== "quote" && activeKind !== "hours") return;
    setBusy(true);
    const id = quickAdd(activeKind, name || "Untitled", {
      amount: amount ? Number(amount) : undefined,
      projectId,
      clientId,
    });
    toast.success("Saved to this page");
    setTitle("");
    setAmount("");
    setBusy(false);
    if (page.href && activeKind === page.kind && id && !id.startsWith("/")) router.push(page.href(id));
  }

  return (
    <form
      className="mb-5 rounded-[16px] border border-navy/10 bg-white p-3 shadow-[0_1px_0_rgba(7,27,58,0.04)]"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/40">
        {page.label}
      </p>
      {page.alts ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {page.alts.map((a) => (
            <button
              key={a.kind}
              type="button"
              onClick={() => setKind(a.kind)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                activeKind === a.kind ? "bg-navy text-white" : "bg-paper text-navy/60"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={page.placeholder}
        />
        {money ? (
          <Input
            className="sm:max-w-[140px]"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={activeKind === "hours" ? "Hours" : "EGP"}
          />
        ) : null}
        <Button type="submit" disabled={busy} className="sm:w-auto">
          Add
        </Button>
      </div>
    </form>
  );
}
