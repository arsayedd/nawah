"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { answerNawah } from "@/lib/nawah-ai";
import { pickOsState } from "@/lib/os/payload";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

const prompts = [
  "What needs me today?",
  "Why is a project losing money?",
  "Who is free next week for Shopify?",
];

export default function AiPage() {
  const locale = useOS((s) => s.locale);
  const dict = t(locale);
  const [q, setQ] = useState(prompts[0]);
  const [answers, setAnswers] = useState(() => answerNawah(prompts[0], pickOsState(useOS.getState())));

  function ask(question: string) {
    setQ(question);
    setAnswers(answerNawah(question, pickOsState(useOS.getState())));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Uses workspace data only"
        title={dict.nav.ai}
        description="Nawah will not invent numbers. If ads, email, or a warehouse is not connected, it says so."
      />
      <PageSection page="/ai" id="prompts" label="Prompts">
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Button key={p} size="sm" variant="outline" onClick={() => ask(p)}>
              {p}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} />
          <Button onClick={() => ask(q)}>Ask</Button>
        </div>
      </PageSection>
      <PageSection page="/ai" id="answer" label="Answer">
        <div className="grid gap-3">
          {answers.map((a, i) => (
            <Card key={`${a.title}-${i}`} className="p-4">
              <div className="font-semibold">{a.title}</div>
              <p className="mt-1 text-sm text-navy/65">{a.body}</p>
              {a.href ? (
                <Link href={a.href} className="mt-2 inline-block text-sm text-cobalt">
                  Open
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
