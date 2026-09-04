"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CommentThread } from "@/components/comments/thread";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const doc = useOS((s) => s.docs.find((d) => d.id === id));
  const docs = useOS((s) => s.docs);
  const projects = useOS((s) => s.projects);
  const saveDoc = useOS((s) => s.saveDoc);
  const addDoc = useOS((s) => s.addDoc);
  const convertDocToTasks = useOS((s) => s.convertDocToTasks);
  const applySopToProject = useOS((s) => s.applySopToProject);
  const addDocRow = useOS((s) => s.addDocRow);
  const updateDocCell = useOS((s) => s.updateDocCell);
  const router = useRouter();
  const dict = t(locale);
  const [childTitle, setChildTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");

  if (!doc) {
    return (
      <div className="space-y-3">
        <Link href="/docs" className="text-sm text-cobalt">
          ← {dict.nav.docs}
        </Link>
        <p>Page not found.</p>
      </div>
    );
  }

  const children = docs.filter((d) => d.parentId === doc.id);
  const roots = docs.filter((d) => !d.parentId);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_240px]">
      <div className="text-sm">
        <Link href="/docs" className="text-cobalt">
          ← {dict.nav.docs}
        </Link>
        <div className="mt-4 space-y-1">
          {roots.map((d) => (
            <div key={d.id}>
              <Link
                href={`/docs/${d.id}`}
                className={`block rounded-[8px] px-2 py-1.5 ${
                  d.id === doc.id ? "bg-navy text-white" : "hover:bg-paper"
                }`}
              >
                {d.title}
              </Link>
              {docs
                .filter((ch) => ch.parentId === d.id)
                .map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/docs/${ch.id}`}
                    className={`ms-3 block rounded-[8px] px-2 py-1 text-xs ${
                      ch.id === doc.id ? "bg-navy text-white" : "text-navy/60 hover:bg-paper"
                    }`}
                  >
                    {ch.title}
                  </Link>
                ))}
            </div>
          ))}
        </div>
      </div>

      <PageSection page="/docs/:id" id="editor" label="Editor">
        <Card className="p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-wide text-navy/40">{doc.kind ?? "page"}</p>
          <Input
            className="mt-2 h-auto border-0 bg-transparent px-0 text-3xl font-semibold tracking-tight shadow-none focus:ring-0"
            value={locale === "ar" ? doc.titleAr : doc.title}
            onChange={(e) => saveDoc(doc.id, { title: e.target.value })}
          />
          {children.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {children.map((ch) => (
                <Link key={ch.id} href={`/docs/${ch.id}`} className="text-sm text-cobalt">
                  {ch.title}
                </Link>
              ))}
            </div>
          ) : null}

          {doc.kind === "database" && doc.columns ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-navy/40">
                    {doc.columns.map((col) => (
                      <th key={col} className="pb-2 text-start font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(doc.rows ?? []).map((row) => (
                    <tr key={row.id} className="border-t border-navy/6">
                      {doc.columns!.map((col) => (
                        <td key={col} className="py-1">
                          <input
                            className="h-9 w-full rounded-[8px] border border-transparent bg-transparent px-1 text-sm outline-none hover:border-navy/10 focus:border-cobalt"
                            value={row.values[col] ?? ""}
                            onChange={(e) => updateDocCell(doc.id, row.id, col, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                onClick={() => {
                  const values: Record<string, string> = {};
                  for (const col of doc.columns ?? []) values[col] = "";
                  addDocRow(doc.id, values);
                }}
              >
                Add row
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                className="mt-4 min-h-[320px] font-sans"
                value={locale === "ar" ? doc.bodyAr : doc.body}
                onChange={(e) => saveDoc(doc.id, { body: e.target.value })}
                placeholder="Write the page. One idea per line."
              />
              <p className="mt-2 text-xs text-navy/40">
                Saved as you type. Use Turn lines into tasks to drop this onto a project.
              </p>
            </>
          )}

          <form
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const name = childTitle.trim();
              if (!name) return;
              const child = addDoc(name, "wiki", doc.id);
              setChildTitle("");
              router.push(`/docs/${child}`);
            }}
          >
            <Input
              className="max-w-xs"
              placeholder="Add a subpage"
              value={childTitle}
              onChange={(e) => setChildTitle(e.target.value)}
            />
            <Button type="submit" size="sm" variant="outline">
              Add subpage
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              className="h-10 rounded-[10px] border border-navy/10 px-3 text-sm"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                convertDocToTasks(doc.id, projectId || undefined);
                toast.success("Lines became tasks on the project");
                if (projectId) router.push(`/projects/${projectId}`);
              }}
            >
              Turn lines into tasks
            </Button>
            {projectId ? (
              <Button
                variant="outline"
                onClick={() => {
                  applySopToProject(doc.id, projectId);
                  toast.success("SOP applied");
                  router.push(`/projects/${projectId}`);
                }}
              >
                Apply SOP
              </Button>
            ) : null}
          </div>
        </Card>
      </PageSection>
      <PageSection page="/docs/:id" id="comments" label="Comments">
        <CommentThread entity="doc" entityId={doc.id} />
      </PageSection>
    </div>
  );
}
