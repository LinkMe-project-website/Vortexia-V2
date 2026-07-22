import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import ReputationBadge from "@/components/ReputationBadge";
import HighlightBadge from "@/components/HighlightBadge";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default function Dashboard() {
  const { profile, refreshProfile } = useAuthStore();
  const [streakToast, setStreakToast] = useState<string | null>(null);

  // [Points System] Claim the daily login streak bonus once per day, the
  // moment the dashboard loads — server-side claim_daily_login() is
  // idempotent per day, so it's safe to call on every mount.
  useEffect(() => {
    supabase.rpc("claim_daily_login").then(({ data, error }) => {
      if (error || !data?.[0]) return;
      const { streak, points_awarded } = data[0];
      if (points_awarded > 0) {
        setStreakToast(`🔥 Day ${streak} streak! +${points_awarded} points`);
        refreshProfile();
        setTimeout(() => setStreakToast(null), 4000);
      }
    });
  }, [refreshProfile]);

  const { data: meetingCounts } = useQuery({
    queryKey: ["meeting-counts", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const [{ count: upcoming }, { count: past }] = await Promise.all([
        supabase.from("meetings").select("id", { count: "exact", head: true })
          .gte("scheduled_at", new Date().toISOString()),
        supabase.from("meetings").select("id", { count: "exact", head: true })
          .lt("scheduled_at", new Date().toISOString()),
      ]);
      return { upcoming: upcoming ?? 0, past: past ?? 0 };
    },
  });

  if (!profile) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-4 p-4">
      {streakToast && (
        <div className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white">{streakToast}</div>
      )}

      <h1 className="text-xl font-bold">
        Good day 👋 {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </h1>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-blue text-lg font-bold text-white">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} className="h-full w-full rounded-full object-cover" alt="" />
            ) : (
              (profile.full_name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold">
              {profile.full_name}
              <ReputationBadge tier={profile.reputation_tier} />
              <HighlightBadge badgeKey={profile.highlight_badge} />
            </div>
            <div className="text-xs text-gray-500">{profile.email}</div>
          </div>
        </div>
        <div className="mt-3 flex gap-6 text-sm">
          <div><span className="font-bold">{meetingCounts?.upcoming ?? "…"}</span> upcoming</div>
          <div><span className="font-bold">{meetingCounts?.past ?? "…"}</span> past meetings</div>
          <div><span className="font-bold">{profile.points_balance ?? 0}</span> points</div>
        </div>
      </div>

      {(!profile.email_verified_at || !profile.identity_verified_at) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          ⚠️ Complete email + identity verification to unlock posting, applying, and messaging.
        </div>
      )}

      <DashboardTabs />
    </div>
  );
}
