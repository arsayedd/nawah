"use client";

import Link from "next/link";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function SpacesPage() {
  const locale = useOS((s) => s.locale);
  const spaces = useOS((s) => s.spaces);
  const projects = useOS((s) => s.projects);
  const tasks = useOS((s) => s.tasks);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Workspace"
        title={dict.nav.spaces}
        description="Departments hold client folders and projects. Same tasks as the board — grouped how the agency actually works."
      />
      <PageSection page="/spaces" id="list" label="Departments">
        <div className="grid gap-4 lg:grid-cols-3">
          {spaces.map((sp) => {
            const mine = projects.filter((p) => p.spaceId === sp.id);
            return (
              <RecordChrome key={sp.id} collection="spaces" id={sp.id}>
                <Card className="h-full p-5">
                  <h2 className="font-semibold">{locale === "ar" ? sp.nameAr : sp.name}</h2>
                  <p className="mt-1 text-xs text-navy/45">{mine.length} projects</p>
                  <div className="mt-4 space-y-2">
                    {mine.length === 0 ? (
                      <p className="text-sm text-navy/40">No projects in this space yet.</p>
                    ) : (
                      mine.map((p) => {
                        const pts = tasks.filter((t) => t.projectId === p.id);
                        const done = pts.filter((t) => t.status === "done").length;
                        return (
                          <Link
                            key={p.id}
                            href={`/projects/${p.id}`}
                            className="block rounded-[10px] border border-navy/8 px-3 py-2 text-sm hover:bg-paper"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{locale === "ar" ? p.nameAr : p.name}</span>
                              <Badge
                                tone={
                                  p.status === "healthy" ? "mint" : p.status === "delayed" ? "coral" : "cobalt"
                                }
                              >
                                {dict.health[p.status]}
                              </Badge>
                            </div>
                            <div className="mt-1 text-[11px] text-navy/45">
                              {done}/{pts.length} tasks · {egp(p.expectedRevenue, locale)}
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </Card>
              </RecordChrome>
            );
          })}
        </div>
      </PageSection>
    </div>
  );
}
