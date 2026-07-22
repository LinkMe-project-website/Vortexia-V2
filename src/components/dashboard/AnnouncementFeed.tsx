import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface FeedPost {
  id: string;
  title: string;
  body: string | null;
  author_name: string | null;
  author_role: string | null;
  pinned: boolean | null;
  image_url: string | null;
  created_at: string;
}

export default function AnnouncementFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_posts")
        .select("id, title, body, author_name, author_role, pinned, image_url, created_at")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as FeedPost[];
    },
  });

  if (isLoading) return <p className="py-6 text-center text-sm text-gray-500">Loading…</p>;
  if (!data?.length) return <p className="py-6 text-center text-sm text-gray-500">Wala pang anunsyo.</p>;

  return (
    <div className="space-y-3">
      {data.map((post) => (
        <div key={post.id} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          {post.pinned && (
            <span className="mb-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              📌 Pinned
            </span>
          )}
          {post.image_url && (
            <img src={post.image_url} className="mb-2 max-h-48 w-full rounded-xl object-cover" alt="" />
          )}
          <h3 className="font-semibold">{post.title}</h3>
          {post.body && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{post.body}</p>}
          <div className="mt-2 text-xs text-gray-400">
            {post.author_name ?? "VORTEXIA"}{post.author_role ? ` · ${post.author_role}` : ""} · {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
