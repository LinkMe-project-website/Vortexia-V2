import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ForumPost {
  id: string;
  title: string;
  body: string;
  category: string | null;
  is_pinned: boolean | null;
  likes_count: number | null;
  comments_count: number | null;
  reply_count: number | null;
  author_name: string | null;
  post_image_url: string | null;
  created_at: string;
}

export default function ForumFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("forum_posts")
        .select("id, title, body, category, is_pinned, likes_count, comments_count, reply_count, author_name, post_image_url, created_at")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as ForumPost[];
    },
  });

  if (isLoading) return <p className="py-6 text-center text-sm text-gray-500">Loading…</p>;
  if (!data?.length) return <p className="py-6 text-center text-sm text-gray-500">Wala pang forum post.</p>;

  return (
    <div className="space-y-3">
      {data.map((post) => (
        <div key={post.id} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          {post.is_pinned && (
            <span className="mb-1 mr-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              📌 Pinned
            </span>
          )}
          {post.category && (
            <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-slate-800">
              {post.category}
            </span>
          )}
          {post.post_image_url && (
            <img src={post.post_image_url} className="mb-2 max-h-48 w-full rounded-xl object-cover" alt="" />
          )}
          <h3 className="font-semibold">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{post.body}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>{post.author_name ?? "Miyembro"}</span>
            <span>❤️ {post.likes_count ?? 0}</span>
            <span>💬 {post.comments_count ?? post.reply_count ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
