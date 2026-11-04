import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TegatLogo } from "@/components/svg/logo";

const PLATFORM_LINKS = [
  { label: "Candidate directory", href: "/marketplace" },
  { label: "Search candidates", href: "/marketplace" },
  { label: "Drive with us", href: "/drivers" },
  { label: "Register as a client", href: "/auth/signup" },
];

export const SiteFooter = function () {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-3 md:px-8 md:py-16">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <TegatLogo size={28} />
            <span className="font-serif text-xl">Haya Drivers</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Vetted drivers and professional staff, verified through NIMC, FRSC
            and guarantor checks - so you hire on trust, not guesswork.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase">
            Platform
          </p>
          <ul className="mt-4 space-y-3">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase">
            Newsletter
          </p>
          <p className="mt-4 text-sm text-white/70">
            Role announcements and hiring tips. No account needed.
          </p>
          {/* Deliberately unwired - the server has no newsletter endpoint yet. */}
          <div className="mt-4 flex">
            <input
              type="email"
              placeholder="you@company.com"
              className="focus:border-brand w-full rounded-l-md border border-white/20 bg-white/95 px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Subscribe"
              className="bg-brand hover:bg-brand-hover rounded-r-md px-4 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/60 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 Haya Drivers. All rights reserved.</p>
          <span className="flex items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy policy
            </Link>
          </span>
          <p className="tracking-[0.2em] uppercase">
            Verified hiring for Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
};
