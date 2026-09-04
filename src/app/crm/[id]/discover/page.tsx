"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { useOS } from "@/store/use-os";

const fields = [
  ["goal", "Project goal"],
  ["problem", "Current problem"],
  ["audience", "Audience"],
  ["competitors", "Competitors"],
  ["services", "Services needed"],
  ["deliverables", "Deliverables"],
  ["timeline", "Timeline"],
  ["budget", "Budget"],
  ["decisionMakers", "Decision makers"],
  ["approval", "Approval path"],
  ["platforms", "Accounts & platforms"],
  ["kpis", "KPIs"],
] as const;

export default function DiscoveryPage() {
  const { id } = useParams<{ id: string }>();
  const lead = useOS((s) => s.leads.find((l) => l.id === id));
  const existing = useOS((s) => s.discoveries.find((d) => d.leadId === id));
  const submitDiscovery = useOS((s) => s.submitDiscovery);
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const [k] of fields) o[k] = (existing?.[k] as string) ?? "";
    return o;
  });

  if (!lead) return <p>Lead not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href={`/crm/${id}`} className="text-sm text-cobalt">
        ← {lead.company}
      </Link>
      <h1 className="text-2xl font-semibold">Discovery — {lead.company}</h1>
      <p className="text-sm text-navy/55">
        Answers land on the lead, a project brief, and the quotation — no copy/paste.
      </p>
      <Card className="space-y-3 p-5">
        {fields.map(([k, label]) => (
          <label key={k} className="block text-sm">
            <span className="mb-1 block text-xs text-navy/45">{label}</span>
            {k === "goal" || k === "problem" ? (
              <Textarea
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            ) : (
              <Input
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            )}
          </label>
        ))}
        <Button
          onClick={() => {
            submitDiscovery(id, {
              goal: form.goal,
              problem: form.problem,
              audience: form.audience,
              competitors: form.competitors,
              services: form.services,
              deliverables: form.deliverables,
              timeline: form.timeline,
              budget: form.budget,
              decisionMakers: form.decisionMakers,
              approval: form.approval,
              platforms: form.platforms,
              kpis: form.kpis,
            });
            router.push(`/crm/${id}`);
          }}
        >
          Save into CRM + brief
        </Button>
      </Card>
    </div>
  );
}
