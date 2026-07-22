import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

const TIMEZONES = ["UTC", "Asia/Manila", "Asia/Singapore", "America/New_York", "Europe/London"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fil", label: "Filipino" },
];

async function uploadImage(userId: string, file: File, kind: "avatar" | "cover"): Promise<string> {
  // Refresh session first — WebView backgrounding can leave a stale token
  // sitting around (same fix pattern as v1's foreground session refresh).
  await supabase.auth.getSession();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  return data.publicUrl;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [coverUrl, setCoverUrl] = useState(profile?.cover_photo_url ?? "");
  const [contactInfo, setContactInfo] = useState(profile?.contact_info ?? "");
  const [skillsText, setSkillsText] = useState((profile?.skills ?? []).join(", "));
  const [timezone, setTimezone] = useState(profile?.timezone ?? "UTC");
  const [language, setLanguage] = useState(profile?.language ?? "en");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !user) return <div className="p-4">Loading…</div>;

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "avatar" | "cover"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const setLoading = kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    const setUrl = kind === "avatar" ? setAvatarUrl : setCoverUrl;

    setLoading(true);
    setError(null);
    try {
      const url = await uploadImage(user!.id, file, kind);
      setUrl(url);
    } catch (err) {
      setError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

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
        cover_photo_url: coverUrl.trim() || null,
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

      {/* Cover photo */}
      <div className="relative">
        <div className="h-28 w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800">
          {coverUrl && <img src={coverUrl} className="h-full w-full object-cover" alt="" />}
        </div>
        <label className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">
          <Camera size={14} />
          {uploadingCover ? "Uploading…" : "Cover"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "cover")} disabled={uploadingCover} />
        </label>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan to-blue text-xl font-bold text-white">
            {avatarUrl ? (
              <img src={avatarUrl} className="h-full w-full object-cover" alt="" />
            ) : (
              (fullName || "?").charAt(0).toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-white">
            <Camera size={12} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "avatar")} disabled={uploadingAvatar} />
          </label>
        </div>
        <p className="text-xs text-gray-400">
          {uploadingAvatar ? "Uploading…" : "Tap the camera icon to change your photo"}
        </p>
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || uploadingAvatar || uploadingCover}
        className="w-full rounded-full bg-navy py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
