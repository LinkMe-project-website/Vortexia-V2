import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ChatThread } from "@/types";

export default function Chats() {
  // [Carried over from v1 fix, July 18] The v1 bug was that the chat list
  // only ever fetched once, at login, and never refreshed when the tab was
  // reopened. React Query's default refetchOnMount + refetchOnWindowFocus
  // (set globally in main.tsx) makes that entire bug class structurally
  // impossible here — there's no "forgot to call loadChatThreads() again"
  // to forget.
  const { data: threads, isLoading } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("status", "chat")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ChatThread[];
    },
  });

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!threads?.length) return <div className="p-4 text-gray-500">No conversations yet. Add friends or start a group chat to begin.</div>;

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {threads.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-blue font-bold text-white">
            {t.is_group ? "👥" : t.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{t.title}</div>
            <div className="truncate text-sm text-gray-500">Tap to open</div>
          </div>
        </div>
      ))}
    </div>
  );
}
