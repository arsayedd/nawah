"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const doc = useOS((s) => s.docs.find((d) => d.id === id));
  const dict = t(locale);

  if (!doc) {
    return <p>{locale === "ar" ? "الصفحة مش موجودة." : "Page not found."}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/docs" className="text-sm text-cobalt">
        ← {dict.nav.docs}
      </Link>
      <Card className="p-8">
        <h1 className="text-3xl font-bold">
          {locale === "ar" ? doc.titleAr : doc.title}
        </h1>
        <p className="mt-4 whitespace-pre-wrap text-navy/75 leading-7">
          {locale === "ar" ? doc.bodyAr : doc.body}
        </p>
        {doc.id === "d_sop_shopify" ? (
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Intake checklist",
              "Access checklist",
              "Theme backup",
              "Development steps",
              "QA checklist",
              "Launch checklist",
              "Handover checklist",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-[10px] bg-paper px-3 py-2"
              >
                <span className="h-4 w-4 rounded border border-navy/20" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}
