import { createClient } from "@supabase/supabase-js";

// Same Supabase project as v1 — no data migration needed, just a new
// frontend on top of the same backend (per your decision to keep Supabase).
const SUPABASE_URL = "https://rgoasqesstmwfuqzhmqp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb2FzcWVzc3Rtd2Z1cXpobXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2ODM4NTgsImV4cCI6MjA5ODI1OTg1OH0.2N_dNDdTo9sbYsuX_FAMRWZZ3jiNA2gnF13FhicdRR0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * [Carried over from v1 fix, July 18] VORTEXIA runs inside an Android
 * WebView wrapper (com.meetandgreet.app), not a normal browser tab.
 * Backgrounding the app throttles JS timers — including supabase-js's own
 * autoRefreshToken timer — so a stale token can still be sitting around
 * when the user returns and immediately does something. Call this once at
 * app startup: it listens for the app coming back to the foreground and
 * proactively refreshes the session (getSession() checks expiry and
 * refreshes automatically if needed).
 */
export function startForegroundSessionRefresh() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      supabase.auth.getSession().catch((err) => console.error("Foreground session refresh failed:", err));
    }
  });
}
