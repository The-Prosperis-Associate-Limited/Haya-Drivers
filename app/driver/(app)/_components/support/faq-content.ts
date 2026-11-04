import { Bus, Clock, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";

interface FaqSection {
  title: string;
  icon: LucideIcon;
  questions: { question: string; answer: string }[];
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Verification & onboarding",
    icon: ShieldCheck,
    questions: [
      {
        question: "Why is my profile still private?",
        answer:
          "Your profile stays private and unsearchable until identity, licence and criminal-record checks are complete. Once every check passes you become visible to clients in your state.",
      },
      {
        question: "My proof of address was rejected",
        answer:
          "Open the verification centre from your dashboard. The reviewer's reason is shown against each document - fix only those and resubmit. The rest of your application stands, you do not start again.",
      },
      {
        question: "How long does verification take?",
        answer:
          "Usually 24 to 48 hours. We email you as soon as a decision is made, and the dashboard updates at the same time.",
      },
    ],
  },
  {
    title: "Jobs & bookings",
    icon: Bus,
    questions: [
      {
        question: "How do I get my first job?",
        answer:
          "Finish verification and keep your profile complete. Clients search verified drivers by trust score, so cleared checks, completed bookings and good reviews are what put you in front of them.",
      },
      {
        question: "A client cancelled my booking",
        answer:
          "A cancellation by the client does not count against your reliability. If you were already on the way, report it here and support will look at the trip.",
      },
    ],
  },
  {
    title: "Payments & payouts",
    icon: Wallet,
    questions: [
      {
        question: "When do I get paid?",
        answer:
          "Your salary is paid to you directly by the client - it never passes through Haya Drivers and nothing is deducted from it. Agree the schedule with your client when the engagement starts.",
      },
      {
        question: "When can I withdraw from my wallet?",
        answer:
          "Once your balance reaches ₦10,000, and always in multiples of ₦10,000. With ₦15,000 you can withdraw ₦10,000, and the ₦5,000 left waits until it grows by another ₦5,000. Our team sends the transfer and we notify you when it has gone.",
      },
      {
        question: "How do I change my payout account?",
        answer:
          "Open Wallet, then Payout account. Remove the old account and add the new one - we transfer to exactly what you enter, so check the bank, number and name.",
      },
    ],
  },
  {
    title: "Trust score & ratings",
    icon: Clock,
    questions: [
      {
        question: "How is my trust score calculated?",
        answer:
          "Three things: clearing verification, completing bookings, and your average client rating. Open Trust score from your dashboard to see exactly what each one is worth right now.",
      },
    ],
  },
];
