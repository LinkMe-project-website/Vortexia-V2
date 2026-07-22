import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

const TIMEZONES = ["UTC", "Asia/Manila", "Asia/Singapore", "America/New_York", "Europe/London"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fil", label: "Filipino" },
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [contactInfo, setContactInfo] = useState(profile?.contact_info ?? "");
  const [skillsText, setSkillsText] = useState((profile?.skills ?? []).join(", "));
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC");
  const [language, setLanguage] = useState(profile?.language ?? "en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !user) return <div className="p-4">Loading…</div>;

  async function handleSave() {
    setSaving(true);
    setError(null);

    const skillsArray = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        contact_info: contactInfo.trim() || null,
        skills: skillsArray,
        timezone,
        language,
      })
      .eq("id", user!.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refreshProfile();
    navigate("/profile");
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 p-3 dark:border-slate-800 dark:bg-slate-900";

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/profile")} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-500">Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your name" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-500">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputClass} placeholder="Tell others about yourself" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-500">Skills</label>
        <input
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
          className={inputClass}
          placeholder="e.g. Graphic Design, Copywriting, Video Editing"
        />
        <p className="text-xs text-gray-400">Paghiwalayin ng comma ang bawat skill.</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-500">Contact info</label>
        <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className={inputClass} placeholder="Phone, alternate email, etc." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-500">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-500">Avatar image URL</label>
        <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className={inputClass} placeholder="https://…" />
        <p className="text-xs text-gray-400">Photo upload (camera/gallery) is next — URL field lang muna ito.</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button onClick={handleSave} disabled={saving} className="w-full rounded-full bg-navy py-3 font-semibold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
