"use client";

import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function AutomationsPage() {
  const locale = useOS((s) => s.locale);
  const automations = useOS((s) => s.automations);
  const logs = useOS((s) => s.automationLogs);
  const toggleAutomation = useOS((s) => s.toggleAutomation);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="When this happens"
        title={dict.nav.automations}
        description="Trigger → conditions → actions. Quote accept already runs in the OS. Toggle the rest as the agency grows."
      />
      <div className="grid gap-3">
        {automations.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="mt-1 text-xs text-navy/45">
                  When {a.trigger} · if {a.condition} → {a.action}
                </div>
              </div>
              <button
                onClick={() => toggleAutomation(a.id)}
                className="text-sm text-cobalt"
              >
                <Badge tone={a.enabled ? "mint" : "slate"}>
                  {a.enabled ? "On" : "Off"}
                </Badge>
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">Activity log</h2>
        {logs.map((l) => (
          <div key={l.id} className="py-1 text-sm text-navy/70">
            {l.at.slice(0, 16)} · {l.detail}
          </div>
        ))}
      </Card>
    </div>
  );
}
