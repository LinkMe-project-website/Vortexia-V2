import { useState } from "react";
import AnnouncementFeed from "./AnnouncementFeed";
import MarketplaceFeed from "./MarketplaceFeed";
import ForumFeed from "./ForumFeed";
import WorkspaceFeed from "./WorkspaceFeed";

const TABS = [
  { key: "announcement", label: "ANNOUNCEMENT" },
  { key: "marketplace", label: "MARKETPLACE" },
  { key: "forum", label: "FORUM" },
  { key: "workspace", label: "WORKSPACE" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DashboardTabs() {
  const [active, setActive] = useState<TabKey>("announcement");

  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition ${
              active === t.key
                ? "bg-navy text-white"
                : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {active === "announcement" && <AnnouncementFeed />}
        {active === "marketplace" && <MarketplaceFeed />}
        {active === "forum" && <ForumFeed />}
        {active === "workspace" && <WorkspaceFeed />}
      </div>
    </div>
  );
}
