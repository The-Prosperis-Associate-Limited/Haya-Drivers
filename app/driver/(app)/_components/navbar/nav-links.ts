import {
  Briefcase,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

// The earnings endpoints 403 an unverified driver; the nav is never the security boundary.
export const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/driver/dashboard", icon: LayoutGrid },
  {
    label: "My jobs",
    href: "/driver/dashboard/job-request",
    icon: Briefcase,
  },
  {
    label: "Reviews",
    href: "/driver/dashboard/reviews",
    icon: Star,
  },
  {
    label: "Earnings",
    href: "/driver/dashboard/earnings",
    icon: Wallet,
  },
  {
    label: "Trust score",
    href: "/driver/dashboard/trust-score",
    icon: ShieldCheck,
  },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Settings", href: "/driver/dashboard/settings", icon: Settings },
];
