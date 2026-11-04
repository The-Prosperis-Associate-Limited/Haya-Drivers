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
    "Hire a verified professional driver on a short contract, full time, or for your whole business. Every Haya Drivers driver passes identity, licence and guarantor checks before they reach you.",
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
      "Hire a verified professional driver on a short contract, full time, or for your whole business - without agencies or guesswork.",
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
              body: "Every driver passes identity, licence and guarantor checks.",
            },
            {
              icon: ReceiptText,
              title: "Transparent pricing",
              body: "Know the cost upfront-no hidden fees, ever.",
            },
            {
              icon: MapPin,
              title: "Daily check-ins",
              body: "Follow your request through to hire, then see when your driver checks in each day.",
            },
          ]}
          ctaLabel="Sign up"
          ctaHref="/auth/signup"
          screenshot="/landing/client-dash.png"
          screenshotAlt="The Haya Drivers client dashboard"
        />

        <StepsSection
          heading="From sign-up to hire in three steps"
          steps={[
            {
              title: "Sign up",
              body: "Create your account in minutes and tell us who you are, where you need a driver, and your budget.",
            },
            {
              title: "Find a driver",
              body: "Browse verified professionals, or tell us what you need and we'll shortlist drivers for you.",
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
              question: "How do I hire a driver?",
              answer:
                "Create an account, then request a verified driver you've found or tell us what you need. Our team shortlists drivers and confirms they're available. You then pay our invoice, and the hire begins.",
            },
            {
              question: "What does it cost?",
              answer:
                "Each driver sets a clear monthly rate you see before you request them. You pay the driver's salary directly to them, and our service fee and VAT by bank transfer on an itemised invoice-no hidden charges.",
            },
            {
              question: "Can I hire for a short period?",
              answer:
                "Yes. Hire on a contract for a set number of days, or full time on a monthly engagement-the same vetted driver works with you throughout.",
            },
            {
              question: "What if my plans change?",
              answer:
                "You can cancel a request from your dashboard until you've submitted proof of payment. Once a hire is active, talk to our support team about any changes.",
            },
            {
              question: "What support do I get on a job?",
              answer:
                "Live chat with our support team from your dashboard. If your driver misses a check-in or something goes wrong, you can flag it and our team will step in.",
            },
          ]}
        />

        <CtaSection
          title={
            <>
              Hire a verified
              <br />
              driver today
            </>
          }
          body="Tell Haya Drivers what you need and we'll shortlist verified professionals for you."
          ctaLabel="Start hiring"
          ctaHref="/auth/signup"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
