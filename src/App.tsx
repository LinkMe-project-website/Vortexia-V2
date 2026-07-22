import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import "@/store/theme";
import Layout from "@/components/Layout";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Community from "@/pages/Community";
import Chats from "@/pages/Chats";
import ChatDetail from "@/pages/ChatDetail";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Settings from "@/pages/Settings";
import Invites from "@/pages/Invites";
import Security from "@/pages/Security";
import Tasks from "@/pages/Tasks";
import TeamApplication from "@/pages/TeamApplication";
import Support from "@/pages/Support";

import AccountSettings from "@/pages/AccountSettings";

import InfoPage from "@/pages/InfoPage";

import BadgeGallery from "@/pages/BadgeGallery";

import WhoViewedProfile from "@/pages/WhoViewedProfile";

import Connections from "@/pages/Connections";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && !profile.onboarded_at) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const [bootDone, setBootDone] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);

    const timeout = setTimeout(() => {
      setBootError("Taking too long to start. Check your connection and reopen the app.");
    }, 10000);

    supabase.auth.getSession()
      .then(({ data }) => {
        clearTimeout(timeout);
        clearInterval(tick);
        setUser(data.session?.user ?? null);
        setBootDone(true);
      })
      .catch((err) => {
        clearTimeout(timeout);
        clearInterval(tick);
        setBootError(`Could not start: ${(err as Error).message}`);
      });

    return () => { clearTimeout(timeout); clearInterval(tick); };
  }, [setUser]);

  if (bootError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-3xl">⚠️</div>
        <p className="text-gray-600">{bootError}</p>
        <button onClick={() => window.location.reload()} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  if (!bootDone) {
    return (
      <div className="relative h-screen">
        <Splash />
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400">
          Checking session… {elapsed}s
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="community" element={<Community />} />
        <Route path="chats" element={<Chats />} />
        <Route path="chats/:id" element={<ChatDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="invites" element={<Invites />} />
        <Route path="security" element={<Security />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="team-application" element={<TeamApplication />} />
        <Route path="support" element={<Support />} />

<Route path="settings/account" element={<AccountSettings />} />

<Route path="settings/info/:slug" element={<InfoPage />} />

<Route path="badges" element={<BadgeGallery />} />

<Route path="who-viewed-me" element={<WhoViewedProfile />} />

<Route path="connections" element={<Connections />} />
      </Route>
    </Routes>
  );
}
