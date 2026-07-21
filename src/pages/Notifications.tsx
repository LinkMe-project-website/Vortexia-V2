import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

// Ported from v1's notifIcon() map — includes the July 18 job_match addition.
const NOTIF_ICONS: Record<string, string> = {
  message: "💬", room_invite: "📅", follow: "➕", meeting_reminder: "⏰",
  meeting_starting: "📹", recording_ready: "🎬", group_added: "👥",
  post_liked: "❤️", post_commented: "💬", marketplace_inquiry: "🛍️",
  new_community_member: "🎉", vip_expiry_warning: "⚠️", job_match: "🎯", invite_verified: "🎟️",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  related_room_id: string | null;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Notification[];
    },
  });

  // [Bug fix, carried over from v1] Tapping a notification must open the
  // ACTUAL correct chat thread directly — not just the Chats list, and not
  // an unrelated/most-recent thread. Uses the same related_room_id column
  // v1 relied on, but the route itself (/chats/:id) guarantees the right
  // thread opens since it's a real URL param, not client-side "figure out
  // which room was tapped" state.
  async function handleOpen(n: Notification) {
    if (!n.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    if (n.related_room_id) {
      navigate(`/chats/${n.related_room_id}`);
    } else if (n.type === "job_match") {
      navigate("/community?filter=job");
    }
  }

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!notifications?.length) return <div className="p-4 text-gray-500">No notifications yet.</div>;

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {notifications.map((n) => (
        <button
          key={n.id}
          onClick={() => handleOpen(n)}
          className={`flex w-full gap-3 p-4 text-left ${n.read ? "" : "bg-blue-50 dark:bg-slate-800/50"}`}
        >
          <div className="text-xl">{NOTIF_ICONS[n.type] ?? "🔔"}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{n.title}</div>
            {n.body && <div className="text-sm text-gray-500">{n.body}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}
