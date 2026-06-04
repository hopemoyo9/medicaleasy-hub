import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";

type Profile = { id: string; full_name: string; email: string };
type Msg = { id: string; sender_id: string; recipient_id: string; body: string; created_at: string; read: boolean };

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Profile[]>([]);
  const [active, setActive] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load contacts in same institute
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: me } = await supabase.from("profiles").select("institute_id").eq("id", user.id).maybeSingle();
      const q = supabase.from("profiles").select("id, full_name, email").neq("id", user.id);
      const { data } = me?.institute_id ? await q.eq("institute_id", me.institute_id) : await q;
      setContacts((data as Profile[]) || []);
    })();
  }, [user]);

  // Load conversation
  useEffect(() => {
    if (!user || !active) return;
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${active.id}),and(sender_id.eq.${active.id},recipient_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: true });
      if (alive && data) setMessages(data as Msg[]);
      // mark incoming as read
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("sender_id", active.id)
        .eq("recipient_id", user.id)
        .eq("read", false);
    })();

    const ch = supabase
      .channel(`chat:${user.id}:${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const m = payload.new as Msg;
          if (
            (m.sender_id === user.id && m.recipient_id === active.id) ||
            (m.sender_id === active.id && m.recipient_id === user.id)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [user, active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    if (!user || !active || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { data: me } = await supabase.from("profiles").select("institute_id").eq("id", user.id).maybeSingle();
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      recipient_id: active.id,
      body,
      institute_id: me?.institute_id ?? null,
    });
  };

  const filtered = useMemo(() => contacts, [contacts]);

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      <Card className="col-span-4 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" /> Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`w-full text-left p-2 rounded-md hover:bg-muted ${active?.id === c.id ? "bg-muted" : ""}`}
            >
              <p className="text-sm font-medium">{c.full_name}</p>
              <p className="text-xs text-muted-foreground">{c.email}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground p-3">No contacts.</p>}
        </CardContent>
      </Card>

      <Card className="col-span-8 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-base">{active ? active.full_name : "Select a contact"}</CardTitle>
        </CardHeader>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                    {format(new Date(m.created_at), "p")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {active && (
          <div className="p-3 border-t flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
            />
            <Button onClick={send} disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Chat;