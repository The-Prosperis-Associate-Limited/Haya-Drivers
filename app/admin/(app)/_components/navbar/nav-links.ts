import {
  ArrowLeftRight,
  CalendarCheck,
  LayoutGrid,
  MessagesSquare,
  ReceiptText,
  Settings,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/admin/dashboard/drivers", label: "Driver", icon: UserRound },
  { href: "/admin/dashboard/clients", label: "Client", icon: UsersRound },
  {
    href: "/admin/dashboard/transactions",
    label: "Transaction",
    icon: ArrowLeftRight,
  },
  {
    href: "/admin/dashboard/hires",
    label: "Hires",
    icon: ReceiptText,
  },
  {
    href: "/admin/dashboard/attendance",
    label: "Attendance",
    icon: CalendarCheck,
  },
  {
    href: "/admin/dashboard/support",
    label: "Support",
    icon: MessagesSquare,
  },
];

export const ADMIN_FOOTER_LINKS: AdminNavLink[] = [
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];
