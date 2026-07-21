import { useNavigate } from "react-router-dom";
import { ChevronRight, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import ReputationBadge from "@/components/ReputationBadge";
import HighlightBadge from "@/components/HighlightBadge";

function Row({ label, onClick, right }: { label: string; onClick?: () => void; right?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left last:border-0 dark:border-slate-800"
    >
      <span>{label}</span>
      {right ?? <ChevronRight size={18} className="text-gray-300" />}
    </button>
  );
}

export default function Profile() {
  const { profile, signOut } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  if (!profile) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-blue text-xl font-bold text-white">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
          ) : (
            (profile.full_name || "?").charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <div className="font-bold">{profile.full_name}</div>
          <div className="flex flex-wrap gap-1.5">
            <ReputationBadge tier={profile.reputation_tier} />
            <HighlightBadge badgeKey={profile.highlight_badge} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Points balance</span>
          <span className="text-lg font-bold text-navy dark:text-cyan">{profile.points_balance ?? 0} pts</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-gray-500">Login streak</span>
          <span className="text-sm font-semibold">🔥 {profile.login_streak_count ?? 0} days</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <Row label="🎟️ Invite Codes" onClick={() => navigate("/invites")} />
        <Row label="🔒 Security & Verification" onClick={() => navigate("/security")} />
        <Row label="🎯 Tasks & Rewards" onClick={() => navigate("/tasks")} />
        <Row label="🤝 Apply to Join the Team" onClick={() => navigate("/team-application")} />
        <Row label="🆘 Help & Support" onClick={() => navigate("/support")} />
        <Row
          label={theme === "dark" ? "🌙 Dark mode" : "☀️ Light mode"}
          right={
            <button
              onClick={toggleTheme}
              className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${theme === "dark" ? "bg-navy justify-end" : "bg-gray-300 justify-start"}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
              </span>
            </button>
          }
        />
      </div>

      <button onClick={signOut} className="w-full rounded-full border border-red-300 py-3 font-semibold text-red-500">
        Sign out
      </button>
    </div>
  );
}
