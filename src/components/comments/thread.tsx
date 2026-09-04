"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { EntityComment } from "@/lib/types";
import { useOS } from "@/store/use-os";

export function CommentThread({
  entity,
  entityId,
}: {
  entity: EntityComment["entity"];
  entityId: string;
}) {
  const locale = useOS((s) => s.locale);
  const employees = useOS((s) => s.employees);
  const comments = useOS((s) =>
    s.entityComments.filter((c) => c.entity === entity && c.entityId === entityId),
  );
  const addEntityComment = useOS((s) => s.addEntityComment);
  const [body, setBody] = useState("");

  return (
    <div className="rounded-[14px] border border-navy/8 bg-white p-4">
      <div className="text-sm font-semibold">
        {locale === "ar" ? "التعليقات" : "Comments"}
        <span className="ms-2 text-navy/40">{comments.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-navy/45">
            {locale === "ar" ? "مفيش تعليقات لسه." : "No comments yet."}
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-[10px] bg-paper px-3 py-2 text-sm">
              <div className="text-[11px] text-navy/45">
                {employees.find((e) => e.id === c.authorId)?.name} · {c.createdAt.slice(0, 16)}
              </div>
              <p className="mt-1">{c.body}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={locale === "ar" ? "اكتب تعليق…" : "Write a comment…"}
          className="min-h-[72px]"
        />
        <Button
          className="self-end"
          onClick={() => {
            if (!body.trim()) return;
            addEntityComment({ entity, entityId, body: body.trim() });
            setBody("");
          }}
        >
          {locale === "ar" ? "نشر" : "Post"}
        </Button>
      </div>
    </div>
  );
}
