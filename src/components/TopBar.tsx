import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/community": "Community",
  "/chats": "Chats",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/invites": "Invite Codes",
  "/security": "Security",
  "/tasks": "Tasks & Rewards",
  "/team-application": "Join the Team",
  "/support": "Help & Support",
};

export default function TopBar({ path }: { path: string }) {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const isVip = profile?.vip_status === "trialing" || profile?.vip_status === "active";
  const title = PAGE_TITLES[path] ?? "VORTEXIA";

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        {isVip && <Crown size={20} className="text-amber-500" aria-label="VIP member" />}
        <button
          onClick={() => navigate("/profile")}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan to-blue text-sm font-bold text-white"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="h-full w-full object-cover" alt="Profile" />
          ) : (
            (profile?.full_name ?? "?").charAt(0).toUpperCase()
          )}
        </button>
      </div>
    </header>
  );
}
