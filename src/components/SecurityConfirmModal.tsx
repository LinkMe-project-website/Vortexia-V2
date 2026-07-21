import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { verifyBiometric, hasBiometricRegistered } from "@/lib/webauthn";

interface Props {
  onConfirmed: () => void;
  onCancel: () => void;
}

/**
 * Required before sensitive actions: change email, renew VIP, apply for
 * team. VIP members with a registered platform authenticator get the fast
 * Face/fingerprint prompt; everyone else (or VIPs without biometrics set up
 * yet) falls back to re-entering their password.
 */
export default function SecurityConfirmModal({ onConfirmed, onCancel }: Props) {
  const { user, profile } = useAuthStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  useState(() => {
    if (user) hasBiometricRegistered(user.id).then((v) => { setCanUseBiometric(v); setChecking(false); });
  });

  async function tryBiometric() {
    setError(null);
    try {
      await verifyBiometric();
      onConfirmed();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function tryPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!profile?.email) return;
    const { error } = await supabase.auth.signInWithPassword({ email: profile.email, password });
    if (error) { setError("Incorrect password."); return; }
    onConfirmed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-slate-900">
        <h2 className="mb-1 text-lg font-bold">Confirm it's you</h2>
        <p className="mb-4 text-sm text-gray-500">This action needs extra confirmation for your security.</p>

        {error && <div className="mb-3 text-sm text-red-500">{error}</div>}

        {!checking && canUseBiometric && (
          <button onClick={tryBiometric} className="mb-3 w-full rounded-full bg-navy py-3 font-semibold text-white">
            👤 Use Face/Fingerprint Unlock
          </button>
        )}

        <form onSubmit={tryPassword} className="space-y-2">
          <input
            type="password" required placeholder="Enter your password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-4 py-2.5 dark:bg-slate-800 dark:border-slate-700"
          />
          <button type="submit" className="w-full rounded-full border border-navy py-2.5 font-semibold text-navy dark:text-cyan">
            Confirm with password
          </button>
        </form>

        <button onClick={onCancel} className="mt-3 w-full text-sm text-gray-400">Cancel</button>
      </div>
    </div>
  );
}
