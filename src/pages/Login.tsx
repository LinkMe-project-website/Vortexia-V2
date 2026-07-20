import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password }); // email-only signup — no social login, per Section 0 of the v1 masterplan
    setLoading(false);
    if (error) { setError(error.message); return; }
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
