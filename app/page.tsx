import type { Metadata } from "next";
import { MapPin, ReceiptText, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/shared/site-footer";
import { ClientHero } from "@/components/landing/client/client-hero";
import { FindDriverSection } from "@/components/landing/client/find-driver-section";
import { UseCasesSection } from "@/components/landing/client/use-cases-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { StepsSection } from "@/components/landing/steps-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WhySection } from "@/components/landing/why-section";

export const metadata: Metadata = {
  title: "Hire verified drivers in Nigeria",
  description:
    "Hire a verified professional driver for a single trip, a recurring schedule, or your whole business. Every Haya Drivers driver passes identity, licence and background checks before they reach you.",
  keywords: [
    "hire a driver",
    "verified drivers",
    "professional drivers Nigeria",
    "corporate drivers",
    "private driver Lagos",
  ],
  openGraph: {
    title: "Haya Drivers - Drivers, verified before they reach you",
    description:
      "Hire a verified professional driver for a single trip, a recurring schedule, or your whole business - without agencies or guesswork.",
    type: "website",
    siteName: "Haya Drivers",
    url: "/",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haya Drivers - Drivers, verified before they reach you",
    description:
      "Hire a verified professional driver without agencies or guesswork.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <ClientHero />

        <FindDriverSection />

        <WhySection
          chip="Why clients choose Haya Drivers"
          heading="Peace of mind on every trip"
          features={[
            {
              icon: ShieldCheck,
              title: "Verified professionals",
              body: "Every driver passes identity, licence, insurance, and background checks.",
            },
            {
              icon: ReceiptText,
              title: "Transparent pricing",
              body: "Know the cost upfront-no hidden fees, ever.",
            },
            {
              icon: MapPin,
              title: "Real-time updates",
              body: "Track progress and get arrival notifications from request to drop-off.",
            },
          ]}
          ctaLabel="Sign up"
          ctaHref="/auth/signup"
          screenshot="/landing/client-dash.png"
          screenshotAlt="The Haya Drivers client dashboard"
        />

        <StepsSection
          heading="From request to arrival in three steps"
          steps={[
            {
              title: "Sign up",
              body: "Create your account in minutes and tell us who you are, where you go, and what you need.",
            },
            {
              title: "Find a driver",
              body: "Browse verified professionals matched to your route, schedule, and preferences.",
            },
            {
              title: "Make payment",
              body: "Pay our service fee by bank transfer, then pay your driver directly-no hidden fees, ever.",
            },
          ]}
        />

        <UseCasesSection />

        <TestimonialsSection
          heading="What clients say about us"
          items={[
            {
              quote:
                "The driver arrived vetted, punctual, and professional. I stopped worrying about school runs entirely.",
              name: "Sarah Tarleton",
              place: "Lagos, Nigeria",
              avatar: "/landing/avatar-emmanuel.png",
            },
            {
              quote:
                "When a schedule changed mid-job, support sorted it out in minutes.",
              name: "Chuka Obi",
              place: "Abuja, Nigeria",
              avatar: "/landing/avatar-mike.png",
            },
            {
              quote:
                "We staff three routes with Haya Drivers drivers now. Same faces, every week, zero agency overhead.",
              name: "Adaeze Nwosu",
              place: "Port Harcourt, Nigeria",
              avatar: "/landing/avatar-emmanuel.png",
            },
          ]}
        />

        <FaqSection
          heading="Client questions, answered"
          items={[
            {
              question: "How do I book a driver?",
              answer:
                "Create an account, tell us where you're going and when, and browse verified drivers matched to your route and budget. Send a request and the driver confirms-usually within a day.",
            },
            {
              question: "What does it cost?",
              answer:
                "Each driver sets a clear monthly rate you see before you request them. You pay the driver's salary directly to them, and our service fee and VAT by bank transfer on an itemised invoice-no hidden charges.",
            },
            {
              question: "Can I book recurring trips?",
              answer:
                "Yes. Hire for a single trip, a weekly schedule, or a full-time monthly engagement-the same vetted driver handles your route every time.",
            },
            {
              question: "What if my plans change?",
              answer:
                "You can update or cancel a request from your dashboard. For active engagements, our support team helps you adjust schedules or find a replacement driver quickly.",
            },
            {
              question: "What support do I get on a job?",
              answer:
                "Live chat with our support team from your dashboard, plus real-time updates from request to arrival. If anything goes wrong mid-job, we step in immediately.",
            },
          ]}
        />

        <CtaSection
          title={
            <>
              Book a verified
              <br />
              driver today
            </>
          }
          body="Tell Haya Drivers what you need and get matched with a verified professional-usually within a day."
          ctaLabel="Start hiring"
          ctaHref="/auth/signup"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
