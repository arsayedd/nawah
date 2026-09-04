"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
  const convertDocToTasks = useOS((s) => s.convertDocToTasks);
  const applySopToProject = useOS((s) => s.applySopToProject);
  const addDocComment = useOS((s) => s.addDocComment);
  const addDocRow = useOS((s) => s.addDocRow);
  const comments = useOS((s) => s.docComments.filter((c) => c.docId === id));
  const employees = useOS((s) => s.employees);
  const router = useRouter();
  const dict = t(locale);
  const [note, setNote] = useState("");

  if (!doc) {
    return <p>Page not found.</p>;
  }

  const body = locale === "ar" ? doc.bodyAr : doc.body;
  const children = docs.filter((d) => d.parentId === doc.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr_240px]">
      <div className="text-sm">
        <Link href="/docs" className="text-cobalt">
          ← {dict.nav.docs}
        </Link>
        <div className="mt-4 space-y-1">
          {docs
            .filter((d) => !d.parentId)
            .map((d) => (
              <Link
                key={d.id}
                href={`/docs/${d.id}`}
                className={`block rounded-[8px] px-2 py-1 ${d.id === doc.id ? "bg-navy text-white" : "hover:bg-paper"}`}
              >
                {d.title}
              </Link>
            ))}
        </div>
      </div>
      <Card className="p-8">
        <p className="text-[11px] uppercase tracking-wide text-navy/40">{doc.kind ?? "page"}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {locale === "ar" ? doc.titleAr : doc.title}
        </h1>
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
                      <td key={col} className="py-2">
                        {row.values[col] ?? "—"}
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
                for (const col of doc.columns ?? []) values[col] = "—";
                addDocRow(doc.id, values);
              }}
            >
              Add row
            </Button>
          </div>
        ) : (
          <>
            <Textarea
              className="mt-4 min-h-[260px] font-sans"
              value={body}
              onChange={(e) => saveDoc(doc.id, e.target.value)}
            />
            <p className="mt-2 text-xs text-navy/40">
              Write like Notion: one idea per line. Headings, lists, and SOPs all convert to tasks.
            </p>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              convertDocToTasks(doc.id);
              router.push("/projects");
            }}
          >
            Turn lines into tasks
          </Button>
          {projects[0] ? (
            <Button
              variant="outline"
              onClick={() => {
                applySopToProject(doc.id, projects[0].id);
                router.push(`/projects/${projects[0].id}`);
              }}
            >
              Apply SOP to {projects[0].name}
            </Button>
          ) : null}
        </div>
      </Card>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Comments</h2>
        {comments.map((c) => (
          <Card key={c.id} className="p-3 text-sm">
            <div className="text-[11px] text-navy/40">
              {employees.find((e) => e.id === c.authorId)?.name}
            </div>
            {c.body}
          </Card>
        ))}
        <Input placeholder="Comment" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button
          size="sm"
          disabled={!note.trim()}
          onClick={() => {
            addDocComment(doc.id, note.trim());
            setNote("");
          }}
        >
          Add comment
        </Button>
      </div>
    </div>
  );
}
