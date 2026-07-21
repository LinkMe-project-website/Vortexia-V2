import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

export default function Invites() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const isVip = profile?.vip_status === "trialing" || profile?.vip_status === "active";

  const { data: codes, isLoading } = useQuery({
    queryKey: ["invite-codes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as InviteCode[];
    },
  });

  async function generate() {
    setError(null);
    const { error } = await supabase.rpc("generate_invite_code", { p_max_uses: isVip ? 3 : 1 });
    if (error) { setError(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate("/profile")} className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="mb-1 text-xl font-bold">Invite Codes</h1>
      <p className="mb-4 text-sm text-gray-500">
        {isVip
          ? "As a VIP, you get up to 10 active codes, each usable up to 3 times. You earn +25 reputation when an invite you send completes verification."
          : "Free members get up to 2 active, single-use invite codes. Upgrade to VIP for more."}
      </p>

      {error && <div className="mb-3 text-sm text-red-500">{error}</div>}

      <button onClick={generate} className="mb-4 w-full rounded-full bg-navy py-3 font-semibold text-white">
        + Generate new invite code
      </button>

      {isLoading && <div className="text-gray-400">Loading…</div>}
      <div className="space-y-2">
        {codes?.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-slate-700">
            <div>
              <div className="font-mono font-bold tracking-widest">{c.code}</div>
              <div className="text-xs text-gray-500">
                {c.uses_count}/{c.max_uses} used {c.is_active ? "" : "• used up"}
              </div>
            </div>
            <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-gray-400">
              <Copy size={18} />
            </button>
          </div>
        ))}
        {codes?.length === 0 && <div className="text-sm text-gray-400">No invite codes yet.</div>}
      </div>
    </div>
  );
}
