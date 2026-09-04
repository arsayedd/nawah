"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CommentThread } from "@/components/comments/thread";
import { PageSection } from "@/components/shell/page-section";
import { ALL_MODULES, modulesFor } from "@/lib/access";
import type { AccessRole } from "@/lib/types";
import { useOS } from "@/store/use-os";

const ROLES: AccessRole[] = ["owner", "admin", "sales", "am", "pm", "team", "finance", "hr", "freelancer", "reviewer"];

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const employee = useOS((s) => s.employees.find((e) => e.id === id));
  const upsertEmployee = useOS((s) => s.upsertEmployee);
  const setEmployeeModules = useOS((s) => s.setEmployeeModules);
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "");
  const [salary, setSalary] = useState(String(employee?.salary ?? 0));
  const [accessRole, setAccessRole] = useState<AccessRole>(employee?.accessRole ?? "team");

  if (!employee) return <p>Employee not found.</p>;

  const allowed = modulesFor({ ...employee, accessRole, modules: employee.modules });
  const custom = employee.modules ?? allowed;

  return (
    <div className="space-y-5">
      <Link href="/people" className="text-sm text-cobalt">← People</Link>
      <h1 className="text-2xl font-bold">{employee.name}</h1>
      <PageSection page="/people/:id" id="profile" label="Profile">
      <Card className="grid gap-3 sm:grid-cols-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
        <Input value={salary} onChange={(e) => setSalary(e.target.value)} />
        <select
          className="h-10 rounded-[10px] border border-navy/10 px-3 text-sm"
          value={accessRole}
          onChange={(e) => setAccessRole(e.target.value as AccessRole)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <Button
          onClick={() =>
            upsertEmployee({
              id: employee.id,
              name,
              role,
              salary: Number(salary) || 0,
              accessRole,
            })
          }
        >
          Save profile
        </Button>
      </Card>
      </PageSection>
      <PageSection page="/people/:id" id="access" label="Module access">
      <Card>
        <h2 className="font-semibold">Module access</h2>
        <p className="mt-1 text-sm text-navy/55">
          Uncheck to hide that area when they use the OS. Owner/admin still see everything unless you switch their role.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ALL_MODULES.map((href) => {
            const on = custom.includes(href);
            return (
              <label key={href} className="flex items-center gap-2 rounded-[10px] border border-navy/8 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => {
                    const next = on ? custom.filter((h) => h !== href) : [...custom, href];
                    setEmployeeModules(employee.id, next);
                  }}
                />
                {href.replace("/", "") || "home"}
              </label>
            );
          })}
        </div>
      </Card>
      </PageSection>
      <PageSection page="/people/:id" id="comments" label="Comments">
        <CommentThread entity="employee" entityId={employee.id} />
      </PageSection>
    </div>
  );
}
