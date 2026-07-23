import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type FeedType = "announcement" | "marketplace" | "forum" | "video";

interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  body: string | null;
  image_url: string | null;
  author_name: string | null;
  meta: string | null;
  pinned: boolean;
  created_at: string;
}

const TYPE_STYLES: Record<FeedType, { label: string; className: string }> = {
  announcement: { label: "Anunsyo", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  marketplace: { label: "Marketplace", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" },
  forum: { label: "Forum", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  video: { label: "Video", className: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
};

function formatBudget(l: { budget_php: number | null; price: number | null; salary_min: number | null; salary_max: number | null }) {
  if (l.salary_min || l.salary_max) return `₱${(l.salary_min ?? 0).toLocaleString()} - ₱${(l.salary_max ?? 0).toLocaleString()}`;
  if (l.budget_php) return `₱${l.budget_php.toLocaleString()}`;
  if (l.price) return `₱${l.price.toLocaleString()}`;
  return null;
}

export default function FeedTimeline() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed-timeline"],
    queryFn: async () => {
      const [announcements, listings, forumPosts, videos] = await Promise.all([
        supabase
          .from("feed_posts")
          .select("id, title, body, author_name, pinned, image_url, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("marketplace_listings")
          .select("id, title, description, budget_php, price, salary_min, salary_max, poster_name, photos, is_featured, created_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("forum_posts")
          .select("id, title, body, author_name, is_pinned, post_image_url, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase
          .from("videos")
          .select("id, title, thumbnail_url, view_count, likes_count, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

      const items: FeedItem[] = [
        ...(announcements.data ?? []).map((a) => ({
          id: `announcement-${a.id}`,
          type: "announcement" as const,
          title: a.title,
          body: a.body,
          image_url: a.image_url,
          author_name: a.author_name,
          meta: null,
          pinned: !!a.pinned,
          created_at: a.created_at,
        })),
        ...(listings.data ?? []).map((l) => ({
          id: `marketplace-${l.id}`,
          type: "marketplace" as const,
          title: l.title,
          body: l.description,
          image_url: l.photos?.[0] ?? null,
          author_name: l.poster_name,
          meta: formatBudget(l),
          pinned: !!l.is_featured,
          created_at: l.created_at,
        })),
        ...(forumPosts.data ?? []).map((f) => ({
          id: `forum-${f.id}`,
          type: "forum" as const,
          title: f.title,
          body: f.body,
          image_url: f.post_image_url,
          author_name: f.author_name,
          meta: null,
          pinned: !!f.is_pinned,
          created_at: f.created_at,
        })),
        ...(videos.data ?? []).map((v) => ({
          id: `video-${v.id}`,
          type: "video" as const,
          title: v.title,
          body: null,
          image_url: v.thumbnail_url,
          author_name: null,
          meta: `👁️ ${v.view_count ?? 0} · ❤️ ${v.likes_count ?? 0}`,
          pinned: false,
          created_at: v.created_at,
        })),
      ];

      return items.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
  });

  if (isLoading) return <p className="py-6 text-center text-sm text-gray-500">Loading…</p>;
  if (!data?.length) return <p className="py-6 text-center text-sm text-gray-500">Wala pang laman ang feed.</p>;

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const style = TYPE_STYLES[item.type];
        return (
          <div key={item.id} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.className}`}>
                {style.label}
              </span>
              {item.pinned && (
                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  📌 Pinned
                </span>
              )}
            </div>
            {item.image_url && (
              <img src={item.image_url} className="mb-2 max-h-48 w-full rounded-xl object-cover" alt="" />
            )}
            <h3 className="font-semibold">{item.title}</h3>
            {item.body && <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{item.body}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {item.author_name && <span>{item.author_name}</span>}
              {item.meta && <span>{item.meta}</span>}
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
