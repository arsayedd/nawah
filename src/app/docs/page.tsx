"use client";

import Link from "next/link";
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
      <div>
        <h1 className="text-2xl font-bold">{dict.nav.docs}</h1>
        <p className="text-sm text-navy/55">
          {locale === "ar"
            ? "صفحات مربوطة بالعميل والمشروع — تتحول لـ SOP أو مهمة."
            : "Pages linked to clients and projects — turn an SOP into work."}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {roots.map((doc) => {
          const children = docs.filter((d) => d.parentId === doc.id);
          return (
            <Card key={doc.id} className="p-5">
              <Link href={`/docs/${doc.id}`} className="text-lg font-semibold">
                {locale === "ar" ? doc.titleAr : doc.title}
              </Link>
              <p className="mt-2 text-sm text-navy/60">
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
        {docs
          .filter((d) => d.clientId && !d.parentId)
          .map((doc) => (
            <Card key={doc.id} className="p-5">
              <Link href={`/docs/${doc.id}`} className="font-semibold">
                {locale === "ar" ? doc.titleAr : doc.title}
              </Link>
              <p className="mt-2 text-sm text-navy/60">
                {locale === "ar" ? doc.bodyAr : doc.body}
              </p>
            </Card>
          ))}
      </div>
    </div>
  );
}
