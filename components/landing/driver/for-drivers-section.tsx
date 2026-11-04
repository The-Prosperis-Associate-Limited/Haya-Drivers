import { ArrowRight, Award, BadgeCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { SectionChip } from "../section-chip";

const BULLETS = [
  "Say yes only to jobs that suit you",
  "See job details before you reply",
  "Get support throughout each job",
];

export const ForDriversSection = function () {
  return (
    <section className="bg-slate-50 px-4 py-12 md:py-16">
      <div className="border-border mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 rounded-3xl border bg-white p-6 md:p-12 lg:grid-cols-2">
        <Reveal>
          <SectionChip>For Drivers</SectionChip>

          <h2 className="text-ink mt-6 text-3xl font-bold md:text-4xl">
            Get steady, fair work
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed md:text-base">
            Build your reputation, choose suitable jobs, and earn through a
            network that values professionals.
          </p>

          <ul className="text-ink mt-6 list-disc space-y-3 pl-5 text-sm md:text-base">
            {BULLETS.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <Link
            href="/driver/auth/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#12309f] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0e2782]"
          >
            Sign up
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto w-full max-w-sm py-8">
          <div className="border-border absolute -top-2 -left-4 z-10 rounded-2xl border bg-white px-4 py-2.5 shadow-lg md:-left-10">
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

          <div className="border-border rounded-3xl border bg-white p-8 text-center shadow-sm">
            <div className="relative mx-auto w-fit">
              <Image
                src="/landing/driver-photo.png"
                alt="Verified Haya Drivers driver"
                width={144}
                height={144}
                className="h-36 w-36 rounded-full object-cover"
              />
              <BadgeCheck className="fill-brand absolute right-1 bottom-3 h-7 w-7 text-white" />
            </div>
            <p className="text-ink mt-4 text-lg font-semibold">
              Emmanuel Adewale
            </p>
            <p className="text-muted-foreground text-sm">Corporate Driver</p>
          </div>

          <div className="border-border absolute -right-2 -bottom-4 z-10 rounded-2xl border bg-white p-3 shadow-lg md:-right-8">
            <span className="text-ink flex items-center gap-2 text-xs font-semibold">
              <Award className="h-4 w-4 text-amber-500" />
              Badges earned
            </span>
            <span className="mt-2 flex gap-2">
              {["Basic Defensive", "Basic Maintenance"].map((badge) => (
                <span
                  key={badge}
                  className="text-muted-foreground rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium"
                >
                  {badge}
                </span>
              ))}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
