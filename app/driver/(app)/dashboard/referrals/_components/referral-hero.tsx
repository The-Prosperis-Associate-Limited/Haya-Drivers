"use client";

import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/show-toast";
import { formatMoney } from "@/lib/utils";
import type { ReferralOverview } from "@/types/referral";
import { Copy, Gift, Link2, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";

interface Props {
  overview: ReferralOverview;
}

const copy = async function (text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("success", `${label} copied`);
  } catch {
    showToast("error", "Couldn't copy - long-press to copy it instead");
  }
};

export const ReferralHero = function ({ overview }: Props) {
  const reward = formatMoney(overview.reward_minor, overview.currency);
  const message = `I drive with Haya Drivers - clients find and hire verified drivers there. Sign up with my code ${overview.code}: ${overview.link}`;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join Haya Drivers", text: message, url: overview.link });
      } catch {}
      return;
    }
    copy(message, "Invite message");
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%),linear-gradient(135deg,#2f6bf6_0%,#1f56d9_60%,#1a46b3_100%)] p-5 text-white sm:p-7 xl:p-8">
      <Image
        src="/cloud-top-right.svg"
        alt=""
        width={283}
        height={103}
        className="pointer-events-none absolute -top-2 -right-16 -z-10 w-[300px] opacity-35"
      />

      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
        <Gift className="size-4" />
        Referral programme
      </span>
      <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight sm:text-[28px]">
        Earn {reward} for every driver you bring
      </h2>
      <p className="mt-1.5 max-w-xl text-sm text-white/80">
        Share your code. When a driver signs up with it and submits their
        documents for verification, {reward} lands in your wallet.
      </p>

      <div className="mt-5 flex max-w-md items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-white/50 bg-white/10 py-2 pr-2 pl-4">
        <div className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium tracking-wide text-white/70">
            YOUR REFERRAL CODE
          </span>
          <span className="block truncate text-[22px] font-bold tracking-[0.12em]">
            {overview.code}
          </span>
        </div>
        <Button
          onClick={() => copy(overview.code, "Code")}
          className="text-brand h-9 shrink-0 rounded-lg bg-white px-3 text-xs hover:bg-white/90"
        >
          <Copy className="size-4" />
          Copy code
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild className="text-brand h-10 rounded-xl bg-white px-4 hover:bg-white/90">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" />
            Share on WhatsApp
          </a>
        </Button>
        <Button
          variant="outline"
          onClick={() => copy(overview.link, "Invite link")}
          className="h-10 rounded-xl border-white/35 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white"
        >
          <Link2 className="size-4" />
          Copy invite link
        </Button>
        <Button
          variant="outline"
          onClick={share}
          className="h-10 rounded-xl border-white/35 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white"
        >
          <Share2 className="size-4" />
          More
        </Button>
      </div>
    </div>
  );
};
