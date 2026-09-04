"use client";

import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { ALL_MODULES } from "@/lib/access";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

const HOME_WIDGETS = [
  ["spine", "Process spine"],
  ["cash", "Cash at risk"],
  ["kpis", "KPI cards"],
  ["health", "Project health"],
  ["inbox", "Notices, mail, chat, files"],
  ["decisions", "Decisions & load"],
  ["spotlight", "Quotes & meetings"],
  ["pipeline", "Pipeline & risk"],
  ["ops", "Contracts & retainers"],
  ["people", "People"],
  ["catalog", "Catalog & cash"],
  ["automations", "Automations"],
  ["projects", "Projects"],
  ["os", "Whole OS links"],
] as const;

export default function CustomizePage() {
  const locale = useOS((s) => s.locale);
  const prefs = useOS((s) => s.prefs);
  const toggleNavItem = useOS((s) => s.toggleNavItem);
  const toggleHomeWidget = useOS((s) => s.toggleHomeWidget);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Workspace"
        title={dict.nav.customize}
        description="Show or hide any module in the sidebar, and any block on the owner home. Changes apply for everyone in this workspace."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Sidebar modules</h2>
          <div className="grid gap-2">
            {ALL_MODULES.map((href) => {
              const on = !prefs.hiddenNav.includes(href);
              return (
                <label key={href} className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm">
                  <span>{href}</span>
                  <input type="checkbox" checked={on} onChange={() => toggleNavItem(href)} />
                </label>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Home widgets</h2>
          <div className="grid gap-2">
            {HOME_WIDGETS.map(([id, label]) => {
              const on = !prefs.hiddenHomeWidgets.includes(id);
              return (
                <label key={id} className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm">
                  <span>{label}</span>
                  <input type="checkbox" checked={on} onChange={() => toggleHomeWidget(id)} />
                </label>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
