"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function MailPage() {
  const locale = useOS((s) => s.locale);
  const mail = useOS((s) => s.mail);
  const employees = useOS((s) => s.employees);
  const me = useOS((s) => s.prefs.currentUserId);
  const sendMail = useOS((s) => s.sendMail);
  const markMailRead = useOS((s) => s.markMailRead);
  const dict = t(locale);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [toId, setToId] = useState(employees.find((e) => e.id !== me)?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () => mail.filter((m) => (folder === "inbox" ? m.toId === me : m.fromId === me)),
    [mail, folder, me],
  );
  const open = mail.find((m) => m.id === openId);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Internal"
        title={dict.nav.mail}
        description="Send mail inside NAWAH. Recipients get an in-app notification too."
      />
      <div className="flex gap-2">
        <Button size="sm" variant={folder === "inbox" ? "default" : "outline"} onClick={() => setFolder("inbox")}>
          Inbox
        </Button>
        <Button size="sm" variant={folder === "sent" ? "default" : "outline"} onClick={() => setFolder("sent")}>
          Sent
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Compose</h2>
          <select
            className="mb-2 h-10 w-full rounded-[10px] border border-navy/10 px-3 text-sm"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
          >
            {employees.filter((e) => e.id !== me).map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <Input className="mb-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea placeholder="Message" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button
            className="mt-3"
            onClick={() => {
              if (!toId || !subject.trim()) return;
              sendMail({ toId, subject: subject.trim(), body: body.trim() });
              setSubject("");
              setBody("");
            }}
          >
            Send mail
          </Button>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">{folder === "inbox" ? "Inbox" : "Sent"}</h2>
          <div className="space-y-1">
            {rows.length === 0 ? <p className="text-sm text-navy/45">Empty.</p> : null}
            {rows.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`block w-full rounded-[10px] px-3 py-2 text-start text-sm ${
                  m.read ? "hover:bg-paper" : "bg-cobalt/8 font-medium"
                }`}
                onClick={() => {
                  setOpenId(m.id);
                  markMailRead(m.id);
                }}
              >
                <div>{m.subject}</div>
                <div className="text-[11px] text-navy/45">
                  {employees.find((e) => e.id === (folder === "inbox" ? m.fromId : m.toId))?.name}
                </div>
              </button>
            ))}
          </div>
          {open ? (
            <div className="mt-4 rounded-[12px] border border-navy/8 p-3 text-sm">
              <div className="font-semibold">{open.subject}</div>
              <p className="mt-2 whitespace-pre-wrap">{open.body}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
