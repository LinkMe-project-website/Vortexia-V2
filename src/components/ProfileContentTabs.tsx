import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PostRow {
  id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
}

interface VideoRow {
  id: string;
  title: string;
  thumbnail_url: string | null;
  view_count: number | null;
  likes_count: number | null;
}

export default function ProfileContentTabs({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"posts" | "photos" | "videos">("posts");
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [photos, setPhotos] = useState<PostRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      supabase
        .from("profile_posts")
        .select("id, body, image_url, created_at")
        .eq("user_id", userId)
        .eq("post_type", "text")
        .order("created_at", { ascending: false }),
      supabase
        .from("profile_posts")
        .select("id, body, image_url, created_at")
        .eq("user_id", userId)
        .eq("post_type", "photo")
        .order("created_at", { ascending: false }),
      supabase
        .from("videos")
        .select("id, title, thumbnail_url, view_count, likes_count")
        .eq("uploaded_by", userId)
        .order("created_at", { ascending: false }),
    ]).then(([postsRes, photosRes, videosRes]) => {
      setPosts(postsRes.data ?? []);
      setPhotos(photosRes.data ?? []);
      setVideos(videosRes.data ?? []);
      setLoading(false);
    });
  }, [userId]);

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "photos", label: "Photos", count: photos.length },
    { key: "videos", label: "Videos", count: videos.length },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 border-b border-gray-100 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-semibold ${
              tab === t.key ? "border-b-2 border-navy text-navy dark:text-cyan" : "text-gray-400"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-gray-400">Loading…</p>
      ) : tab === "posts" ? (
        posts.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Wala ka pang posts.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                {p.body}
              </div>
            ))}
          </div>
        )
      ) : tab === "photos" ? (
        photos.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Wala ka pang photos.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((p) => (
              <div key={p.id} className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
                {p.image_url && <img src={p.image_url} className="h-full w-full object-cover" alt="" />}
              </div>
            ))}
          </div>
        )
      ) : videos.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Wala ka pang videos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {videos.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="aspect-video bg-gray-100 dark:bg-slate-800">
                {v.thumbnail_url && <img src={v.thumbnail_url} className="h-full w-full object-cover" alt="" />}
              </div>
              <p className="truncate p-2 text-xs font-medium">{v.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
