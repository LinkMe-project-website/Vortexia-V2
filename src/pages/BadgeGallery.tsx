import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import ReputationBadge from "@/components/ReputationBadge";
import HighlightBadge from "@/components/HighlightBadge";
import type { ReputationTier } from "@/types";

const TIERS: { tier: ReputationTier; desc: string }[] = [
  { tier: "newcomer", desc: "Bagong miyembro — kumpletuhin ang verification at unang gawain para umangat." },
  { tier: "regular", desc: "Aktibong miyembro na may maayos na track record sa VORTEXIA." },
  { tier: "contributor", desc: "Kinikilalang miyembro na tumutulong sa community at may mataas na reputation." },
  { tier: "legend", desc: "Ang pinakamataas na ranggo — pinagkakatiwalaan at aktibong bahagi ng VORTEXIA." },
];

export default function BadgeGallery() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  if (!profile) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/profile")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Badge Gallery</h1>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-2">
          <ReputationBadge tier={profile.reputation_tier} />
          <HighlightBadge badgeKey={profile.highlight_badge} />
        </div>
        <p className="mt-2 text-center text-sm text-gray-500">
          Ito ang kasalukuyang ranggo at badge mo, batay sa totoong activity — walang binibiling badge dito.
        </p>
      </div>

      <div className="space-y-2">
        {TIERS.map(({ tier, desc }) => (
          <div
            key={tier}
            className={`flex items-center gap-3 rounded-2xl border p-3 dark:border-slate-800 ${
              profile.reputation_tier === tier ? "border-navy bg-navy/5 dark:bg-cyan/10" : "border-gray-200 bg-white dark:bg-slate-900"
            }`}
          >
            <ReputationBadge tier={tier} />
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
