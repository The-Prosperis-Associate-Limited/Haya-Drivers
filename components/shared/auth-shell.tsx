"use client";

import { ArrowLeft, BadgeCheck, Banknote, Network, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TegatLogo } from "@/components/svg/logo";
import { cn } from "@/lib/utils";
import { AppText } from "./app-text";
import { Reveal } from "./reveal";

export type AuthSurface = "client" | "driver" | "admin";

interface Props {
  children: React.ReactNode;
  surface?: AuthSurface;
  backHref?: string;
}

const PANEL: Record<
  AuthSurface,
  { eyebrow: string; title: string; body: string; home: string }
> = {
  client: {
    eyebrow: "For families and businesses",
    title: "Hire vetted drivers you can trust.",
    body: "Every driver is identity-checked, licence-verified and backed by a guarantor before you ever see their profile.",
    home: "/",
  },
  driver: {
    eyebrow: "For drivers",
    title: "Drive for families and businesses who value you.",
    body: "Get verified once and get hired for personal, corporate and contract driving jobs near you.",
    home: "/drivers",
  },
  admin: {
    eyebrow: "Admin console",
    title: "Keep every hire on the road.",
    body: "Verify drivers, settle payouts and review referrals from one place. Admin accounts are created by a super admin.",
    home: "/admin/auth/signin",
  },
};

const ADMIN_TILES = [
  { icon: ShieldCheck, label: "Verify drivers", sub: "Documents, guarantors, licences" },
  { icon: Banknote, label: "Settle payouts", sub: "Withdrawals and salaries" },
  { icon: Network, label: "Review referrals", sub: "Who brought whom, and why" },
];

const PanelArt = function ({ surface }: { surface: AuthSurface }) {
  if (surface === "admin") {
    return (
      <div className="mx-auto mt-12 grid w-full max-w-sm gap-3">
        {ADMIN_TILES.map(({ icon: Icon, label, sub }, index) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm",
              index === 1 && "translate-x-6",
            )}
          >
            <span className="text-brand grid size-10 shrink-0 place-items-center rounded-xl bg-white">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-xs text-white/70">{sub}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 grid aspect-square w-full max-w-[300px] place-items-center rounded-full bg-white shadow-[0_0_0_14px_rgba(255,255,255,0.12)]">
      <Image
        src={surface === "driver" ? "/driver-auth.svg" : "/driver-hero.svg"}
        alt=""
        width={260}
        height={260}
        priority
        className="h-auto w-[80%]"
      />
    </div>
  );
};

export const AuthShell = function ({ children, surface = "client", backHref }: Props) {
  const router = useRouter();
  const panel = PANEL[surface];

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <aside className="from-brand relative isolate hidden overflow-hidden bg-linear-to-br via-[#1f56d9] to-[#1a46b3] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_140%_at_100%_0%,#5b8cff_0%,transparent_55%)]" />
        <Image
          src="/cloud-top-right.svg"
          alt=""
          width={340}
          height={160}
          className="pointer-events-none absolute -top-2 -right-16 -z-10 w-[340px] opacity-30"
        />
        <Image
          src="/cloud-bottom-left.svg"
          alt=""
          width={300}
          height={160}
          className="pointer-events-none absolute -bottom-5 -left-10 -z-10 w-[300px] opacity-25"
        />

        <Link href={panel.home} className="flex w-fit items-center gap-2.5 font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white">
            <TegatLogo size={28} />
          </span>
          Haya Drivers
        </Link>

        <div className="my-auto py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <BadgeCheck className="size-3.5" />
            {panel.eyebrow}
          </span>
          <h2 className="mt-4 max-w-md text-[32px] leading-[1.15] font-semibold tracking-tight xl:text-[36px]">
            {panel.title}
          </h2>
          <p className="mt-3 max-w-md text-[15px] text-white/80">{panel.body}</p>
          <PanelArt surface={surface} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-5 md:px-10">
          <button
            type="button"
            onClick={() => (backHref ? router.push(backHref) : router.back())}
            className="text-muted-foreground hover:text-brand flex w-fit cursor-pointer items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Link href={panel.home} className="flex items-center gap-2 font-semibold lg:hidden">
            <TegatLogo size={28} />
            Haya Drivers
          </Link>
        </div>

        <main className="flex flex-1 items-center px-5 pb-12 md:px-10">
          <Reveal y={16} className="mx-auto w-full max-w-md">
            {children}
          </Reveal>
        </main>
      </div>
    </div>
  );
};

interface HeadingProps {
  title: string;
  subtitle?: React.ReactNode;
}

export const AuthHeading = function ({ title, subtitle }: HeadingProps) {
  return (
    <div className="mb-7 space-y-1.5">
      <AppText type="h2" className="text-[26px] font-bold">
        {title}
      </AppText>
      {subtitle && (
        <AppText type="subtitle" className="text-muted-foreground text-sm">
          {subtitle}
        </AppText>
      )}
    </div>
  );
};
