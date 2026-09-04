"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocsPage() {
  const locale = useOS((s) => s.locale);
  const docs = useOS((s) => s.docs);
  const addDoc = useOS((s) => s.addDoc);
  const router = useRouter();
  const dict = t(locale);
  const [title, setTitle] = useState("");
  const roots = docs.filter((d) => !d.parentId);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Notion-like"
        title={dict.nav.docs}
        description="Wiki tree, templates, and linked databases. A line can become a task without leaving the page."
      />
      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="New page title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          size="sm"
          onClick={() => {
            const id = addDoc(title.trim() || "Untitled");
            setTitle("");
            router.push(`/docs/${id}`);
          }}
        >
          New page
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/docs/${addDoc("Untitled database", "database")}`)}
        >
          New database
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="p-3">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-navy/40">
            Workspace
          </div>
          {roots.map((doc) => (
            <div key={doc.id} className="mb-2">
              <Link href={`/docs/${doc.id}`} className="block rounded-[8px] px-2 py-1.5 text-sm hover:bg-paper">
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
          ))}
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.map((doc) => (
            <Link key={doc.id} href={`/docs/${doc.id}`}>
              <Card className="h-full p-4">
                <div className="text-[11px] uppercase tracking-wide text-navy/40">
                  {doc.kind ?? "page"}
                </div>
                <div className="mt-1 font-semibold">
                  {locale === "ar" ? doc.titleAr : doc.title}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-navy/55">
                  {locale === "ar" ? doc.bodyAr : doc.body}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
