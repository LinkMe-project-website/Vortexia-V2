import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

interface ConnRow {
  followRowId: string;
  profileId: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Connections() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<ConnRow[]>([]);
  const [following, setFollowing] = useState<ConnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      supabase
        .from("follows")
        .select("id, follower_id, profiles!follows_follower_id_fkey(full_name, avatar_url)")
        .eq("followee_id", user.id),
      supabase
        .from("follows")
        .select("id, followee_id, profiles!follows_followee_id_fkey(full_name, avatar_url)")
        .eq("follower_id", user.id),
    ]).then(([followersRes, followingRes]) => {
      if (followersRes.error) setError(followersRes.error.message);
      if (followingRes.error) setError(followingRes.error.message);

      setFollowers(
        (followersRes.data ?? []).map((row: any) => ({
          followRowId: row.id,
          profileId: row.follower_id,
          full_name: row.profiles?.full_name ?? "Unknown user",
          avatar_url: row.profiles?.avatar_url ?? null,
        }))
      );
      setFollowing(
        (followingRes.data ?? []).map((row: any) => ({
          followRowId: row.id,
          profileId: row.followee_id,
          full_name: row.profiles?.full_name ?? "Unknown user",
          avatar_url: row.profiles?.avatar_url ?? null,
        }))
      );
      setLoading(false);
    });
  }, [user]);

  async function handleUnfollow(followRowId: string) {
    setFollowing((prev) => prev.filter((f) => f.followRowId !== followRowId));
    await supabase.from("follows").delete().eq("id", followRowId);
  }

  const list = tab === "followers" ? followers : following;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/profile")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Connections</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("followers")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "followers" ? "bg-navy text-white" : "bg-gray-100 dark:bg-slate-800"}`}
        >
          Followers ({followers.length})
        </button>
        <button
          onClick={() => setTab("following")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === "following" ? "bg-navy text-white" : "bg-gray-100 dark:bg-slate-800"}`}
        >
          Following ({following.length})
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <p className="py-3 text-sm text-gray-400">Loading…</p>
        ) : list.length === 0 ? (
          <p className="py-3 text-sm text-gray-400">
            {tab === "followers" ? "Wala ka pang followers." : "Wala ka pang sinusundan."}
          </p>
        ) : (
          list.map((row) => (
            <div key={row.followRowId} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                  {row.avatar_url && <img src={row.avatar_url} className="h-full w-full object-cover" alt="" />}
                </div>
                <span className="text-sm">{row.full_name}</span>
              </div>
              {tab === "following" && (
                <button onClick={() => handleUnfollow(row.followRowId)} className="text-xs font-semibold text-red-500">
                  Unfollow
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
