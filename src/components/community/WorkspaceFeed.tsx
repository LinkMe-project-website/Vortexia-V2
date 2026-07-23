import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

interface Video {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_url: string | null;
  uploader_name: string | null;
  uploader_avatar: string | null;
  view_count: number | null;
  likes_count: number | null;
  created_at: string;
}

export default function WorkspaceFeed() {
  const { profile } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["workspace-videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("videos")
        .select("id, title, description, file_path, thumbnail_url, uploader_name, uploader_avatar, view_count, likes_count, created_at")
        .eq("is_draft", false)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Video[];
    },
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      // [WebView background token issue — see masterplan] refresh session
      // right before upload, in case autoRefreshToken timer got throttled.
      await supabase.auth.getSession();

      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("videos").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);

      const { error: insertError } = await supabase.from("videos").insert({
        uploaded_by: profile.id,
        uploader_name: profile.full_name,
        uploader_avatar: profile.avatar_url,
        title: file.name,
        file_path: pub.publicUrl,
        is_draft: false,
      });
      if (insertError) throw insertError;
      queryClient.invalidateQueries({ queryKey: ["workspace-videos"] });
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Upload failed. Subukan ulit.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleUpload} />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mb-3 w-full rounded-full bg-navy py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {uploading ? "Ina-upload…" : "+ Upload video/portfolio"}
      </button>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-gray-500">Loading…</p>
      ) : !data?.length ? (
        <p className="py-6 text-center text-sm text-gray-500">Wala pang video. Ikaw ang maging una!</p>
      ) : (
        <div className="snap-y snap-mandatory space-y-3 overflow-y-auto rounded-2xl" style={{ maxHeight: "70vh" }}>
          {data.map((v) => (
            <div key={v.id} className="relative snap-start overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "9/16" }}>
              <video src={v.file_path} poster={v.thumbnail_url ?? undefined} className="h-full w-full object-cover" controls playsInline />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-sm font-semibold drop-shadow">{v.title}</p>
                <p className="text-xs opacity-80 drop-shadow">
                  {v.uploader_name ?? "Miyembro"} · 👁 {v.view_count ?? 0} · ❤️ {v.likes_count ?? 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
