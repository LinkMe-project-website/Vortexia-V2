import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import WorkspaceFeed from "./WorkspaceFeed";

interface CommunityRow {
  id: string;
  name: string;
  category: string | null;
}

interface RecentProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function CommunityContent() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: communities, isLoading: loadingCommunities } = useQuery({
    queryKey: ["communities-list"],
    queryFn: async () => {
      const { data } = await supabase.from("communities").select("id, name, category").order("name");
      return (data ?? []) as CommunityRow[];
    },
  });

  // NOTE: walang na-verify na presence/"online status" column sa profiles —
  // ito ay proxy lang gamit ang pinaka-huling na-update profiles bilang
  // "Recently active". I-verify sa Supabase kung may proper na last_seen_at
  // para gawing totoong "online now".
  const { data: recentProfiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["recently-active-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .order("updated_at", { ascending: false })
        .limit(12);
      return (data ?? []) as RecentProfile[];
    },
  });

  const categories = Array.from(new Set((communities ?? []).map((c) => c.category).filter(Boolean))) as string[];
  const filteredCommunities = activeCategory
    ? (communities ?? []).filter((c) => c.category === activeCategory)
    : communities ?? [];

  return (
    <div className="space-y-5">
      {categories.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${
              activeCategory === null ? "bg-navy text-white" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"
            }`}
          >
            LAHAT
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${
                activeCategory === cat ? "bg-navy text-white" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-gray-500">🟢 Kasalukuyang Aktibo</h3>
        {loadingProfiles ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : !recentProfiles?.length ? (
          <p className="text-sm text-gray-400">Wala pang datos.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentProfiles.map((p) => (
              <div key={p.id} className="flex shrink-0 flex-col items-center gap-1" style={{ width: 64 }}>
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                      {(p.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-950" />
                </div>
                <p className="w-full truncate text-center text-[10px] text-gray-500">{p.full_name ?? "Miyembro"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-gray-500">💬 Group Chats</h3>
        {loadingCommunities ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : !filteredCommunities.length ? (
          <p className="text-sm text-gray-400">Wala pang community.</p>
        ) : (
          <div className="space-y-2">
            {filteredCommunities.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-gray-200 p-3 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  {c.category && <p className="text-xs text-gray-400">{c.category}</p>}
                </div>
                {/* TODO: i-wire kapag na-verify na ang get_or_create_community_room RPC params */}
                <button className="rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white opacity-60">
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400 dark:border-slate-700">
        🎤 Party Rooms — Coming Soon
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-gray-500">🎬 Workspace</h3>
        <WorkspaceFeed />
      </div>
    </div>
  );
}
