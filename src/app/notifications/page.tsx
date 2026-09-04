"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function NotificationsPage() {
  const locale = useOS((s) => s.locale);
  const notices = useOS((s) => s.notices);
  const employees = useOS((s) => s.employees);
  const me = useOS((s) => s.prefs.currentUserId);
  const sendNotice = useOS((s) => s.sendNotice);
  const markNoticeRead = useOS((s) => s.markNoticeRead);
  const markAllNoticesRead = useOS((s) => s.markAllNoticesRead);
  const dict = t(locale);
  const mine = notices.filter((n) => n.userId === me);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<"inapp" | "email" | "both">("inapp");
  const [to, setTo] = useState<string[]>(employees.map((e) => e.id));

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Internal"
        title={dict.nav.notifications}
        description="Push an in-app notice, an internal email, or both — without leaving NAWAH."
        actions={
          <Button size="sm" variant="outline" onClick={() => markAllNoticesRead(me)}>
            Mark all read
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Send</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {employees.map((e) => {
              const on = to.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setTo(on ? to.filter((id) => id !== e.id) : [...to, e.id])}
                  className={`rounded-full px-3 py-1 text-xs ${on ? "bg-navy text-white" : "bg-paper text-navy/70"}`}
                >
                  {e.name}
                </button>
              );
            })}
          </div>
          <Input className="mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="mt-2 flex gap-2">
            {(["inapp", "email", "both"] as const).map((c) => (
              <Button key={c} size="sm" variant={channel === c ? "default" : "outline"} onClick={() => setChannel(c)}>
                {c === "inapp" ? "In-app" : c === "email" ? "Email" : "Both"}
              </Button>
            ))}
          </div>
          <Button
            className="mt-3"
            onClick={() => {
              if (!title.trim() || to.length === 0) return;
              sendNotice({ userIds: to, title: title.trim(), body: body.trim(), channel, href: "/notifications" });
              setTitle("");
              setBody("");
            }}
          >
            Send
          </Button>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Your inbox</h2>
          <div className="space-y-2">
            {mine.length === 0 ? <p className="text-sm text-navy/45">No notifications.</p> : null}
            {mine.map((n) => (
              <Link
                key={n.id}
                href={n.href ?? "/notifications"}
                onClick={() => markNoticeRead(n.id)}
                className={`block rounded-[12px] border px-3 py-2 text-sm ${
                  n.read ? "border-navy/8" : "border-cobalt/30 bg-cobalt/5"
                }`}
              >
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-navy/50">
                  {employees.find((e) => e.id === n.fromId)?.name} · {n.channel}
                </div>
                <p className="mt-1 text-navy/70">{n.body}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
