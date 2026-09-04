"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function FilesPage() {
  const locale = useOS((s) => s.locale);
  const files = useOS((s) => s.files);
  const clients = useOS((s) => s.clients);
  const projects = useOS((s) => s.projects);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Assets"
        title={dict.nav.files}
        description="Every file sits on a client, a project, and often a deliverable. Design files open in Creative Review."
      />
      <div className="grid gap-3">
        {files.length === 0 ? (
          <EmptyState
            title="No files in this workspace"
            copy="Demo files sit on Lumin and Cairo Bites. Reset the demo from Settings if this list was wiped."
            href="/settings"
            action="Open settings"
          />
        ) : null}
        {files.map((f) => {
          const client = clients.find((c) => c.id === f.clientId);
          const project = projects.find((p) => p.id === f.projectId);
          return (
            <Card key={f.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-navy/45">
                  {client?.name} · {project?.name} · v{f.version}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    f.status === "approved"
                      ? "mint"
                      : f.status === "client"
                        ? "coral"
                        : "cobalt"
                  }
                >
                  {f.status}
                </Badge>
                {f.kind === "design" && f.taskId ? (
                  <Link href={`/review/${f.taskId}`} className="text-sm text-cobalt">
                    Review
                  </Link>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
