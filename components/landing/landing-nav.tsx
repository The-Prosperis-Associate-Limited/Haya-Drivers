"use client";

import { TegatLogo } from "@/components/svg/logo";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { label: "For Clients", href: "/" },
  { label: "For Drivers", href: "/drivers" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQs", href: "#faqs" },
];

interface Props {
  ctaHref: string;
}

export const LandingNav = function ({ ctaHref }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full bg-white px-5 shadow-sm md:px-8">
        <Link href="/" aria-label="Haya Drivers home">
          <TegatLogo size={36} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-ink hover:text-brand text-sm font-medium tracking-wide uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          className="hidden rounded-lg bg-[#12309f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0e2782] md:block"
        >
          Get started
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-ink cursor-pointer md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Full-screen mobile menu, per the phone mockups */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex-col bg-white px-4 pt-5 pb-8 md:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <div className="flex items-center justify-between">
          <TegatLogo size={36} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-ink cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-16 flex flex-col items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink text-base font-medium tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          onClick={() => setOpen(false)}
          className="mt-12 block rounded-xl bg-[#12309f] py-3.5 text-center text-sm font-semibold text-white"
        >
          Get started
        </Link>
      </div>
    </>
  );
};
