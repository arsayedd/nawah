"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useOS } from "@/store/use-os";

function stamp(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const locale = useOS((s) => s.locale);
  const rooms = useOS((s) => s.chatRooms);
  const messages = useOS((s) => s.messages);
  const employees = useOS((s) => s.employees);
  const me = useOS((s) => s.prefs.currentUserId);
  const sendMessage = useOS((s) => s.sendMessage);
  const addChatRoom = useOS((s) => s.addChatRoom);
  const startDirectMessage = useOS((s) => s.startDirectMessage);
  const joinChatRoom = useOS((s) => s.joinChatRoom);
  const removeChatRoom = useOS((s) => s.removeChatRoom);
  const editLayout = useOS((s) => s.prefs.editLayout);
  const dict = t(locale);

  const [roomId, setRoomId] = useState("");
  const [body, setBody] = useState("");
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rooms.length) {
      if (roomId) setRoomId("");
      return;
    }
    if (!rooms.some((r) => r.id === roomId)) {
      const mine = rooms.find((r) => r.memberIds.includes(me));
      setRoomId((mine ?? rooms[0]).id);
    }
  }, [rooms, roomId, me]);

  const room = rooms.find((r) => r.id === roomId);
  const inRoom = Boolean(room?.memberIds.includes(me));
  const channel = roomId ? `chat:${roomId}` : "";

  const thread = useMemo(
    () =>
      messages
        .filter((m) => m.channelId === channel)
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages, channel],
  );

  const listed = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = rooms.map((r) => {
      const last = messages
        .filter((m) => m.channelId === `chat:${r.id}`)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      return { r, last };
    });
    rows.sort((a, b) => (b.last?.createdAt ?? "").localeCompare(a.last?.createdAt ?? ""));
    if (!needle) return rows;
    return rows.filter((row) => row.r.name.toLowerCase().includes(needle));
  }, [rooms, messages, query]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [thread.length, roomId]);

  const others = employees.filter((e) => e.id !== me && e.status !== "inactive");

  function send() {
    const text = body.trim();
    if (!text || !roomId) return;
    if (!inRoom) joinChatRoom(roomId);
    sendMessage(`chat:${roomId}`, text, true);
    setBody("");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Internal"
        title={dict.nav.chat}
        description="Team rooms and DMs in the OS. Client threads stay in Inbox."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <PageSection page="/chat" id="rooms" label="Rooms">
        <Card className="flex min-h-[520px] flex-col p-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث في الرومات" : "Search rooms"}
            className="mb-3"
          />
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
            {listed.length === 0 ? (
              <p className="px-2 py-6 text-sm text-navy/45">No rooms yet. Create one below.</p>
            ) : (
              listed.map(({ r, last }) => {
                const active = roomId === r.id;
                return (
                  <div key={r.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setRoomId(r.id)}
                      className={cn(
                        "w-full rounded-[12px] px-3 py-2.5 text-start",
                        active ? "bg-navy text-white" : "hover:bg-paper",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{r.name}</span>
                        <span className={cn("text-[10px] uppercase", active ? "text-white/50" : "text-navy/40")}>
                          {r.kind}
                        </span>
                      </div>
                      <p className={cn("mt-0.5 truncate text-[12px]", active ? "text-white/60" : "text-navy/45")}>
                        {last?.body ?? (locale === "ar" ? "مفيش رسائل" : "No messages yet")}
                      </p>
                    </button>
                    {editLayout ? (
                      <button
                        type="button"
                        className="absolute top-1 end-1 text-[10px] font-semibold text-coral"
                        onClick={() => removeChatRoom(r.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 space-y-2 border-t border-navy/8 pt-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim()) return;
                const id = addChatRoom(
                  newName.trim(),
                  employees.map((e) => e.id),
                );
                setRoomId(id);
                setNewName("");
              }}
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={locale === "ar" ? "روم جديد" : "New group name"}
              />
              <Button type="submit" size="sm">
                Create
              </Button>
            </form>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-navy/40">
                Direct message
              </p>
              <div className="flex flex-wrap gap-1">
                {others.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      const id = startDirectMessage(e.id);
                      if (id) setRoomId(id);
                    }}
                    className="rounded-full border border-navy/10 px-2 py-0.5 text-[11px] text-navy/70 hover:border-cobalt hover:text-cobalt"
                  >
                    {e.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
        </PageSection>

        <PageSection page="/chat" id="thread" label="Messages">
        <Card className="flex min-h-[520px] flex-col overflow-hidden p-0">
          {!room ? (
            <div className="grid flex-1 place-items-center p-8 text-sm text-navy/45">
              Create a room or start a DM to begin.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-navy/8 px-4 py-3">
                <div>
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-[11px] text-navy/45">
                    {room.memberIds
                      .map((id) => employees.find((e) => e.id === id)?.name.split(" ")[0])
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {!inRoom ? (
                  <Button size="sm" variant="outline" onClick={() => joinChatRoom(room.id)}>
                    Join
                  </Button>
                ) : null}
              </div>
              <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {thread.length === 0 ? (
                  <p className="text-sm text-navy/45">No messages yet. Say something.</p>
                ) : (
                  thread.map((m) => {
                    const mineMsg = m.authorId === me;
                    const who = employees.find((e) => e.id === m.authorId);
                    return (
                      <div key={m.id} className={cn("flex", mineMsg ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-[14px] px-3 py-2 text-sm",
                            mineMsg ? "bg-navy text-white" : "bg-paper text-navy",
                          )}
                        >
                          <div className={cn("mb-0.5 text-[10px]", mineMsg ? "text-white/55" : "text-navy/45")}>
                            {who?.name ?? "Someone"} · {stamp(m.createdAt)}
                          </div>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="border-t border-navy/8 p-3">
                <div className="flex gap-2">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={
                      locale === "ar" ? "اكتب رسالة — Enter للإرسال" : "Message — Enter to send"
                    }
                    className="min-h-[56px]"
                  />
                  <Button className="self-end" onClick={send} disabled={!body.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
        </PageSection>
      </div>
    </div>
  );
}
