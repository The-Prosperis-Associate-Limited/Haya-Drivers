import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SearchPanel } from "@/components/drivers/search-panel";
import { Reveal } from "@/components/shared/reveal";
import { SectionChip } from "../section-chip";
import { blueGrid } from "../cta-section";

const BULLETS = [
  "Browse verified profiles and experience",
  "Book one-off or recurring transport",
  "Get clear updates from request to arrival",
];

export const FindDriverSection = function () {
  return (
    <section className="bg-slate-50 px-4 py-12 md:py-16">
      <div
        className={`mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 rounded-3xl bg-[#0d2fa5] p-6 md:p-12 lg:grid-cols-2 ${blueGrid}`}
      >
        <Reveal>
          <SectionChip variant="dark">For Clients</SectionChip>

          <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
            Find the right driver
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-blue-100 md:text-base">
            Haya Drivers vets every candidate against national identity, licence
            and police records, then scores them on reliability so you decide
            with confidence.
          </p>

          <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-blue-100 md:text-base">
            {BULLETS.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          <Link
            href="/auth/signup"
            className="text-ink mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-blue-50"
          >
            Start hiring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <SearchPanel className="sm:grid-cols-1 lg:grid-cols-1" />
      </div>
    </section>
  );
};
