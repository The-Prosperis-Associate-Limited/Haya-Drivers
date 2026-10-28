import { QueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Info,
  LucideIcon,
  MessageSquare,
  XCircle,
} from "lucide-react";
import type { DriverVerificationStatus, OnboardingStep } from "@/types/driver";
import type {
  BookingParty,
  BookingStatus,
  EngagementType,
} from "@/types/booking";
import type {
  AssignmentType,
  ClientDriverCategory,
  DriversNeededRange,
  HiringTimeline,
} from "@/types/auth";
import type { HireInvoice } from "@/types/hire";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient();

export const passwordValidationRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+.])[A-Za-z\d@$!%*?&#^()\-_=+.]{8,}$/;

export const ENV = {
  get API_URL() {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  },
} as const;

// Only allow safe, relative, in-app paths - prevents open-redirect via callbackUrl
export const isSafeCallback = function (url: string | null): url is string {
  return !!url && url.startsWith("/") && !url.startsWith("//");
};

// One codebase, three surfaces - everyone lands on their dashboard. The
// onboarding wizards are prompts reached from there, never a gate after auth.
export const handleSigninRedirect = function (role: string) {
  if (role === "DRIVER") return "/driver/dashboard";
  if (role === "CLIENT") return "/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/";
};

/*
================= NOTE: onboarding - the step order the wizard runs in. The
server returns onboarding_step and never moves it backwards, so this is only
used to turn that value into a route.
*/

export const ONBOARDING_STEPS: {
  step: OnboardingStep;
  path: string;
  label: string;
}[] = [
  {
    step: "PERSONAL_INFORMATION",
    path: "/driver/onboarding/personal-information",
    label: "Personal Information",
  },
  {
    step: "EXPERIENCE",
    path: "/driver/onboarding/experience",
    label: "Years of Experience",
  },
  {
    step: "ACADEMIC_QUALIFICATION",
    path: "/driver/onboarding/academic-qualification",
    label: "Academic Qualification",
  },
  {
    step: "WORK_EXPERIENCE",
    path: "/driver/onboarding/work-experience",
    label: "Your Work Experience",
  },
  {
    step: "GUARANTORS",
    path: "/driver/onboarding/guarantors",
    label: "Your Guarantor Information",
  },
  {
    step: "ADDITIONAL_INFORMATION",
    path: "/driver/onboarding/additional-information",
    label: "Additional Information (Optional)",
  },
  {
    step: "DOCUMENTS",
    path: "/driver/onboarding/documents",
    label: "Upload Documents",
  },
  {
    step: "REVIEW",
    path: "/driver/onboarding/review",
    label: "Review before you submit",
  },
];

/*
  One set per step, rotated under the card. They are step-specific on purpose -
  a single global tip ends up wrong on most screens, which is how the wizard
  came to advertise a role question it never asks. Every line here has to be
  true of what the server actually does; nothing invented to fill a slot.
*/
export const ONBOARDING_TIPS: Record<OnboardingStep, string[]> = {
  PERSONAL_INFORMATION: [
    "Each step is saved as you finish it, so you can stop here and pick up where you left off.",
    "Enter your name exactly as it appears on your ID - a reviewer checks it against your documents.",
    "The state you pick is where clients will find you once you're verified.",
  ],
  EXPERIENCE: [
    "Your driver type is one of the filters clients search by.",
    "Add every licence class you hold - each one widens the jobs you match.",
    "Your licence needs at least a year left before it expires.",
  ],
  ACADEMIC_QUALIFICATION: [
    "Nothing on this step blocks your verification. Fill in what you have.",
    "This is context for a reviewer, not a cut-off.",
  ],
  WORK_EXPERIENCE: [
    "Still in a role? Mark it as ongoing instead of setting an end date.",
    "Add as many roles as you like - you can remove any of them later.",
  ],
  GUARANTORS: [
    "Your reference should be a previous employer - someone you have actually driven for.",
    "Your guarantor must be a working professional: a civil servant (grade level 8+) or a business owner. Family and friends are not accepted.",
    "A guarantor needs their own passport photo and NIN slip, so pick someone who can send you both.",
  ],
  ADDITIONAL_INFORMATION: [
    "Every field here is optional - skip it and your submission still goes through.",
    "You can come back and fill this in at any time.",
  ],
  DOCUMENTS: [
    "Three documents are required: your NIN slip, a passport photo and your driver's licence.",
    "Photograph documents flat and in good light - a reviewer has to read every detail.",
    "If one is turned down you'll get the reviewer's reason, and you only replace that one.",
  ],
  REVIEW: [
    "You can edit any section from here - it won't send you back to the start.",
    "Verification takes 24-48 hours once you submit.",
    "Resubmitting sends every document back to the queue, including ones already approved.",
  ],
};

export const getOnboardingPath = function (step: OnboardingStep | undefined) {
  return (
    ONBOARDING_STEPS.find((entry) => entry.step === step)?.path ??
    ONBOARDING_STEPS[0].path
  );
};

export const getOnboardingProgress = function (
  step: OnboardingStep | undefined,
) {
  const index = ONBOARDING_STEPS.findIndex((entry) => entry.step === step);
  if (index < 0) return 0;
  return Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100);
};

/*
================= NOTE: money - the API returns integers in minor units plus a
currency code. Format at the edge, never compute in major units.
*/

export const currencyMapper = {
  NGN: "₦",
  GHS: "₵",
  KES: "KSh",
  ZAR: "R",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AED: "د.إ",
} as const;

export const formatMoney = function (
  minor: number | undefined,
  currency = "NGN",
) {
  const symbol =
    currencyMapper[currency as keyof typeof currencyMapper] ?? `${currency} `;

  const value = minor ?? 0;

  return `${value < 0 ? "-" : ""}${symbol}${(
    Math.abs(value) / 100
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const toMinorUnits = (amount: number) => Math.round(amount * 100);

export const toMajorUnits = (minor: number) => minor / 100;

/*
================= NOTE: verification - three of the four statuses render a
different dashboard, so the copy lives here rather than inside each screen.
*/

export const VERIFICATION_COPY: Record<
  DriverVerificationStatus,
  { label: string; tone: string; headline: string }
> = {
  UNSUBMITTED: {
    label: "Not submitted",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    headline: "Finish your profile to start receiving job requests.",
  },
  PENDING: {
    label: "Under review",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    headline: "Our team is reviewing your documents, this takes 24-48 hours.",
  },
  APPROVED: {
    label: "Verified",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    headline: "You're verified and visible to clients",
  },
  REJECTED: {
    label: "Action needed",
    tone: "bg-red-50 text-red-700 border-red-200",
    headline: "Some documents could not be verified.",
  },
};

/*
================= NOTE: bookings - the status machine lives on the server, this
is only how each status is shown.
*/

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED: "bg-gray-50 text-gray-600 border-gray-200",
  CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
  DISPUTED: "bg-red-50 text-red-700 border-red-200",
};

export const clientNameOf = function (client: BookingParty) {
  return (
    client.client_profile?.organisation_name ||
    [client.first_name, client.last_name].filter(Boolean).join(" ") ||
    "Client"
  );
};

export const ENGAGEMENT_TYPE_LABELS: Record<EngagementType, string> = {
  ONE_OFF: "One-off",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CONTRACT: "Contract",
};

const PAY_PERIOD_LABELS: Record<EngagementType, string> = {
  ONE_OFF: "Per job",
  DAILY: "Per day",
  WEEKLY: "Per week",
  MONTHLY: "Per month",
  CONTRACT: "Per contract",
};

export const formatPay = function (
  minor: number,
  currency: string,
  engagement: EngagementType,
) {
  return `${formatMoney(minor, currency)} / ${PAY_PERIOD_LABELS[engagement]}`;
};

export const INVOICE_STATUS_STYLES: Record<
  HireInvoice["status"],
  { label: string; tone: string }
> = {
  UNPAID: {
    label: "Unpaid",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAYMENT_REVIEW: {
    label: "Under review",
    tone: "border-brand/20 bg-brand-soft text-brand",
  },
  PAID: {
    label: "Paid",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  VOID: { label: "Void", tone: "border-slate-200 bg-slate-50 text-slate-500" },
};

// Pre-fee-only invoices have no breakdown and carried the salaries apart from the fee.
export const invoiceLines = function (
  invoice: Pick<
    HireInvoice,
    "breakdown" | "amount_minor" | "fee_minor" | "vat_percent" | "vat_minor"
  >,
) {
  const lines: { label: string; amount_minor: number }[] = invoice.breakdown
    ?.length
    ? invoice.breakdown.map(({ label, amount_minor }) => ({
        label,
        amount_minor,
      }))
    : invoice.amount_minor !== invoice.fee_minor
      ? [
          { label: "Salaries", amount_minor: invoice.amount_minor },
          { label: "Service fee", amount_minor: invoice.fee_minor },
        ]
      : [{ label: "Service fee", amount_minor: invoice.fee_minor }];

  return [
    ...lines,
    { label: `VAT (${invoice.vat_percent}%)`, amount_minor: invoice.vat_minor },
  ];
};

export const formatPosted = function (date: string | Date) {
  const recency = groupByRecency(date);
  if (recency === "Today" || recency === "Yesterday") return recency;

  const days = Math.round(
    (Date.now() - new Date(date).setHours(0, 0, 0, 0)) / 86400000,
  );

  return days < 7 ? `${days} days ago` : formatDate(date);
};

export const formatWorkingHours = function (
  startsAt: string,
  endsAt?: string | null,
) {
  const start = new Date(startsAt);
  const day = format(start, "EEE");
  const from = format(start, "HH:mm");

  if (!endsAt) return `${day} · from ${from}`;

  const end = new Date(endsAt);
  const spansDays = format(end, "yyyy-MM-dd") !== format(start, "yyyy-MM-dd");

  return spansDays
    ? `${day} ${from} - ${format(end, "EEE HH:mm")}`
    : `${day} · ${from} - ${format(end, "HH:mm")}`;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: "Pending",
  ACCEPTED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

/*
================= NOTE: notifications - icon and colour per server type
*/

export const TYPE_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  INFO: { icon: Info, color: "#2563eb", bg: "#eff6ff" },
  SUCCESS: { icon: CheckCircle2, color: "#059669", bg: "#ecfdf5" },
  WARNING: { icon: AlertTriangle, color: "#d97706", bg: "#fffbeb" },
  ERROR: { icon: XCircle, color: "#dc2626", bg: "#fef2f2" },
  BOOKING_REQUEST: { icon: Briefcase, color: "#2f6bf6", bg: "#eef4ff" },
  BOOKING_STATUS: { icon: Briefcase, color: "#2f6bf6", bg: "#eef4ff" },
  PAYMENT: { icon: Banknote, color: "#059669", bg: "#ecfdf5" },
  PAYOUT: { icon: Banknote, color: "#059669", bg: "#ecfdf5" },
  VERIFICATION: { icon: BadgeCheck, color: "#2f6bf6", bg: "#eef4ff" },
  DOCUMENT_REVIEW: { icon: FileText, color: "#ca8a04", bg: "#fefce8" },
  TRAINING: { icon: GraduationCap, color: "#b45309", bg: "#fffbeb" },
  MESSAGE: { icon: MessageSquare, color: "#2f6bf6", bg: "#eef4ff" },
};

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

// Notifications group under Today / Yesterday / This week / Earlier
export function groupByRecency(date: string | Date) {
  const then = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfThen = new Date(then);
  startOfThen.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (today.getTime() - startOfThen.getTime()) / 86400000,
  );

  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return "This week";
  return "Earlier";
}

export const formatDate = (date: string | Date) =>
  format(new Date(date), "d MMM yyyy");

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "d MMM yyyy 'at' h:mm a");

export const formatTime = (date: string | Date) =>
  format(new Date(date), "h:mm a");

/*
================= NOTE: course video. Modules hold whatever url the course was
authored with. A recognised YouTube url yields an id, which the player hands to
YouTube's IFrame API - that API is the only way to read playback position back
out of an embed. Anything else is a direct file the browser decodes in a <video>.
Both report position the same way, so a module moving from YouTube to Cloudinary
needs no other change. Remove nothing here when the real uploads land.
*/

export const youTubeVideoId = function (url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );

  return match?.[1] ?? null;
};

export const greetingForNow = function () {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const getInitials = function (
  firstName?: string | null,
  lastName?: string | null,
) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
};

/*
================= NOTE: the option lists the onboarding selects render. These
mirror the server enums exactly - a value that is not in the server enum is a
400 the driver cannot fix.
*/

export const DRIVER_TYPE_OPTIONS = [
  { value: "CORPORATE_DRIVER", label: "Corporate Driver" },
  { value: "PRIVATE_DRIVER", label: "Private Driver" },
  { value: "LOGISTICS_DRIVER", label: "Logistics Driver" },
  { value: "RIDE_HAILING_DRIVER", label: "Ride Hailing Driver" },
  { value: "HEAVY_DUTY_DRIVER", label: "Heavy Duty Driver" },
];

// FRSC licence classes under Nigeria's National Road Traffic Regulations
// (there is no class I). Values mirror the server's LicenceClass enum.
export const LICENCE_CLASS_OPTIONS = [
  { value: "A", label: "Class A", description: "Motorcycles and tricycles" },
  { value: "B", label: "Class B", description: "Private cars under 3 tonnes" },
  {
    value: "C",
    label: "Class C",
    description:
      "Commercial light vehicles under 3 tonnes - taxis, small buses",
  },
  {
    value: "D",
    label: "Class D",
    description: "Trucks and lorries above 3 tonnes (non-articulated)",
  },
  { value: "E", label: "Class E", description: "Passenger buses (omnibus)" },
  {
    value: "F",
    label: "Class F",
    description: "Agricultural tractors and farm machinery",
  },
  {
    value: "G",
    label: "Class G",
    description: "Articulated vehicles - trailers and tankers",
  },
  {
    value: "H",
    label: "Class H",
    description: "Earth-moving and construction vehicles",
  },
  {
    value: "J",
    label: "Class J",
    description: "Special vehicles adapted for physically disabled drivers",
  },
];

export const TRANSMISSION_OPTIONS = [
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "MANUAL", label: "Manual" },
  { value: "BOTH", label: "Both - automatic and manual" },
];

export const EXPERIENCE_YEARS_OPTIONS = [
  { value: "0", label: "Less than 1 year" },
  ...Array.from({ length: 29 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? "year" : "years"}`,
  })),
  { value: "30", label: "30+ years" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
];

export const ACADEMIC_LEVEL_OPTIONS = [
  { value: "NONE", label: "No formal education" },
  { value: "PRIMARY", label: "Primary School" },
  { value: "SECONDARY", label: "Secondary School" },
  { value: "OND", label: "OND" },
  { value: "HND", label: "HND" },
  { value: "BSC", label: "Bachelors Degree" },
  { value: "MSC", label: "Masters Degree" },
  { value: "PHD", label: "PhD" },
];

// Family and friends are not acceptable guarantors - the guarantor must be a
// working professional (civil servant grade level 8+, or a business owner).
export const GUARANTOR_RELATIONSHIP_OPTIONS = [
  { value: "FORMER_EMPLOYER", label: "Former Employer" },
  { value: "COLLEAGUE", label: "Colleague" },
  { value: "RELIGIOUS_LEADER", label: "Religious Leader" },
  { value: "COMMUNITY_LEADER", label: "Community Leader" },
  { value: "OTHER", label: "Other" },
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Hausa",
  "Igbo",
  "Yoruba",
  "Pidgin",
  "French",
  "Arabic",
  "Fulfulde",
  "Kanuri",
  "Tiv",
  "Ibibio",
  "Efik",
].map((language) => ({ value: language, label: language }));

export const RELIGION_OPTIONS = [
  { value: "CHRISTIANITY", label: "Christianity" },
  { value: "ISLAM", label: "Islam" },
  { value: "TRADITIONAL", label: "Traditional" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export const ETHNICITY_OPTIONS = [
  "Hausa",
  "Yoruba",
  "Igbo",
  "Fulani",
  "Ijaw",
  "Kanuri",
  "Ibibio",
  "Tiv",
  "Edo",
  "Nupe",
  "Urhobo",
  "Igala",
  "Idoma",
  "Efik",
  "Gbagyi",
  "Itsekiri",
  "Esan",
  "Ebira",
  "Other",
].map((name) => ({ value: name, label: name }));

// Bands, not exact ages - the matcher reads them, nothing filters on them.
export const AGE_RANGE_OPTIONS = [
  { value: "18-25", label: "18 - 25" },
  { value: "26-35", label: "26 - 35" },
  { value: "36-45", label: "36 - 45" },
  { value: "46-60", label: "46 - 60" },
  { value: "60+", label: "60 and above" },
];

// Preference dropdowns rendered for clients - religion stored as the label,
// not the driver-side enum value, so the admin reads it verbatim.
export const RELIGION_PREFERENCE_OPTIONS = [
  { value: "Christianity", label: "Christianity" },
  { value: "Islam", label: "Islam" },
  { value: "Traditional", label: "Traditional" },
  { value: "Other", label: "Other" },
];

export const DOCUMENT_LABELS: Record<string, string> = {
  NIN_SLIP: "NIN slip",
  PASSPORT_PHOTO: "Your passport photo",
  DRIVERS_LICENCE: "Driver's licence",
  PROOF_OF_ADDRESS: "Proof of address (e.g. a utility bill)",
  GUARANTOR_PASSPORT: "Guarantor's passport photo",
  GUARANTOR_NIN_SLIP: "Guarantor's NIN slip",
};

export const DEFAULT_WORK_EXPERIENCE = {
  employer: "",
  job_title: "",
  started_at: "",
  ended_at: "",
  is_current: false,
};

export const DEFAULT_GUARANTOR = {
  full_name: "",
  relationship: "",
  phone_no: "",
  address: "",
  nin: "",
};

export const DEFAULT_REFERENCE = {
  full_name: "",
  company_name: "",
  phone_no: "",
};

export const TICKET_CATEGORIES = [
  { value: "ACCOUNT", label: "Account" },
  { value: "VERIFICATION", label: "Verification" },
  { value: "BOOKING", label: "Booking" },
  { value: "PAYMENT", label: "Payment" },
  { value: "TRAINING", label: "Training" },
  { value: "BUG_REPORT", label: "Report an issue" },
  { value: "OTHER", label: "Other" },
];

/*
================= NOTE: the client surface - wizard steps, search options and
display helpers. The option values mirror the server enums exactly; a value
outside them is a 400 the client cannot fix.
*/

export const CLIENT_ONBOARDING_STEPS = [
  { path: "/onboarding/hire-type", label: "How will you hire?" },
  { path: "/onboarding/category", label: "Category of drivers" },
  { path: "/onboarding/capacity", label: "How many, and for how long" },
  { path: "/onboarding/location", label: "Where and when" },
  { path: "/onboarding/budget", label: "Budget per driver" },
] as const;

export const CLIENT_DRIVER_CATEGORY_OPTIONS: {
  value: ClientDriverCategory;
  label: string;
  blurb: string;
}[] = [
  {
    value: "CONTRACT",
    label: "Contract Driver",
    blurb: "Hiring for myself or family",
  },
  {
    value: "PRIVATE",
    label: "Private Driver",
    blurb: "Hiring for myself or family",
  },
  {
    value: "CORPORATE",
    label: "Corporate Driver",
    blurb: "Hiring for a company",
  },
  {
    value: "EXECUTIVE",
    label: "Executive Driver",
    blurb: "Hiring for myself or family",
  },
  {
    value: "SPY",
    label: "Spy Driver",
    blurb: "Hiring for myself or family",
  },
  {
    value: "EXPATRIATE",
    label: "Expatriate Driver",
    blurb: "Hiring for a company",
  },
];

export const DRIVERS_NEEDED_OPTIONS: {
  value: DriversNeededRange;
  label: string;
}[] = [
  { value: "ONE", label: "1" },
  { value: "TWO_TO_FIVE", label: "2-5" },
  { value: "SIX_TO_FIFTEEN", label: "6-15" },
  { value: "SIXTEEN_PLUS", label: "16+" },
];

export const ASSIGNMENT_TYPE_OPTIONS: {
  value: AssignmentType;
  label: string;
}[] = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "TEMPORARY", label: "Temporary / Short-term" },
];

export const HIRING_TIMELINE_OPTIONS: {
  value: HiringTimeline;
  label: string;
}[] = [
  { value: "IMMEDIATELY", label: "Immediately" },
  { value: "WITHIN_TWO_WEEKS", label: "Within 2 weeks" },
  { value: "THIS_MONTH", label: "This month" },
  { value: "EXPLORING", label: "Just exploring" },
];

// The hire screens say "Full-time" where the booking model says MONTHLY - the
// driver screens keep the literal engagement labels above.
export const HIRE_ENGAGEMENT_LABELS: Record<string, string> = {
  ONE_OFF: "One-off",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Full-time",
  CONTRACT: "Contract",
};

export const HIRE_PACKAGE_OPTIONS = [
  {
    value: "PRIVATE",
    label: "Private package",
    blurb: "A dedicated driver working directly for you or your family",
  },
  {
    value: "SUBSCRIPTION",
    label: "Subscription package",
    blurb: "A driver on a fixed monthly plan you can renew or end",
  },
];

export const WORK_SCHEDULE_OPTIONS = [
  { value: "WEEKDAYS", label: "Weekdays (Mon - Fri)" },
  { value: "WEEKDAYS_AND_SATURDAY", label: "Weekdays + Saturday" },
  { value: "FULL_WEEK", label: "Full week (Mon - Sun)" },
  { value: "CUSTOM", label: "Custom schedule" },
];

export const WORK_SCHEDULE_LABELS: Record<string, string> = Object.fromEntries(
  WORK_SCHEDULE_OPTIONS.map((o) => [o.value, o.label]),
);

export const INSURANCE_COVER_OPTIONS = [
  "Comprehensive",
  "Third-party",
  "None",
].map((value) => ({ value, label: value }));

export const prettifyEnum = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

export const driverTypeLabel = function (type?: string | null) {
  if (!type) return "Driver";
  return (
    DRIVER_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    prettifyEnum(type)
  );
};

// ₦405k - the overview stat card format. Falls back to the full figure below
// four digits, where compacting saves nothing.
export const formatMoneyCompact = function (
  minor: number | undefined,
  currency = "NGN",
) {
  const major = (minor ?? 0) / 100;
  const symbol =
    currencyMapper[currency as keyof typeof currencyMapper] ?? `${currency} `;

  if (major >= 1_000_000)
    return `${symbol}${(major / 1_000_000).toFixed(major % 1_000_000 === 0 ? 0 : 1)}M`;
  if (major >= 1_000) return `${symbol}${Math.round(major / 1_000)}k`;

  return formatMoney(minor, currency);
};
