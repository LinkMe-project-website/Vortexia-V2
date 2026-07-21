import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { registerBiometric } from "@/lib/webauthn";

export default function Security() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    setStatus("Follow the prompt on your device…");
    try {
      await registerBiometric("My device");
      setStatus("✅ Face/Fingerprint unlock is now set up for this device.");
    } catch (err) {
      setStatus(null);
      setError((err as Error).message);
    }
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate("/profile")} className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <h1 className="mb-1 text-xl font-bold">Security</h1>

      <div className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-slate-700">
        <h2 className="mb-2 font-semibold">Verification status</h2>
        <div className="space-y-1 text-sm">
          <div>Email: {profile?.email_verified_at ? "✅ Verified" : "⏳ Not verified"}</div>
          <div>Identity: {profile?.identity_verified_at ? "✅ Verified" : "⏳ Not verified"}</div>
        </div>
        {(!profile?.email_verified_at || !profile?.identity_verified_at) && (
          <p className="mt-2 text-xs text-gray-500">
            You can't post, apply, or message until both are complete.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
        <h2 className="mb-1 font-semibold">👤 Face / Fingerprint Unlock</h2>
        <p className="mb-3 text-sm text-gray-500">
          Uses your device's own screen lock (Face Unlock, fingerprint, or PIN) via WebAuthn — the scan itself
          never leaves your device; VORTEXIA only ever receives a cryptographic confirmation, never biometric data.
          Required to confirm sensitive actions: changing your email, renewing VIP, and applying for the team.
        </p>
        <button onClick={handleRegister} className="w-full rounded-full bg-navy py-3 font-semibold text-white">
          Set up on this device
        </button>
        {status && <p className="mt-2 text-sm text-green-600">{status}</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
