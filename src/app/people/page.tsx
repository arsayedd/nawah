"use client";

import Link from "next/link";
import { useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ALL_MODULES, modulesFor } from "@/lib/access";
import { t } from "@/lib/i18n";
import type { AccessRole, Employee } from "@/lib/types";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const ROLES: AccessRole[] = ["owner", "admin", "sales", "am", "pm", "team", "finance", "hr", "freelancer", "reviewer"];

const emptyForm = {
  name: "",
  email: "",
  role: "",
  department: "",
  accessRole: "team" as AccessRole,
  salary: "18000",
  hourlyCost: "150",
  billRate: "400",
  weeklyHours: "40",
  kind: "staff" as "staff" | "freelancer",
};

export default function PeoplePage() {
  const locale = useOS((s) => s.locale);
  const employees = useOS((s) => s.employees);
  const upsertEmployee = useOS((s) => s.upsertEmployee);
  const removeEmployee = useOS((s) => s.removeEmployee);
  const dict = t(locale);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="People"
        title={dict.nav.people}
        description="Add staff, set salary and cost, pick a role, and lock which modules they can open."
        actions={
          <Button size="sm" onClick={() => { setForm(emptyForm); setOpen(true); }}>
            Add employee
          </Button>
        }
      />
      <PageSection page="/people" id="list" label="Employee cards">
      <div className="grid gap-3 md:grid-cols-2">
        {employees.map((e) => (
          <RecordChrome key={e.id} collection="employees" id={e.id}>
            <PersonCard employee={e} locale={locale} onRemove={() => removeEmployee(e.id)} />
          </RecordChrome>
        ))}
      </div>
      </PageSection>
      <Modal open={open} onOpenChange={setOpen} title="New employee">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Job title" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <select
            className="h-10 rounded-[10px] border border-navy/10 px-3 text-sm"
            value={form.accessRole}
            onChange={(e) => setForm({ ...form, accessRole: e.target.value as AccessRole })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-[10px] border border-navy/10 px-3 text-sm"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as "staff" | "freelancer" })}
          >
            <option value="staff">Staff</option>
            <option value="freelancer">Freelancer</option>
          </select>
          <Input placeholder="Monthly salary EGP" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <Input placeholder="Cost / hour" value={form.hourlyCost} onChange={(e) => setForm({ ...form, hourlyCost: e.target.value })} />
          <Input placeholder="Bill / hour" value={form.billRate} onChange={(e) => setForm({ ...form, billRate: e.target.value })} />
          <Input placeholder="Weekly hours" value={form.weeklyHours} onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })} />
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            if (!form.name.trim()) return;
            upsertEmployee({
              name: form.name.trim(),
              email: form.email,
              role: form.role || "Team member",
              department: form.department || "Delivery",
              accessRole: form.accessRole,
              kind: form.kind,
              salary: Number(form.salary) || 0,
              hourlyCost: Number(form.hourlyCost) || 150,
              billRate: Number(form.billRate) || 400,
              weeklyHours: Number(form.weeklyHours) || 40,
            });
            setOpen(false);
          }}
        >
          Save
        </Button>
      </Modal>
    </div>
  );
}

function PersonCard({
  employee: e,
  locale,
  onRemove,
}: {
  employee: Employee;
  locale: "ar" | "en";
  onRemove: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/people/${e.id}`} className="font-semibold hover:text-cobalt">
            {locale === "ar" ? e.nameAr : e.name}
          </Link>
          <div className="text-xs text-navy/50">
            {e.role} · {e.department} · {e.accessRole ?? "team"}
          </div>
          <div className="mt-1 text-xs text-navy/45">{e.email}</div>
        </div>
        <Badge tone={e.status === "inactive" ? "coral" : "mint"}>{e.status ?? "active"}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>Salary {egp(e.salary ?? 0, locale)}</div>
        <div>Cost {egp(e.hourlyCost, locale)}/h</div>
        <div>Bill {egp(e.billRate, locale)}/h</div>
        <div>{e.weeklyHours}h / week</div>
      </div>
      <div className="mt-3 text-[11px] text-navy/40">
        Access: {modulesFor(e).length} modules
      </div>
      {e.id !== "u_ahmed" ? (
        <button type="button" onClick={onRemove} className="mt-3 text-xs text-coral">
          Remove
        </button>
      ) : null}
    </Card>
  );
}

export const MODULE_COUNT = ALL_MODULES.length;
