"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function DocPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const doc = useOS((s) => s.docs.find((d) => d.id === id));
  const projects = useOS((s) => s.projects);
  const saveDoc = useOS((s) => s.saveDoc);
  const convertDocToTasks = useOS((s) => s.convertDocToTasks);
  const applySopToProject = useOS((s) => s.applySopToProject);
  const router = useRouter();
  const dict = t(locale);

  if (!doc) {
    return <p>Page not found.</p>;
  }

  const body = locale === "ar" ? doc.bodyAr : doc.body;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/docs" className="text-sm text-cobalt">
        ← {dict.nav.docs}
      </Link>
      <Card className="p-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {locale === "ar" ? doc.titleAr : doc.title}
        </h1>
        <Textarea
          className="mt-4 min-h-[220px]"
          value={body}
          onChange={(e) => saveDoc(doc.id, e.target.value)}
        />
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
    </div>
  );
}
