import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/device";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      navigate("/");
      return;
    }

    // [Invite System] New users must enter a valid invite code — checked
    // server-side by redeem_invite_code() right after signup, before the
    // user can do anything else in the app.
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) { setLoading(false); setError("An invite code is required to join VORTEXIA."); return; }

    const { error: signUpError } = await supabase.auth.signUp({ email, password }); // email-only, no social login — Section 0
    if (signUpError) { setLoading(false); setError(signUpError.message); return; }

    const { data: redeemed, error: redeemError } = await supabase.rpc("redeem_invite_code", { p_code: trimmedCode });
    if (redeemError || !redeemed) {
      setLoading(false);
      setError("That invite code is invalid, expired, or already used up.");
      return;
    }

    // [Verification & Entry Rules] One account per device.
    const { error: deviceError } = await supabase.rpc("register_device", { p_device_hash: getDeviceId() });
    setLoading(false);
    if (deviceError) { setError(deviceError.message); return; }

    navigate("/");
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-navy dark:text-cyan">VORTEXIA</h1>
        <p className="text-sm text-gray-500">Where Every Opportunity Meets You</p>
        <p className="mt-1 text-xs text-gray-400">Secure • No Social Links • One-Time Login</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-gray-300 px-4 py-3 dark:bg-slate-800 dark:border-slate-700"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-full border border-gray-300 px-4 py-3 dark:bg-slate-800 dark:border-slate-700"
        />
        {mode === "signup" && (
          <input
            type="text" required placeholder="Invite code" value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-full border border-gray-300 px-4 py-3 uppercase tracking-widest dark:bg-slate-800 dark:border-slate-700"
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full rounded-full bg-navy py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Log in" : "Sign up"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-gray-500"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
