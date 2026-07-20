import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setProfile: (profile) => set({ profile }),
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) { console.error("refreshProfile failed:", error); return; }
    set({ profile: data as Profile });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));

// Wire up Supabase's own auth listener once at module load — keeps the
// store in sync with login/logout/token refresh events automatically.
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  if (session?.user) useAuthStore.getState().refreshProfile();
});
