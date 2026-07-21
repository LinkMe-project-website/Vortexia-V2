import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

interface Task {
  id: string;
  task_key: string;
  title: string;
  description: string | null;
  reward_type: string;
  reward_value: string;
}

const REWARD_LABEL: Record<string, (v: string) => string> = {
  vip_days: (v) => `+${v} VIP days`,
  extra_invites: (v) => `+${v} extra invite${v === "1" ? "" : "s"}`,
  priority_listing: (v) => `${v} days priority listing`,
  badge: () => "Exclusive badge",
  early_access: () => "Early feature access",
};

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: completions } = useQuery({
    queryKey: ["task-completions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_task_completions").select("task_id");
      if (error) throw error;
      return new Set((data ?? []).map((c) => c.task_id));
    },
  });

  async function claim(taskKey: string) {
    const { error } = await supabase.rpc("complete_task", { p_task_key: taskKey });
    if (error) { alert(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["task-completions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate("/profile")} className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="mb-1 text-xl font-bold">Tasks & Rewards</h1>
      <p className="mb-4 text-sm text-gray-500">Complete tasks to unlock exclusive VORTEXIA perks — no cash value.</p>

      <div className="space-y-3">
        {tasks?.map((t) => {
          const done = completions?.has(t.id);
          return (
            <div key={t.id} className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
              <div className="font-semibold">{t.title}</div>
              {t.description && <div className="text-sm text-gray-500">{t.description}</div>}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-navy dark:text-cyan">
                  🎁 {REWARD_LABEL[t.reward_type]?.(t.reward_value) ?? t.reward_value}
                </span>
                <button
                  onClick={() => claim(t.task_key)}
                  disabled={done}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    done ? "bg-gray-100 text-gray-400 dark:bg-slate-800" : "bg-navy text-white"
                  }`}
                >
                  {done ? "✓ Claimed" : "Claim"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
