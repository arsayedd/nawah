"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocsPage() {
  const locale = useOS((s) => s.locale);
  const docs = useOS((s) => s.docs);
  const dict = t(locale);
  const roots = docs.filter((d) => !d.parentId);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Knowledge"
        title={dict.nav.docs}
        description="Wiki, SOPs, and briefs linked to clients and projects. Turn a page into tasks without leaving the OS."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {roots.map((doc) => {
          const children = docs.filter((d) => d.parentId === doc.id);
          return (
            <Card key={doc.id} className="p-5">
              <Link
                key={doc.id}
                href={`/docs/${doc.id}`}
                className="text-lg font-semibold"
              >
                {locale === "ar" ? doc.titleAr : doc.title}
              </Link>
              {doc.kind ? (
                <span className="ms-2 text-[11px] uppercase tracking-wide text-navy/40">
                  {doc.kind}
                </span>
              ) : null}
              <p className="mt-2 line-clamp-3 text-sm text-navy/60">
                {locale === "ar" ? doc.bodyAr : doc.body}
              </p>
              <div className="mt-3 space-y-1">
                {children.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/docs/${ch.id}`}
                    className="block text-sm text-cobalt"
                  >
                    {locale === "ar" ? ch.titleAr : ch.title}
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
