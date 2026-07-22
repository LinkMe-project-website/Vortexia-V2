import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string | null;
  budget_php: number | null;
  price: number | null;
  salary_min: number | null;
  salary_max: number | null;
  work_type: string | null;
  location: string | null;
  poster_name: string | null;
  poster_avatar: string | null;
  photos: string[] | null;
  is_featured: boolean | null;
  created_at: string;
}

function formatBudget(l: Listing) {
  if (l.salary_min || l.salary_max) {
    return `₱${(l.salary_min ?? 0).toLocaleString()} - ₱${(l.salary_max ?? 0).toLocaleString()}`;
  }
  if (l.budget_php) return `₱${l.budget_php.toLocaleString()}`;
  if (l.price) return `₱${l.price.toLocaleString()}`;
  return null;
}

export default function MarketplaceFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("marketplace_listings")
        .select("id, title, description, category, budget_php, price, salary_min, salary_max, work_type, location, poster_name, poster_avatar, photos, is_featured, created_at")
        .eq("status", "open")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Listing[];
    },
  });

  if (isLoading) return <p className="py-6 text-center text-sm text-gray-500">Loading…</p>;
  if (!data?.length) return <p className="py-6 text-center text-sm text-gray-500">Wala pang listing sa marketplace.</p>;

  return (
    <div className="space-y-3">
      {data.map((l) => (
        <div key={l.id} className="rounded-2xl border border-gray-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            {l.poster_avatar && <img src={l.poster_avatar} className="h-6 w-6 rounded-full object-cover" alt="" />}
            <span className="text-xs text-gray-500">{l.poster_name ?? "Miyembro"}</span>
            {l.is_featured && (
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                FEATURED
              </span>
            )}
          </div>
          {l.photos?.[0] && <img src={l.photos[0]} className="mt-2 max-h-48 w-full rounded-xl object-cover" alt="" />}
          <h3 className="mt-2 font-semibold">{l.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{l.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {l.category && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-slate-800">{l.category}</span>}
            {l.work_type && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-slate-800">{l.work_type}</span>}
            {formatBudget(l) && <span className="font-semibold text-gray-600 dark:text-gray-300">{formatBudget(l)}</span>}
            {l.location && <span>📍 {l.location}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
