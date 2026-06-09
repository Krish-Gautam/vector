import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Brain,
  CheckSquare,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Timer,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

export type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export type SidebarGroup = {
  section: string;
  items: SidebarItem[];
};

export const sidebarGroups: SidebarGroup[] = [
  {
    section: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Map, label: "My Roadmap", href: "/roadmap" },
      { icon: CheckSquare, label: "Tasks", href: "/tasks" },
      { icon: Timer, label: "Focus Sessions", href: "/focus" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    section: "ACCOUNTABILITY",
    items: [
{ icon: Users, label: "Execution Circle", href: "/execution-circle" },
      { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
      { icon: ShieldCheck, label: "Proof Logs", href: "/proof-logs" },
    ],
  },
  {
    section: "AI TOOLS",
    items: [
      { icon: Brain, label: "AI Coach", href: "/ai-coach" },
      { icon: TrendingUp, label: "Smart Insights", href: "/insights" },
    ],
  },
];
