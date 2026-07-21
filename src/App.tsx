import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import "@/store/theme"; // side-effect: applies saved theme before first paint
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
import Invites from "@/pages/Invites";
import Security from "@/pages/Security";
import Tasks from "@/pages/Tasks";
import TeamApplication from "@/pages/TeamApplication";
import Support from "@/pages/Support";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  // [New] Step-by-step onboarding gate — profiles.onboarded_at already
  // existed in the schema (used by v1) but v2 needs to actually check it.
  if (profile && !profile.onboarded_at) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setBootDone(true);
    });
  }, [setUser]);

  if (!bootDone) return <Splash />;

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
        <Route path="invites" element={<Invites />} />
        <Route path="security" element={<Security />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="team-application" element={<TeamApplication />} />
        <Route path="support" element={<Support />} />
      </Route>
    </Routes>
  );
}
