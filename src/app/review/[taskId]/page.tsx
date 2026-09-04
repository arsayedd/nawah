"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOS } from "@/store/use-os";
import { useState } from "react";

export default function ReviewPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const task = useOS((s) => s.tasks.find((t) => t.id === taskId));
  const pins = useOS((s) => s.reviewPins.filter((p) => p.taskId === taskId));
  const addReviewPin = useOS((s) => s.addReviewPin);
  const approveDeliverable = useOS((s) => s.approveDeliverable);
  const requestRevision = useOS((s) => s.requestRevision);
  const [note, setNote] = useState("");

  if (!task) return <p>Deliverable not found.</p>;

  return (
    <div className="space-y-4">
      <Link href="/files" className="text-sm text-cobalt">
        ← Files
      </Link>
      <h1 className="text-2xl font-semibold">{task.title}</h1>
      <p className="text-sm text-navy/55">
        Working → Internal review → Client review → Approved / Revision. Round {task.revisionCount}.
      </p>
      <Card
        className="relative h-[320px] cursor-crosshair overflow-hidden bg-gradient-to-br from-navy to-[#12305f] p-0"
        onClick={(e) => {
          if (!note.trim()) return;
          const rect = e.currentTarget.getBoundingClientRect();
          addReviewPin(
            task.id,
            ((e.clientX - rect.left) / rect.width) * 100,
            ((e.clientY - rect.top) / rect.height) * 100,
            note.trim(),
          );
          setNote("");
        }}
      >
        {pins.map((p) => (
          <div
            key={p.id}
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral text-center text-[11px] font-bold leading-6 text-white"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={p.body}
          >
            +
          </div>
        ))}
        <div className="absolute bottom-3 left-3 text-xs text-white/70">
          Click the canvas to drop a comment (type it first).
        </div>
      </Card>
      <div className="flex gap-2">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Comment on a point in the design…"
        />
        <Button variant="mint" onClick={() => approveDeliverable(task.id)}>
          Approve
        </Button>
        <Button variant="outline" onClick={() => requestRevision(task.id)}>
          Request changes
        </Button>
      </div>
      <div className="space-y-2">
        {pins.map((p) => (
          <Card key={p.id} className="p-3 text-sm">
            {p.body}
          </Card>
        ))}
      </div>
    </div>
  );
}
