import {
  BookOpen,
  BriefcaseBusiness,
  LayoutGrid,
  Receipt,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Wallet and Transactions left the nav with the org-account payment pivot -
// the routes still exist but nothing links to them.
export const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  {
    label: "Find drivers",
    href: "/dashboard/requests/find-talent",
    icon: Search,
  },
  { label: "My hire", href: "/dashboard/my-hire", icon: BriefcaseBusiness },
  { label: "Requests", href: "/dashboard/requests", icon: BookOpen },
  { label: "Billing", href: "/dashboard/billing", icon: Receipt },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
