"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function InboxPage() {
  const locale = useOS((s) => s.locale);
  const messages = useOS((s) => s.messages);
  const projects = useOS((s) => s.projects);
  const clients = useOS((s) => s.clients);
  const employees = useOS((s) => s.employees);
  const sendMessage = useOS((s) => s.sendMessage);
  const convertMessageToTask = useOS((s) => s.convertMessageToTask);
  const dict = t(locale);
  const channels = useMemo(
    () => [
      ...projects.map((p) => ({
        id: `project:${p.id}`,
        label: locale === "ar" ? p.nameAr : p.name,
        kind: "Project",
      })),
      ...clients.map((c) => ({
        id: `client:${c.id}`,
        label: locale === "ar" ? c.nameAr : c.name,
        kind: "Client",
      })),
    ],
    [projects, clients, locale],
  );
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(true);
  const thread = messages.filter((m) => m.channelId === channelId);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Communication"
        title={dict.nav.inbox}
        description="Project and client threads live next to the work — turn a message into a decision, not a WhatsApp screenshot."
      />
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="p-2">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelId(ch.id)}
              className={`mb-1 w-full rounded-[10px] px-3 py-2 text-start text-sm ${
                channelId === ch.id ? "bg-navy text-white" : "hover:bg-paper"
              }`}
            >
              <div className="font-medium">{ch.label}</div>
              <div className="text-[11px] opacity-60">{ch.kind}</div>
            </button>
          ))}
        </Card>
        <Card className="flex min-h-[420px] flex-col p-4">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {thread.length === 0 ? (
              <p className="text-sm text-navy/45">No messages in this channel yet.</p>
            ) : (
              thread
                .slice()
                .reverse()
                .map((m) => {
                  const who = employees.find((e) => e.id === m.authorId);
                  return (
                    <div key={m.id} className="rounded-[12px] bg-paper p-3 text-sm">
                      <div className="mb-1 flex justify-between text-[11px] text-navy/45">
                        <span>{who?.name ?? "Owner"}</span>
                        <span>{m.internal ? "Internal" : "Client-visible"}</span>
                      </div>
                      {m.body}
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => convertMessageToTask(m.id)}
                        >
                          Turn into task
                        </Button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          <div className="mt-3 space-y-2 border-t border-navy/8 pt-3">
            <label className="flex items-center gap-2 text-xs text-navy/55">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
              />
              Internal only — hidden from the client portal
            </label>
            <div className="flex gap-2">
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write in this channel…"
              />
              <Button
                onClick={() => {
                  if (!body.trim() || !channelId) return;
                  sendMessage(channelId, body.trim(), internal);
                  setBody("");
                }}
              >
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
