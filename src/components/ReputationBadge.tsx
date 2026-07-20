import type { ReputationTier } from "@/types";

// Ported 1:1 from v1's REP_TIER_META / renderReputationBadge() — same
// tiers, same meaning, just a real component instead of a string template.
const REP_TIER_META: Record<ReputationTier, { emoji: string; label: string; className: string }> = {
  newcomer: { emoji: "🥉", label: "Newcomer", className: "bg-gray-100 text-gray-600" },
  regular: { emoji: "🥈", label: "Regular", className: "bg-blue-100 text-blue-700" },
  contributor: { emoji: "🥇", label: "Contributor", className: "bg-amber-100 text-amber-700" },
  legend: { emoji: "💎", label: "Legend", className: "bg-purple-100 text-purple-700" },
};

export default function ReputationBadge({ tier }: { tier: ReputationTier | null }) {
  const meta = REP_TIER_META[tier ?? "newcomer"];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}
