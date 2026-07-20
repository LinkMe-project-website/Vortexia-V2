// Ported 1:1 from v1's BADGE_CATALOG (Section 6.1 Tier C) — VIP users pick
// ONE real earned badge to feature next to their name. Same catalog keys as
// v1 so existing profiles.highlight_badge values keep working unchanged.
const BADGE_CATALOG: Record<string, { emoji: string; label: string }> = {
  newcomer_tier: { emoji: "🥉", label: "Newcomer" },
  regular_tier: { emoji: "🥈", label: "Regular" },
  contributor_tier: { emoji: "🥇", label: "Contributor" },
  legend_tier: { emoji: "💎", label: "Legend" },
  weekly_highlight: { emoji: "🌟", label: "Weekly Highlight" },
  founder: { emoji: "🏛️", label: "Founder" },
  early_adopter: { emoji: "🌱", label: "Early Adopter" },
};

export default function HighlightBadge({ badgeKey }: { badgeKey: string | null }) {
  if (!badgeKey) return null;
  const meta = BADGE_CATALOG[badgeKey];
  if (!meta) return null;
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-800" title={meta.label}>
      {meta.emoji} {meta.label}
    </span>
  );
}
