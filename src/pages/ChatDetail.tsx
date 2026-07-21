import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  body: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface SenderProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ChatDetail() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: room } = useQuery({
    queryKey: ["chat-room", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await supabase.from("meetings").select("*").eq("id", roomId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["chat-messages", roomId],
    enabled: !!roomId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  // [Cleaner than v1] v1 resolved sender names via a single global mutable
  // `allProfilesCache` Map that had to be manually populated everywhere a
  // message might render — and the bug that caused "Unknown" names for a
  // while was exactly that it was declared but never populated. Here we
  // just fetch the distinct senders for THIS thread as a normal query,
  // scoped to this component — there's no shared mutable state to forget
  // to populate.
  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
  const { data: senderProfiles } = useQuery({
    queryKey: ["chat-senders", roomId, senderIds.join(",")],
    enabled: senderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", senderIds);
      if (error) throw error;
      return data as SenderProfile[];
    },
  });
  const senderMap = new Map((senderProfiles ?? []).map((p) => [p.id, p]));

  // Real-time: new messages in this room stream in immediately.
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "meeting_messages", filter: `room_id=eq.${roomId}` },
        () => queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const sendMessage = useMutation({
    mutationFn: async (body: string) => {
      if (!user || !roomId) throw new Error("Not ready");
      const { error } = await supabase.from("meeting_messages").insert({ room_id: roomId, sender_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] });
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 p-3 dark:border-slate-800">
        <button onClick={() => navigate("/chats")}><ArrowLeft size={20} /></button>
        <div className="font-semibold">{room?.title ?? "Chat"}</div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {isLoading && <div className="text-center text-gray-400">Loading…</div>}
        {messages?.map((m) => {
          const isOwn = m.sender_id === user?.id;
          const sender = senderMap.get(m.sender_id);
          return (
            <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                {!isOwn && <div className="mb-0.5 text-xs text-gray-500">{sender?.full_name ?? "…"}</div>}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    isOwn ? "bg-navy text-white" : "bg-gray-100 dark:bg-slate-800"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-3 dark:border-slate-800">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 dark:bg-slate-800 dark:border-slate-700"
        />
        <button type="submit" disabled={sendMessage.isPending} className="rounded-full bg-navy p-2.5 text-white disabled:opacity-50">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
