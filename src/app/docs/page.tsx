"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocsPage() {
  const locale = useOS((s) => s.locale);
  const docs = useOS((s) => s.docs);
  const addDoc = useOS((s) => s.addDoc);
  const router = useRouter();
  const dict = t(locale);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"wiki" | "sop" | "brief" | "template" | "database">("wiki");

  const roots = docs.filter((d) => !d.parentId);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter((d) => `${d.title} ${d.titleAr} ${d.body}`.toLowerCase().includes(needle));
  }, [docs, query]);

  function create(nextKind: "wiki" | "sop" | "brief" | "template" | "database" = kind) {
    const id = addDoc(title.trim() || (nextKind === "database" ? "Untitled database" : "Untitled"), nextKind);
    setTitle("");
    router.push(`/docs/${id}`);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Notion-like"
        title={dict.nav.docs}
        description="Wiki, SOPs, briefs, and databases. Open a page to write — lines can become tasks."
      />
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        <Input
          className="max-w-sm"
          placeholder="New page title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="h-10 rounded-[10px] border border-navy/10 bg-white px-3 text-sm"
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
        >
          <option value="wiki">Page</option>
          <option value="sop">SOP</option>
          <option value="brief">Brief</option>
          <option value="template">Template</option>
          <option value="database">Database</option>
        </select>
        <Button type="submit" size="sm">
          Create
        </Button>
      </form>
      <Input
        className="max-w-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={locale === "ar" ? "بحث في الويكي" : "Search pages"}
      />
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <PageSection page="/docs" id="tree" label="Workspace tree">
          <Card className="p-3">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-navy/40">
              Workspace
            </div>
            {roots.length === 0 ? (
              <p className="px-2 py-4 text-sm text-navy/45">No pages yet.</p>
            ) : (
              roots.map((doc) => (
                <div key={doc.id} className="mb-1">
                  <Link
                    href={`/docs/${doc.id}`}
                    className="block rounded-[8px] px-2 py-1.5 text-sm font-medium hover:bg-paper"
                  >
                    {locale === "ar" ? doc.titleAr : doc.title}
                  </Link>
                  {docs
                    .filter((d) => d.parentId === doc.id)
                    .map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/docs/${ch.id}`}
                        className="ms-3 block rounded-[8px] px-2 py-1 text-xs text-navy/60 hover:bg-paper"
                      >
                        {locale === "ar" ? ch.titleAr : ch.title}
                      </Link>
                    ))}
                </div>
              ))
            )}
          </Card>
        </PageSection>
        <PageSection page="/docs" id="cards" label="Page cards">
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.length === 0 ? (
              <EmptyState
                title="Wiki is empty"
                copy="Create a page above, or reset the demo from Settings."
                href="/settings"
                action="Reset demo"
              />
            ) : (
              visible.map((doc) => (
                <RecordChrome key={doc.id} collection="docs" id={doc.id}>
                  <Link href={`/docs/${doc.id}`}>
                    <Card className="h-full p-4">
                      <div className="text-[11px] uppercase tracking-wide text-navy/40">
                        {doc.kind ?? "page"}
                      </div>
                      <div className="mt-1 font-semibold">
                        {locale === "ar" ? doc.titleAr : doc.title}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-navy/55">
                        {(locale === "ar" ? doc.bodyAr : doc.body) || "Empty page"}
                      </p>
                    </Card>
                  </Link>
                </RecordChrome>
              ))
            )}
          </div>
        </PageSection>
      </div>
    </div>
  );
}
