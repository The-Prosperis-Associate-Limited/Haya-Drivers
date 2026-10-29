import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  MessagesSquare,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { AdminOverview } from "@/types/admin";

interface Props {
  tiles?: AdminOverview["tiles"];
}

const TONES = {
  brand: "bg-brand-soft text-brand",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-600",
  green: "bg-emerald-50 text-emerald-600",
};

const TILES: {
  key: keyof AdminOverview["tiles"];
  icon: LucideIcon;
  tone: keyof typeof TONES;
  text: string;
  link: string;
  href: string;
}[] = [
  {
    key: "pending_verifications",
    icon: ShieldCheck,
    tone: "brand",
    text: "Driver verifications waiting for review",
    link: "Review queue",
    href: "/admin/dashboard/drivers#verification",
  },
  {
    key: "payment_reviews",
    icon: ReceiptText,
    tone: "amber",
    text: "Payment proofs to confirm or reject",
    link: "Check payments",
    href: "/admin/dashboard/hires",
  },
  {
    key: "ready_to_invoice",
    icon: UsersRound,
    tone: "violet",
    text: "Shortlists ready to trim and invoice",
    link: "Open hires",
    href: "/admin/dashboard/hires",
  },
  {
    key: "chats_waiting",
    icon: MessagesSquare,
    tone: "green",
    text: "Live chats waiting for an agent",
    link: "Go to inbox",
    href: "/admin/dashboard/support",
  },
];

export const ActionTiles = function ({ tiles }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
      {TILES.map((tile) => {
        const value = tiles?.[tile.key];

        return (
          <Link
            key={tile.key}
            href={tile.href}
            className={cn(
              "group border-border hover:border-brand/40 flex flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors md:p-5",
              value === 0 && "opacity-75",
            )}
          >
            <span
              className={cn(
                "grid size-10 place-items-center rounded-xl",
                TONES[tile.tone],
              )}
            >
              <tile.icon className="size-5" />
            </span>
            {value === undefined ? (
              <Skeleton className="mt-3 h-8 w-12" />
            ) : (
              <AppText
                type="h2"
                as="p"
                className="mt-3 text-[28px] leading-none font-semibold tracking-tight"
              >
                {value}
              </AppText>
            )}
            <AppText
              type="caption"
              className="text-muted-foreground mt-2 block flex-1 text-[13px]"
            >
              {tile.text}
            </AppText>
            <span className="text-brand mt-3 inline-flex items-center gap-0.5 text-[13px] font-semibold">
              {tile.link}
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
};
