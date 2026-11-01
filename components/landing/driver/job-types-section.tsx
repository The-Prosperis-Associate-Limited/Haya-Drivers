"use client";

import {
  Briefcase,
  Crown,
  FileText,
  Globe,
  GraduationCap,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { SectionChip } from "../section-chip";
import { blueGrid } from "../cta-section";
import { usePinnedSteps } from "../use-pinned-steps";

const JOB_TYPES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileText,
    title: "Contract Driver",
    body: "Drive on a fixed-term contract for a company or individual - a defined engagement with a clear start and end date.",
  },
  {
    icon: User,
    title: "Private Driver",
    body: "Drive for an individual or family's daily needs - school runs, errands, and personal appointments.",
  },
  {
    icon: Briefcase,
    title: "Corporate Driver",
    body: "Drive for a company's staff or executives as part of their day-to-day operations, typically on a long-term assignment.",
  },
  {
    icon: Crown,
    title: "Executive Driver",
    body: "Drive senior executives and management, with an emphasis on discretion, punctuality, and a polished, professional manner.",
  },
  {
    icon: Shield,
    title: "Spy Driver",
    body: "A specialized security-focused track for drivers trained in defensive and discreet driving, for clients who need added protection.",
  },
  {
    icon: Globe,
    title: "Expatriate Driver",
    body: "Drive expatriate clients who need someone familiar with the city, comfortable with cross-cultural communication, and reliable with schedules.",
  },
];

const REVEAL_SPAN = 0.85;

const StepItem = function ({
  jobType,
  index,
  active,
}: {
  jobType: (typeof JOB_TYPES)[number];
  index: number;
  active: boolean;
}) {
  const Icon = jobType.icon;

  return (
    // The column stagger mirrors the client landing's stepped use-cases layout.
    <div style={{ marginTop: `calc(${index % 3} * clamp(0px, 2.5vw, 36px))` }}>
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 48 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xs"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <Icon className="h-5 w-5 text-[#12309f]" />
        </span>
        <h3 className="mt-3 text-base font-semibold tracking-wide text-white uppercase">
          {jobType.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-blue-100">
          {jobType.body}
        </p>
      </motion.div>
    </div>
  );
};

const SectionHeader = function ({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <SectionChip variant="dark" icon={GraduationCap}>
        Job Types
      </SectionChip>

      <h2
        className={
          compact
            ? "mt-4 max-w-md text-2xl font-bold text-white xl:text-3xl"
            : "mt-6 max-w-md text-3xl font-bold text-white md:text-4xl"
        }
      >
        Choose work that fits your skillset
      </h2>
    </>
  );
};

const PinnedJobTypes = function () {
  const { trackRef, revealed } = usePinnedSteps(JOB_TYPES.length, REVEAL_SPAN);

  return (
    <div ref={trackRef} className="relative hidden h-[280vh] lg:block">
      <section
        className={`sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-[#0d2fa5] px-4 ${blueGrid}`}
      >
        {/* Short viewports get a visual scale-down instead of clipping the chip/heading. */}
        <div className="mx-auto w-full max-w-6xl [@media(max-height:780px)]:scale-[0.85]">
          <SectionHeader compact />

          <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-6 pb-2">
            {JOB_TYPES.map((jobType, index) => (
              <StepItem
                key={jobType.title}
                jobType={jobType}
                index={index}
                active={index < revealed}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Below lg there is no room to pin - items simply fade in as they enter view.
const StaticJobTypes = function () {
  return (
    <section className={`bg-[#0d2fa5] px-4 py-16 lg:hidden ${blueGrid}`}>
      <div className="mx-auto max-w-6xl">
        <SectionHeader />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
          {JOB_TYPES.map((jobType) => {
            const Icon = jobType.icon;
            return (
              <motion.div
                key={jobType.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-xs"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                  <Icon className="h-6 w-6 text-[#12309f]" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-wide text-white uppercase">
                  {jobType.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">
                  {jobType.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const JobTypesSection = function () {
  return (
    <>
      <PinnedJobTypes />
      <StaticJobTypes />
    </>
  );
};
