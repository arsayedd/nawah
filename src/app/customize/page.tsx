"use client";

import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ALL_MODULES } from "@/lib/access";
import { PAGE_SECTIONS } from "@/lib/page-layout";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

const HOME_WIDGETS = PAGE_SECTIONS["/home"] ?? [];

export default function CustomizePage() {
  const locale = useOS((s) => s.locale);
  const prefs = useOS((s) => s.prefs);
  const toggleNavItem = useOS((s) => s.toggleNavItem);
  const toggleHomeWidget = useOS((s) => s.toggleHomeWidget);
  const togglePageSection = useOS((s) => s.togglePageSection);
  const setEditLayout = useOS((s) => s.setEditLayout);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Workspace"
        title={dict.nav.customize}
        description="Show or hide any module, any home widget, and any block on every OS page. Turn on layout edit to remove records in place."
        actions={
          <Button size="sm" variant={prefs.editLayout ? "default" : "outline"} onClick={() => setEditLayout(!prefs.editLayout)}>
            {prefs.editLayout ? "Editing layout" : "Edit layout"}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <PageSection page="/customize" id="nav" label="Sidebar modules">
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
        </PageSection>
        <PageSection page="/customize" id="home" label="Home widgets">
          <Card>
            <h2 className="mb-3 font-semibold">Home widgets</h2>
            <div className="grid gap-2">
              {HOME_WIDGETS.map((w) => {
                const on = !prefs.hiddenHomeWidgets.includes(w.id);
                return (
                  <label key={w.id} className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm">
                    <span>{w.label}</span>
                    <input type="checkbox" checked={on} onChange={() => toggleHomeWidget(w.id)} />
                  </label>
                );
              })}
            </div>
          </Card>
        </PageSection>
      </div>
      <PageSection page="/customize" id="pages" label="Every page">
        <Card>
          <h2 className="mb-3 font-semibold">Every page</h2>
          <p className="mb-4 text-sm text-navy/55">
            Uncheck a block to hide it. You can also open any page and use the sliders icon in the header.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(PAGE_SECTIONS)
              .filter(([page]) => page !== "/home" && page !== "/customize")
              .map(([page, sections]) => (
                <div key={page}>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">{page}</div>
                  <div className="grid gap-1.5">
                    {sections.map((s) => {
                      const hidden = prefs.hiddenPageSections[page] ?? [];
                      const on = !hidden.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-1.5 text-sm">
                          <span>{s.label}</span>
                          <input type="checkbox" checked={on} onChange={() => togglePageSection(page, s.id)} />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </PageSection>
    </div>
  );
}
