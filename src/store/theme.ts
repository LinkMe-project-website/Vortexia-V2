import { create } from "zustand";

type Theme = "light" | "dark";
const STORAGE_KEY = "vortexia-theme";

function getInitialTheme(): Theme {
  // [Bug fix] User's own saved choice always wins over system/OS dark mode —
  // never auto-follow prefers-color-scheme. Only fall back to it the very
  // first time, before the user has ever chosen anything themselves.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (t) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    set({ theme: t });
  },
}));

// Apply immediately at module load, before first paint.
applyTheme(useThemeStore.getState().theme);
