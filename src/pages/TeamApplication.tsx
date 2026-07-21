import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import SecurityConfirmModal from "@/components/SecurityConfirmModal";

const ROLES = ["Moderator", "Helper", "Beta Tester", "Content Verifier", "Contributor"];

export default function TeamApplication() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [role, setRole] = useState(ROLES[0]);
  const [skills, setSkills] = useState("");
  const [motivation, setMotivation] = useState("");
  const [safety, setSafety] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function actuallySubmit() {
    if (!user) return;
    const { error } = await supabase.from("team_applications").insert({
      user_id: user.id, preferred_role: role, skills_experience: skills, motivation, safety_answer: safety,
    });
    if (error) { setError(error.message); return; }
    setSubmitted(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!skills.trim() || !motivation.trim() || !safety.trim()) { setError("Please fill in all fields."); return; }
    setShowConfirm(true); // sensitive action — requires biometric/password confirmation
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="text-xl font-bold">Application received!</h1>
        <p className="text-gray-500">We review every application fairly. We'll be in touch.</p>
        <button onClick={() => navigate("/profile")} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate("/profile")} className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <h1 className="text-xl font-bold">VORTEXIA is recruiting</h1>
      <p className="mb-4 mt-1 text-sm text-gray-500">
        We welcome people with passion and experience. Everyone is equal, free, and fair — no upper limit to what we
        can build together. This is your stage to show your ability.
      </p>
      <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        🏆 Founding team perks: lifetime VIP, exclusive badges, Hall of Fame credit, and priority for paid
        roles/partnerships once revenue starts. Verified + VIP members are prioritized, but every application is
        reviewed fairly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Preferred role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:bg-slate-800 dark:border-slate-700">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Skills / experience</label>
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Why do you want to join?</label>
          <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">How will you help keep the community safe?</label>
          <textarea value={safety} onChange={(e) => setSafety(e.target.value)} rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 dark:bg-slate-800 dark:border-slate-700" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-navy py-3 font-semibold text-white">Submit application</button>
      </form>

      {showConfirm && (
        <SecurityConfirmModal
          onConfirmed={() => { setShowConfirm(false); actuallySubmit(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
