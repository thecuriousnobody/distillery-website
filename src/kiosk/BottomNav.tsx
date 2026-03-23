import { CalendarDays, LayoutGrid, Info } from "lucide-react";

export type KioskTab = "today" | "programs" | "about" | "concierge";

const TABS: { id: KioskTab; label: string; icon: typeof CalendarDays }[] = [
  { id: "today", label: "Today", icon: CalendarDays },
  { id: "programs", label: "Programs", icon: LayoutGrid },
  { id: "about", label: "About", icon: Info },
];

interface BottomNavProps {
  active: KioskTab;
  onTabChange: (tab: KioskTab) => void;
}

export default function BottomNav({ active, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex-none border-t-2 border-brutal-accent bg-brutal-black">
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? "text-brutal-accent bg-brutal-accent/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="font-mono text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
