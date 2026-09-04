"use client";

import { useEffect, useMemo, useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useOS } from "@/store/use-os";

function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace("T", " ");
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MailPage() {
  const locale = useOS((s) => s.locale);
  const mail = useOS((s) => s.mail);
  const employees = useOS((s) => s.employees);
  const me = useOS((s) => s.prefs.currentUserId);
  const sendMail = useOS((s) => s.sendMail);
  const markMailRead = useOS((s) => s.markMailRead);
  const dict = t(locale);

  const others = employees.filter((e) => e.id !== me && e.status !== "inactive");
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [composing, setComposing] = useState(false);
  const [toId, setToId] = useState(others[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const ids = employees.filter((e) => e.id !== me && e.status !== "inactive").map((e) => e.id);
    if (toId && ids.includes(toId)) return;
    setToId(ids[0] ?? "");
  }, [employees, me, toId]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return mail
      .filter((m) => (folder === "inbox" ? m.toId === me : m.fromId === me))
      .filter((m) => {
        if (!needle) return true;
        const from = employees.find((e) => e.id === m.fromId)?.name ?? "";
        const to = employees.find((e) => e.id === m.toId)?.name ?? "";
        return `${m.subject} ${m.body} ${from} ${to}`.toLowerCase().includes(needle);
      })
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [mail, folder, me, query, employees]);

  const unread = mail.filter((m) => m.toId === me && !m.read).length;
  const open = mail.find((m) => m.id === openId) ?? null;

  useEffect(() => {
    if (composing) return;
    if (openId && rows.some((m) => m.id === openId)) return;
    setOpenId(rows[0]?.id ?? null);
  }, [rows, openId, composing]);

  function who(id: string) {
    return employees.find((e) => e.id === id);
  }

  function composeNew() {
    setComposing(true);
    setOpenId(null);
    setSubject("");
    setBody("");
    setToId(others[0]?.id ?? "");
  }

  function reply() {
    if (!open) return;
    const counterpart = open.fromId === me ? open.toId : open.fromId;
    setComposing(true);
    setToId(counterpart);
    setSubject(open.subject.startsWith("Re:") ? open.subject : `Re: ${open.subject}`);
    setBody(`\n\n---\nOn ${when(open.createdAt)}, ${who(open.fromId)?.name ?? "them"} wrote:\n${open.body}`);
  }

  function send() {
    if (!toId || !subject.trim()) return;
    const id = sendMail({ toId, subject: subject.trim(), body: body.trim() });
    setSubject("");
    setBody("");
    setComposing(false);
    setFolder("sent");
    setOpenId(id);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Internal"
        title={dict.nav.mail}
        description="Internal mail in NAWAH. Recipients also get a notice."
        actions={
          <Button size="sm" onClick={composeNew}>
            Compose
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <PageSection page="/mail" id="inbox" label="Inbox / sent">
          <Card className="flex min-h-[520px] flex-col p-3">
            <div className="mb-3 flex gap-1">
              <Button
                size="sm"
                variant={folder === "inbox" ? "default" : "outline"}
                onClick={() => {
                  setFolder("inbox");
                  setComposing(false);
                }}
              >
                Inbox{unread ? ` (${unread})` : ""}
              </Button>
              <Button
                size="sm"
                variant={folder === "sent" ? "default" : "outline"}
                onClick={() => {
                  setFolder("sent");
                  setComposing(false);
                }}
              >
                Sent
              </Button>
            </div>
            <Input
              className="mb-3"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={locale === "ar" ? "بحث" : "Search mail"}
            />
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {rows.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-navy/45">
                  {folder === "inbox" ? "Inbox is empty." : "Nothing sent yet."}
                </p>
              ) : (
                rows.map((m) => {
                  const counterpart = who(folder === "inbox" ? m.fromId : m.toId);
                  const unreadRow = folder === "inbox" && !m.read;
                  return (
                    <RecordChrome key={m.id} collection="mail" id={m.id}>
                      <button
                        type="button"
                        className={cn(
                          "block w-full rounded-[12px] px-3 py-2.5 text-start",
                          openId === m.id && !composing ? "bg-navy text-white" : unreadRow ? "bg-cobalt/8" : "hover:bg-paper",
                        )}
                        onClick={() => {
                          setComposing(false);
                          setOpenId(m.id);
                          if (m.toId === me) markMailRead(m.id);
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("truncate text-sm", unreadRow ? "font-semibold" : "font-medium")}>
                            {m.subject}
                          </span>
                          {unreadRow ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-coral" />
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "mt-0.5 truncate text-[12px]",
                            openId === m.id && !composing ? "text-white/60" : "text-navy/45",
                          )}
                        >
                          {folder === "inbox" ? "From" : "To"} {counterpart?.name ?? "—"}
                        </div>
                      </button>
                    </RecordChrome>
                  );
                })
              )}
            </div>
          </Card>
        </PageSection>

        <PageSection page="/mail" id="compose" label="Compose">
          <Card className="flex min-h-[520px] flex-col overflow-hidden p-0">
            {composing ? (
              <div className="flex flex-1 flex-col p-4">
                <h2 className="mb-3 font-semibold">New message</h2>
                <label className="mb-1 text-[11px] font-medium text-navy/45">To</label>
                <select
                  className="mb-3 h-10 w-full rounded-[10px] border border-navy/10 px-3 text-sm"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                >
                  {others.length === 0 ? <option value="">No teammates</option> : null}
                  {others.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} · {e.email}
                    </option>
                  ))}
                </select>
                <Input
                  className="mb-3"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea
                  className="min-h-[200px] flex-1"
                  placeholder="Write the mail…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div className="mt-3 flex gap-2">
                  <Button onClick={send} disabled={!toId || !subject.trim()}>
                    Send
                  </Button>
                  <Button variant="outline" onClick={() => setComposing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : !open ? (
              <div className="grid flex-1 place-items-center p-8 text-sm text-navy/45">
                Pick a message or compose a new one.
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="border-b border-navy/8 px-5 py-4">
                  <h2 className="text-lg font-semibold">{open.subject}</h2>
                  <p className="mt-1 text-sm text-navy/55">
                    From {who(open.fromId)?.name} · To {who(open.toId)?.name} · {when(open.createdAt)}
                  </p>
                  <Button className="mt-3" size="sm" variant="outline" onClick={reply}>
                    Reply
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 text-sm leading-6 whitespace-pre-wrap">
                  {open.body}
                </div>
              </div>
            )}
          </Card>
        </PageSection>
      </div>
    </div>
  );
}
