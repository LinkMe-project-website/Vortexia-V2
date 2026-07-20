import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// VORTEXIA v2 runs inside the same Android WebView wrapper (com.meetandgreet.app)
// as v1 — no SSR needed, this is a plain client-side SPA build.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
