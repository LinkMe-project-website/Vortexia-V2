import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

interface ViewerRow {
  id: string;
  viewer_id: string;
  viewed_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function WhoViewedProfile() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [rows, setRows] = useState<ViewerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isVip =
    !!profile?.vip_status &&
    (!profile.vip_until || new Date(profile.vip_until) > new Date());

  useEffect(() => {
    if (!user || !isVip) {
      setLoading(false);
      return;
    }
    supabase
      .from("profile_view_log")
      .select("id, viewer_id, viewed_at, profiles!profile_view_log_viewer_id_fkey(full_name, avatar_url)")
      .eq("subject_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(50)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setRows(
            (data ?? []).map((row: any) => ({
              id: row.id,
              viewer_id: row.viewer_id,
              viewed_at: row.viewed_at,
              full_name: row.profiles?.full_name ?? "Unknown user",
              avatar_url: row.profiles?.avatar_url ?? null,
            }))
          );
        }
        setLoading(false);
      });
  }, [user, isVip]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/profile")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Who Viewed My Profile</h1>
      </div>

      {!isVip ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-gray-500">VIP feature lang ito. Mag-upgrade para makita kung sino ang tumingin sa profile mo.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          {error && <p className="py-3 text-sm text-red-500">{error}</p>}
          {loading ? (
            <p className="py-3 text-sm text-gray-400">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Wala pang tumitingin sa profile mo.</p>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    {r.avatar_url && <img src={r.avatar_url} className="h-full w-full object-cover" alt="" />}
                  </div>
                  <span className="text-sm">{r.full_name}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.viewed_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
