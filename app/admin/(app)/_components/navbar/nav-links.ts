import {
  ArrowLeftRight,
  BriefcaseBusiness,
  CalendarCheck,
  Car,
  LayoutGrid,
  MessagesSquare,
  Settings,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AdminNav } from "@/types/admin";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: keyof AdminNav["counts"];
  countLabel?: string;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
  {
    href: "/admin/dashboard/drivers",
    label: "Drivers",
    icon: Car,
    countKey: "drivers",
    countLabel: "awaiting verification",
  },
  { href: "/admin/dashboard/clients", label: "Clients", icon: UsersRound },
  {
    href: "/admin/dashboard/hires",
    label: "Hires",
    icon: BriefcaseBusiness,
    countKey: "hires",
    countLabel: "needing action",
  },
  {
    href: "/admin/dashboard/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
    countKey: "transactions",
    countLabel: "payouts needing attention",
  },
  {
    href: "/admin/dashboard/attendance",
    label: "Attendance",
    icon: CalendarCheck,
    countKey: "attendance",
    countLabel: "open flags",
  },
  {
    href: "/admin/dashboard/support",
    label: "Support",
    icon: MessagesSquare,
    countKey: "support",
    countLabel: "chats waiting for an agent",
  },
];

export const ADMIN_FOOTER_LINKS: AdminNavLink[] = [
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];
