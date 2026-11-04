import { BadgeCheck, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { LandingNav } from "../landing-nav";
import { blueGrid } from "../cta-section";

const RatingChip = function ({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-2xl bg-white px-4 py-2.5 shadow-lg ${className}`}
    >
      <span className="text-muted-foreground block text-xs">
        Average rating
      </span>
      <span className="flex items-center gap-2">
        <span className="text-ink text-sm font-bold">4.8</span>
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
            />
          ))}
        </span>
      </span>
    </div>
  );
};

export const ClientHero = function () {
  return (
    <header className={`bg-[#0d2fa5] px-4 pt-5 pb-20 md:pb-28 ${blueGrid}`}>
      <LandingNav ctaHref="/auth/signup" />

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 items-center gap-14 md:mt-20 lg:grid-cols-2">
        <Reveal y={20}>
          <h1 className="text-4xl leading-tight font-bold text-white md:text-6xl">
            Drivers, verified before they reach you
          </h1>
          <p className="mt-5 max-w-lg text-base text-blue-100 md:text-lg">
            Hire a verified professional driver on a short contract, full time,
            or for your whole business, without agencies or guesswork.
          </p>

          <Link
            href="/auth/signup"
            className="text-ink mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-blue-50"
          >
            Hire a driver
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-md">
          <RatingChip className="-top-6 left-0 z-10" />

          <div className="rounded-3xl bg-white p-8 pt-12 text-center shadow-xl">
            <div className="relative mx-auto w-fit">
              <Image
                src="/landing/driver-photo.png"
                alt="Verified Haya Drivers driver"
                width={160}
                height={160}
                className="h-40 w-40 rounded-full object-cover"
              />
              <BadgeCheck className="fill-brand absolute right-2 bottom-4 h-8 w-8 text-white" />
            </div>
            <p className="text-ink mt-5 text-xl font-semibold">
              Emmanuel Adewale
            </p>
            <p className="text-muted-foreground mt-1">Corporate Driver</p>
          </div>

          <RatingChip className="-right-2 -bottom-6 z-10 md:-right-8" />
        </Reveal>
      </div>
    </header>
  );
};
