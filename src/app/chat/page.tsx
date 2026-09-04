"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function ChatPage() {
  const locale = useOS((s) => s.locale);
  const rooms = useOS((s) => s.chatRooms);
  const messages = useOS((s) => s.messages);
  const employees = useOS((s) => s.employees);
  const me = useOS((s) => s.prefs.currentUserId);
  const sendMessage = useOS((s) => s.sendMessage);
  const addChatRoom = useOS((s) => s.addChatRoom);
  const dict = t(locale);
  const mine = rooms.filter((r) => r.memberIds.includes(me));
  const [roomId, setRoomId] = useState(mine[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [newName, setNewName] = useState("");
  const channel = `chat:${roomId}`;
  const thread = useMemo(
    () => messages.filter((m) => m.channelId === channel),
    [messages, channel],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Internal"
        title={dict.nav.chat}
        description="Team chat lives in the OS — not a side Slack. Client threads stay in Inbox."
      />
      <div className="flex gap-2">
        <Input
          className="max-w-xs"
          placeholder="New room name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!newName.trim()) return;
            const id = addChatRoom(newName.trim(), employees.map((e) => e.id));
            setRoomId(id);
            setNewName("");
          }}
        >
          Create room
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card className="p-2">
          {mine.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoomId(r.id)}
              className={`mb-1 w-full rounded-[10px] px-3 py-2 text-start text-sm ${
                roomId === r.id ? "bg-navy text-white" : "hover:bg-paper"
              }`}
            >
              {r.name}
              <div className="text-[11px] opacity-60">{r.kind} · {r.memberIds.length}</div>
            </button>
          ))}
        </Card>
        <Card className="flex min-h-[420px] flex-col p-4">
          <div className="flex-1 space-y-2 overflow-y-auto">
            {thread.length === 0 ? (
              <p className="text-sm text-navy/45">No messages in this room yet.</p>
            ) : (
              thread.map((m) => (
                <div key={m.id} className="rounded-[10px] bg-paper px-3 py-2 text-sm">
                  <div className="text-[11px] text-navy/45">
                    {employees.find((e) => e.id === m.authorId)?.name}
                  </div>
                  {m.body}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message the room…"
              className="min-h-[56px]"
            />
            <Button
              className="self-end"
              onClick={() => {
                if (!body.trim() || !roomId) return;
                sendMessage(channel, body.trim(), true);
                setBody("");
              }}
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
