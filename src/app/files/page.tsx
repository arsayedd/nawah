"use client";

import Link from "next/link";
import { useState } from "react";
import { CommentThread } from "@/components/comments/thread";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
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
  const [openId, setOpenId] = useState<string | null>(null);
  const setFileStatus = useOS((s) => s.setFileStatus);
  const bumpFileVersion = useOS((s) => s.bumpFileVersion);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Assets"
        title={dict.nav.files}
        description="Every file sits on a client, a project, and often a deliverable. Design files open in Creative Review."
      />
      <PageSection page="/files" id="list" label="File list">
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
              <RecordChrome key={f.id} collection="files" id={f.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="button" className="text-start" onClick={() => setOpenId(openId === f.id ? null : f.id)}>
                      <div className="font-semibold">{f.name}</div>
                      <div className="text-xs text-navy/45">
                        {client?.name} · {project?.name} · v{f.version}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          f.status === "approved" ? "mint" : f.status === "client" ? "coral" : "cobalt"
                        }
                      >
                        {f.status}
                      </Badge>
                      <select
                        className="h-8 rounded-[8px] border border-navy/10 px-2 text-xs"
                        value={f.status}
                        onChange={(e) => setFileStatus(f.id, e.target.value as typeof f.status)}
                      >
                        {(["working", "internal", "client", "approved"] as const).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-xs text-navy/50 hover:text-cobalt"
                        onClick={() => bumpFileVersion(f.id)}
                      >
                        New version
                      </button>
                      {f.kind === "design" && f.taskId ? (
                        <Link href={`/review/${f.taskId}`} className="text-sm text-cobalt">
                          Review
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {openId === f.id ? (
                    <div className="mt-3">
                      <CommentThread entity="file" entityId={f.id} />
                    </div>
                  ) : null}
                </Card>
              </RecordChrome>
            );
          })}
        </div>
      </PageSection>
    </div>
  );
}
