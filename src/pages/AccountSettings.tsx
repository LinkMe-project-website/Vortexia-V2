import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-xl border border-gray-200 p-3 dark:border-slate-800 dark:bg-slate-900";

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    setEmailErr(null);
    setEmailMsg(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSaving(false);
    if (error) {
      setEmailErr(error.message);
      return;
    }
    setEmailMsg("Check both your old and new email inbox to confirm the change.");
    setNewEmail("");
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwErr("Kailangan ng at least 8 characters ang password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwErr("Hindi magkatugma ang password.");
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwErr(error.message);
      return;
    }
    setPwMsg("Na-update na ang password mo.");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/settings")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Account Settings</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-1 text-sm text-gray-500">Current email</div>
        <div className="font-semibold">{user?.email}</div>
      </div>

      <form onSubmit={handleEmailUpdate} className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="font-semibold">Change email</div>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="New email address"
          className={inputClass}
        />
        {emailErr && <p className="text-sm text-red-500">{emailErr}</p>}
        {emailMsg && <p className="text-sm text-green-600">{emailMsg}</p>}
        <button type="submit" disabled={emailSaving} className="w-full rounded-full bg-navy py-2.5 font-semibold text-white disabled:opacity-50">
          {emailSaving ? "Saving…" : "Update email"}
        </button>
      </form>

      <form onSubmit={handlePasswordUpdate} className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="font-semibold">Change password</div>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className={inputClass}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className={inputClass}
        />
        {pwErr && <p className="text-sm text-red-500">{pwErr}</p>}
        {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
        <button type="submit" disabled={pwSaving} className="w-full rounded-full bg-navy py-2.5 font-semibold text-white disabled:opacity-50">
          {pwSaving ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
