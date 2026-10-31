import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  greeting: string;
  headline: string;
  activeDrivers?: number;
  onDuty?: number;
}

export const ClientHero = function ({
  greeting,
  headline,
  activeDrivers,
  onDuty,
}: Props) {
  return (
    <div className="relative isolate flex items-center gap-6 overflow-hidden rounded-[20px] bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%),linear-gradient(135deg,#2f6bf6_0%,#1f56d9_60%,#1a46b3_100%)] p-5 text-white sm:p-7 xl:p-8">
      <Image
        src="/cloud-top-right.svg"
        alt=""
        width={283}
        height={103}
        className="pointer-events-none absolute -top-2 -right-16 -z-10 w-[300px] opacity-35"
      />
      <Image
        src="/cloud-bottom-left.svg"
        alt=""
        width={145}
        height={88}
        className="pointer-events-none absolute -bottom-6 left-[30%] -z-10 w-[240px] opacity-20"
      />

      <div className="min-w-0 flex-1">
        {!!activeDrivers && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]" />
            {onDuty
              ? `${onDuty} driver${onDuty > 1 ? "s" : ""} on duty right now`
              : `${activeDrivers} driver${activeDrivers > 1 ? "s" : ""} on your team`}
          </span>
        )}

        <AppText
          type="h2"
          className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-white sm:text-[28px] xl:text-[30px]"
        >
          {greeting}
        </AppText>
        <AppText
          type="subtitle"
          className="mt-1.5 max-w-xl text-sm text-white/80"
        >
          {headline}
        </AppText>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button
            asChild
            variant="ghost"
            className="text-brand h-10 rounded-xl bg-white px-4 hover:bg-white/90"
          >
            <Link href="/dashboard/my-hire/request">
              <Plus className="size-4" />
              Request a driver
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-xl border border-white/35 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/dashboard/requests/find-talent">
              <Search className="size-4" />
              Browse drivers
            </Link>
          </Button>
        </div>
      </div>

      <div className="hidden size-[200px] shrink-0 place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,0.12)] xl:grid">
        <Image
          src="/driver-hero.svg"
          alt=""
          width={164}
          height={164}
          className="h-auto w-[82%]"
        />
      </div>
    </div>
  );
};
