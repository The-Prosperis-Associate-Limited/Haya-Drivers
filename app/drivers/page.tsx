import type { Metadata } from "next";
import { CalendarCheck, ShieldCheck, Wallet } from "lucide-react";
import { SiteFooter } from "@/components/shared/site-footer";
import { CtaSection } from "@/components/landing/cta-section";
import { DriverHero } from "@/components/landing/driver/driver-hero";
import { ForDriversSection } from "@/components/landing/driver/for-drivers-section";
import { JobTypesSection } from "@/components/landing/driver/job-types-section";
import { FaqSection } from "@/components/landing/faq-section";
import { StepsSection } from "@/components/landing/steps-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { WhySection } from "@/components/landing/why-section";

export const metadata: Metadata = {
  title: "Drive with us - steady, fairly-paid work",
  description:
    "Join a network that values professional drivers: set your own monthly rate and working hours, and say yes only to the jobs that suit you. Contract, private, corporate, executive and expatriate engagements.",
  keywords: [
    "driver jobs Nigeria",
    "professional driver work",
    "corporate driver jobs",
    "driving jobs Lagos",
    "become a driver",
  ],
  openGraph: {
    title: "Drive on your terms. Earn what you're worth - Haya Drivers",
    description:
      "Set your rate, get verified, and say yes only to the driving jobs that suit you.",
    type: "website",
    siteName: "Haya Drivers",
    url: "/drivers",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drive on your terms. Earn what you're worth - Haya Drivers",
    description:
      "Set your rate and say yes only to the driving jobs that suit you.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/drivers",
  },
};

export default function DriversLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <DriverHero />

        <ForDriversSection />

        <WhySection
          chip="Why drive with Haya Drivers"
          heading="Work that respects your profession"
          features={[
            {
              icon: Wallet,
              title: "Your rate, your salary",
              body: "Set your monthly rate. Clients pay your salary directly, and we take nothing from it.",
            },
            {
              icon: CalendarCheck,
              title: "Your schedule",
              body: "Set your working hours, and say yes only to the jobs that suit you.",
            },
            {
              icon: ShieldCheck,
              title: "Serious clients",
              body: "A job only starts once the client has paid our service fee.",
            },
          ]}
          ctaLabel="Sign up"
          ctaHref="/driver/auth/signup"
          screenshot="/landing/driver-dash.png"
          screenshotAlt="The Haya Drivers driver dashboard"
        />

        <StepsSection
          heading="From application to first job in three steps"
          steps={[
            {
              title: "Apply and get verified",
              body: "Share your details and complete our identity, licence and guarantor checks.",
            },
            {
              title: "Get shortlisted",
              body: "We invite you to jobs that fit. See the schedule, hours and location before you reply.",
            },
            {
              title: "Drive and get paid",
              body: "Check in each day with full support, and your client pays your salary directly to your bank.",
            },
          ]}
        />

        <JobTypesSection />

        <TestimonialsSection
          heading="What drivers say about us"
          items={[
            {
              quote:
                "I see the pay and route before I accept. That kind of clarity is rare in this work.",
              name: "Musa Ibrahim",
              place: "Lagos, Nigeria",
              avatar: "/landing/avatar-mike.png",
            },
            {
              quote:
                "When a schedule changed mid-job, support sorted it out in minutes.",
              name: "Emmanuel Adewale",
              place: "Abuja, Nigeria",
              avatar: "/landing/avatar-emmanuel.png",
            },
            {
              quote:
                "My trust score does the marketing for me - clients come to me now, not the other way round.",
              name: "David Okon",
              place: "Ibadan, Nigeria",
              avatar: "/landing/avatar-mike.png",
            },
          ]}
        />

        <FaqSection
          heading="Driver questions, answered"
          items={[
            {
              question: "How do I join the network?",
              answer:
                "Create a free account, complete the onboarding steps - personal details, experience, guarantors and documents - then submit for verification. Once your identity, licence and guarantor checks clear, your profile goes live to clients.",
            },
            {
              question: "How do I get paid?",
              answer:
                "Your client pays your salary directly into your own bank account, at the rate agreed for the engagement. Haya Drivers never holds it or takes a cut. Referral rewards go to your wallet, and you can withdraw them in multiples of ₦10,000.",
            },
            {
              question: "Can I choose my own schedule?",
              answer:
                "Yes. You set your working hours, and you can turn off open to work whenever you're not taking new jobs. When you're shortlisted, you have 24 hours to say if you're available. Saying no doesn't affect your trust score.",
            },
            {
              question: "What kinds of jobs are available?",
              answer:
                "Contract, private, corporate, executive, spy and expatriate engagements - from short contracts to full-time monthly placements.",
            },
            {
              question: "What support do I get on a job?",
              answer:
                "Our support team is available throughout every engagement via live chat. If a schedule changes or an issue comes up mid-job, we step in and sort it out with the client.",
            },
          ]}
        />

        <CtaSection
          title={
            <>
              Ready to drive
              <br />
              with us?
            </>
          }
          body="Apply today and join a network built to connect your skills with dependable, fairly-paid opportunities."
          ctaLabel="Join as a driver"
          ctaHref="/driver/auth/signup"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
