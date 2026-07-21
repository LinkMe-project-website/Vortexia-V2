import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, Users, MessageCircle, Bell } from "lucide-react";
import TopBar from "@/components/TopBar";

// [Bug fix] Refactored down to exactly 4 clean bottom tabs — Profile is
// reachable via the top-bar profile button instead of taking up a 5th tab.
const TABS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/community", label: "Community", icon: Users, end: false },
  { to: "/chats", label: "Chats", icon: MessageCircle, end: false },
  { to: "/notifications", label: "Notifications", icon: Bell, end: false },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen flex-col">
      <TopBar path={pathname.startsWith("/chats/") ? "/chats" : pathname} />
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? "text-navy dark:text-cyan" : "text-gray-400"
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

