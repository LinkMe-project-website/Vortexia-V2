import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Ported from v1's notifIcon() map — includes the July 18 job_match addition.
const NOTIF_ICONS: Record<string, string> = {
  message: "💬", room_invite: "📅", follow: "➕", meeting_reminder: "⏰",
  meeting_starting: "📹", recording_ready: "🎬", group_added: "👥",
  post_liked: "❤️", post_commented: "💬", marketplace_inquiry: "🛍️",
  new_community_member: "🎉", vip_expiry_warning: "⚠️", job_match: "🎯",
};

export default function Notifications() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!notifications?.length) return <div className="p-4 text-gray-500">No notifications yet.</div>;

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {notifications.map((n) => (
        <div key={n.id} className={`flex gap-3 p-4 ${n.read ? "" : "bg-blue-50 dark:bg-slate-800/50"}`}>
          <div className="text-xl">{NOTIF_ICONS[n.type] ?? "🔔"}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{n.title}</div>
            {n.body && <div className="text-sm text-gray-500">{n.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
