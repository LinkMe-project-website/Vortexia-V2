import { useAuthStore } from "@/store/auth";
import ReputationBadge from "@/components/ReputationBadge";
import HighlightBadge from "@/components/HighlightBadge";

export default function Profile() {
  const { profile, signOut } = useAuthStore();
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
          <div className="flex gap-1.5">
            <ReputationBadge tier={profile.reputation_tier} />
            <HighlightBadge badgeKey={profile.highlight_badge} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-slate-700">
        Edit profile, badge picker, VIP settings, dark mode toggle, etc. go here next — see the rebuild roadmap.
      </div>

      <button onClick={signOut} className="w-full rounded-full border border-red-300 py-3 font-semibold text-red-500">
        Sign out
      </button>
    </div>
  );
}
