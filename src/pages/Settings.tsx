import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

type ToggleKey =
  | "notif_email"
  | "notif_in_app"
  | "notif_sound"
  | "notif_vibration"
  | "notif_room_invite"
  | "show_activity_status"
  | "show_room_status"
  | "allow_dm_from_everyone"
  | "allow_unrestricted_messages";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${checked ? "bg-navy justify-end" : "bg-gray-300 justify-start"}`}
    >
      <span className="h-5 w-5 rounded-full bg-white" />
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-slate-800">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

interface BlockedRow {
  id: string;
  blocked_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuthStore();

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    notif_email: profile?.notif_email ?? true,
    notif_in_app: profile?.notif_in_app ?? true,
    notif_sound: profile?.notif_sound ?? true,
    notif_vibration: profile?.notif_vibration ?? true,
    notif_room_invite: profile?.notif_room_invite ?? true,
    show_activity_status: profile?.show_activity_status ?? true,
    show_room_status: profile?.show_room_status ?? true,
    allow_dm_from_everyone: profile?.allow_dm_from_everyone ?? true,
    allow_unrestricted_messages: profile?.allow_unrestricted_messages ?? false,
  });

  const [blocked, setBlocked] = useState<BlockedRow[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("blocked_users")
      .select("id, blocked_id, profiles!blocked_users_blocked_id_fkey(full_name, avatar_url)")
      .eq("blocker_id", user.id)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setBlocked(
            (data ?? []).map((row: any) => ({
              id: row.id,
              blocked_id: row.blocked_id,
              full_name: row.profiles?.full_name ?? "Unknown user",
              avatar_url: row.profiles?.avatar_url ?? null,
            }))
          );
        }
        setLoadingBlocked(false);
      });
  }, [user]);

  if (!user || !profile) return <div className="p-4">Loading…</div>;

  async function handleToggle(key: ToggleKey, value: boolean) {
    setToggles((prev) => ({ ...prev, [key]: value }));
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [key]: value })
      .eq("id", user!.id);
    if (updateError) {
      setError(updateError.message);
      setToggles((prev) => ({ ...prev, [key]: !value }));
      return;
    }
    refreshProfile();
  }

  async function handleUnblock(id: string) {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("blocked_users").delete().eq("id", id);
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/profile")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Notifications</h2>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <ToggleRow label="Email notifications" checked={toggles.notif_email} onChange={(v) => handleToggle("notif_email", v)} />
          <ToggleRow label="In-app notifications" checked={toggles.notif_in_app} onChange={(v) => handleToggle("notif_in_app", v)} />
          <ToggleRow label="Sound" checked={toggles.notif_sound} onChange={(v) => handleToggle("notif_sound", v)} />
          <ToggleRow label="Vibration" checked={toggles.notif_vibration} onChange={(v) => handleToggle("notif_vibration", v)} />
          <ToggleRow label="Room invites" checked={toggles.notif_room_invite} onChange={(v) => handleToggle("notif_room_invite", v)} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Privacy</h2>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <ToggleRow label="Show activity status" checked={toggles.show_activity_status} onChange={(v) => handleToggle("show_activity_status", v)} />
          <ToggleRow label="Show current room" checked={toggles.show_room_status} onChange={(v) => handleToggle("show_room_status", v)} />
          <ToggleRow label="Allow DMs from everyone" checked={toggles.allow_dm_from_everyone} onChange={(v) => handleToggle("allow_dm_from_everyone", v)} />
          <ToggleRow label="Allow unrestricted messages" checked={toggles.allow_unrestricted_messages} onChange={(v) => handleToggle("allow_unrestricted_messages", v)} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Blocked users</h2>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          {loadingBlocked ? (
            <p className="py-3 text-sm text-gray-400">Loading…</p>
          ) : blocked.length === 0 ? (
            <p className="py-3 text-sm text-gray-400">Wala kang na-block na user.</p>
          ) : (
            blocked.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    {b.avatar_url && <img src={b.avatar_url} className="h-full w-full object-cover" alt="" />}
                  </div>
                  <span className="text-sm">{b.full_name}</span>
                </div>
                <button onClick={() => handleUnblock(b.id)} className="text-xs font-semibold text-red-500">
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <button onClick={() => navigate("/security")} className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold dark:border-slate-700">
        🔒 Two-factor / Biometric setup
      </button>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">Account</h2>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => navigate("/settings/account")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left last:border-0 dark:border-slate-800">
            <span className="text-sm">✉️ Email & Password</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">App Info</h2>
        <div className="rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => navigate("/support")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left dark:border-slate-800">
            <span className="text-sm">🆘 App Support / FAQ / Send Feedback</span>
          </button>
          <button onClick={() => navigate("/settings/info/guidelines")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left dark:border-slate-800">
            <span className="text-sm">📋 Community Guidelines</span>
          </button>
          <button onClick={() => navigate("/settings/info/safety")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left dark:border-slate-800">
            <span className="text-sm">🛡️ Safety Advice</span>
          </button>
          <button onClick={() => navigate("/settings/info/terms")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left dark:border-slate-800">
            <span className="text-sm">📄 Terms of Use</span>
          </button>
          <button onClick={() => navigate("/settings/info/privacy")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left dark:border-slate-800">
            <span className="text-sm">🔏 Privacy Policy</span>
          </button>
          <button onClick={() => navigate("/settings/info/about")} className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left last:border-0 dark:border-slate-800">
            <span className="text-sm">ℹ️ About the Developer</span>
          </button>
        </div>
      </div>

      <button
        onClick={async () => {
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          alert("Na-clear na ang cache.");
        }}
        className="w-full rounded-full border border-gray-300 py-3 text-sm font-semibold dark:border-slate-700"
      >
        🧹 Clear cache
      </button>
    </div>
  );
}
