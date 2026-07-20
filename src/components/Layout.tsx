import { NavLink, Outlet } from "react-router-dom";
import { Home, Compass, MessageCircle, Bell, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/discover", label: "Discover", icon: Compass, end: false },
  { to: "/chats", label: "Chats", icon: MessageCircle, end: false },
  { to: "/notifications", label: "Notifications", icon: Bell, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export default function Layout() {
  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
