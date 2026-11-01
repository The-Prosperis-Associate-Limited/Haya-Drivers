"use client";

import { Briefcase, CalendarClock, User } from "lucide-react";
import { motion } from "motion/react";
import { SectionChip } from "../section-chip";
import { blueGrid } from "../cta-section";
import { usePinnedSteps } from "../use-pinned-steps";

const USE_CASES = [
  {
    icon: User,
    title: "Personal Transport",
    body: "Airport runs, family trips, events, and daily errands with a driver you can trust.",
  },
  {
    icon: Briefcase,
    title: "Business Travel",
    body: "Reliable transport for executives, teams, and visiting partners-on schedule, every time.",
  },
  {
    icon: CalendarClock,
    title: "Recurring Routes",
    body: "School runs, staff shuttles, and scheduled deliveries handled by the same vetted professionals.",
  },
];

const SectionHeader = function () {
  return (
    <>
      <SectionChip variant="dark">Use Cases</SectionChip>

      <h2 className="mt-6 max-w-md text-3xl font-bold text-white md:text-4xl">
        However you move, we have drivers for you
      </h2>
    </>
  );
};

const UseCaseContent = function ({
  useCase,
}: {
  useCase: (typeof USE_CASES)[number];
}) {
  const Icon = useCase.icon;
  return (
    <>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <Icon className="h-6 w-6 text-[#12309f]" />
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-wide text-white uppercase">
        {useCase.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-blue-100">
        {useCase.body}
      </p>
    </>
  );
};

const PinnedUseCases = function () {
  const { trackRef, revealed } = usePinnedSteps(USE_CASES.length);

  return (
    <div ref={trackRef} className="relative hidden h-[200vh] md:block">
      <section className="sticky top-0 flex h-screen flex-col justify-center bg-slate-50 px-4">
        <div
          className={`mx-auto w-full max-w-6xl rounded-3xl bg-[#0d2fa5] p-6 md:p-12 ${blueGrid}`}
        >
          <SectionHeader />

          <div className="mt-10 grid grid-cols-3 gap-10 pb-4">
            {USE_CASES.map((useCase, index) => (
              // The mockup staggers each item a step lower than the last.
              <div
                key={useCase.title}
                className="max-w-xs"
                style={{ marginTop: `calc(${index} * clamp(0px, 4vw, 56px))` }}
              >
                <motion.div
                  initial={false}
                  animate={{
                    opacity: index < revealed ? 1 : 0,
                    y: index < revealed ? 0 : 48,
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <UseCaseContent useCase={useCase} />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const StaticUseCases = function () {
  return (
    <section className="bg-slate-50 px-4 py-12 md:hidden">
      <div
        className={`mx-auto max-w-6xl rounded-3xl bg-[#0d2fa5] p-6 ${blueGrid}`}
      >
        <SectionHeader />

        <div className="mt-10 grid grid-cols-1 gap-10 pb-4">
          {USE_CASES.map((useCase) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-xs"
            >
              <UseCaseContent useCase={useCase} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const UseCasesSection = function () {
  return (
    <>
      <PinnedUseCases />
      <StaticUseCases />
    </>
  );
};
