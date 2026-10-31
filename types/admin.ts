import type { AccountStatus, ClientType, User } from "./auth";
import type {
  DriverDocument,
  DriverProfile,
  DriverType,
  DriverVerificationStatus,
  Guarantor,
  WorkExperience,
} from "./driver";

export type AdminRole =
  | "SUPER_ADMIN"
  | "FLEET_MANAGER"
  | "FINANCE_OFFICER"
  | "SUPPORT_AGENT"
  | "READ_ONLY";

export interface AdminProfile {
  id: string;
  userId: string;
  admin_role: AdminRole;
  must_change_password: boolean;
  invited_by: string | null;
  last_active_at: string | null;
  createdAt: string;
}

export interface AdminDashboardStats {
  total_users: number;
  active_drivers: number;
  open_requests: number;
  pending_verifications: number;
  drivers: number;
  clients: number;
  bookings: { requested: number; in_progress: number; completed: number };
}

export type GrowthPeriod = "7d" | "14d" | "30d";

export interface GrowthSeries {
  period: GrowthPeriod;
  series: { date: string; drivers: number; clients: number }[];
}

export interface VisitorSeries {
  period: GrowthPeriod;
  series: { date: string; visitors: number }[];
  total: number;
  today: number;
}

export interface AdminUserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_no: string | null;
  profile_pic: string | null;
  role: User["role"];
  account_status: AccountStatus;
  has_validated_email: boolean;
  anonymised_at: string | null;
  lastLogin: string;
  createdAt: string;
  driver_profile: {
    driver_type: DriverType | null;
    trust_score: number;
    verification_status: DriverVerificationStatus;
  } | null;
  client_profile: {
    client_type: ClientType;
    organisation_name: string | null;
  } | null;
}

export interface AdminDriverStats {
  total: number;
  active: number;
  pending_approval: number;
  suspended: number;
}

export interface AdminClientStats {
  total: number;
  active: number;
  suspended: number;
  organisations: number;
}

export interface AdminWallet {
  id: string;
  userId: string;
  currency: string;
  available_minor: number;
  pending_minor: number;
  lifetime_minor: number;
  dva_account_number: string | null;
  dva_account_name: string | null;
  dva_bank_name: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminWalletTransactionType =
  | "BOOKING_PAYMENT"
  | "PLATFORM_FEE"
  | "PAYOUT"
  | "PAYOUT_REVERSAL"
  | "ADJUSTMENT"
  | "FUNDING"
  | "BOOKING_CHARGE";

export type AdminWalletTransactionStatus =
  "PENDING" | "AVAILABLE" | "PAID_OUT" | "REVERSED";

export interface AdminWalletTransaction {
  id: string;
  type: AdminWalletTransactionType;
  status: AdminWalletTransactionStatus;
  amount_minor: number;
  currency: string;
  description: string | null;
  reference: string;
  createdAt: string;
  booking: {
    reference: string;
    title: string;
    driver_type: DriverType;
    client: { first_name: string | null; last_name: string | null };
    driver: { first_name: string | null; last_name: string | null } | null;
  } | null;
}

export interface AdminTransactionStats {
  paid_to_drivers_minor: number;
  paid_payouts: number;
  awaiting_release: { amount_minor: number; count: number };
  failed_payouts: number;
  currency: string;
}

export type PayoutStatus =
  "REQUESTED" | "PROCESSING" | "PAID" | "FAILED" | "REVERSED";

export interface AdminPayoutRow {
  id: string;
  reference: string;
  amount_minor: number;
  fee_minor: number;
  currency: string;
  status: PayoutStatus;
  failure_reason: string | null;
  processed_at: string | null;
  createdAt: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  bankAccount: {
    bank_name: string;
    account_number: string;
    account_name: string;
  } | null;
}

export type EnrollmentStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface EnrollmentProgressRow {
  id: string;
  status: EnrollmentStatus;
  progress: number;
  minutes_spent: number;
  started_at: string;
  completed_at: string | null;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    profile_pic: string | null;
  };
  course: {
    id: string;
    slug: string;
    title: string;
    is_required: boolean;
    estimated_minutes: number;
  };
}

export interface TeamMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_pic: string | null;
  account_status: AccountStatus;
  lastLogin: string;
  createdAt: string;
  admin_profile: AdminProfile | null;
}

export interface InviteResult {
  admin: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    admin_role: AdminRole;
  };
  temporary_password: string;
}

export interface VerificationQueueRow {
  id: string;
  userId: string;
  status: DriverVerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  attempts: number;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    profile_pic: string | null;
    driver_profile: {
      driver_type: DriverType | null;
      years_of_experience: number | null;
      trust_score: number;
    } | null;
    documents: { status: "PENDING" | "APPROVED" | "REJECTED" }[];
  };
}

export interface AdminActivityRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: User["role"];
    profile_pic: string | null;
  };
}

export interface AdminUserDetail extends User {
  lastLogin: string;
  anonymised_at: string | null;
  driver_profile:
    | (DriverProfile & {
        work_experiences: WorkExperience[];
        guarantors: Guarantor[];
      })
    | null;
  driver_verification: {
    id: string;
    status: DriverVerificationStatus;
    submitted_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    attempts: number;
  } | null;
}

export interface AdminVerificationSubmission {
  verification: AdminUserDetail["driver_verification"];
  profile: DriverProfile & {
    user: User;
    work_experiences: WorkExperience[];
    guarantors: Guarantor[];
  };
  documents: DriverDocument[];
}

export interface AdminUserWalletData {
  wallet: AdminWallet | null;
  transactions: {
    data: AdminWalletTransaction[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface AdminNav {
  counts: Record<
    | "drivers"
    | "hires"
    | "transactions"
    | "salaries"
    | "attendance"
    | "support"
    | "referrals",
    number
  >;
  team: {
    id: string;
    name: string;
    profile_pic: string | null;
    admin_role: AdminRole | null;
  }[];
  chats_waiting: number;
}

export type OverviewPeriod = "7d" | "30d" | "90d";

export type HireStage = "NEW" | "SHORTLISTING" | "TRIM" | "READY" | "PAYMENT";

export interface NeedsActionHire {
  reference: string;
  stage: HireStage;
  drivers_needed: number;
  driver_type: DriverType | null;
  engagement_type: string;
  area: string | null;
  shortlist: {
    confirmed: number;
    pending: number;
    declined: number;
    total: number;
  };
  invoice_total_minor: number | null;
  currency: string;
  waiting_since: string;
  client: { id: string; name: string; profile_pic: string | null };
}

export interface AdminOverview {
  period: OverviewPeriod;
  tiles: {
    pending_verifications: number;
    payment_reviews: number;
    ready_to_invoice: number;
    chats_waiting: number;
  };
  stats: {
    total_users: number;
    new_users: number;
    new_users_delta_percent: number | null;
    active_drivers: number;
    approved_in_period: number;
    open_hire_requests: number;
    avg_hours_to_shortlist: number | null;
    invoices_paid_minor: number;
    invoices_paid_delta_percent: number | null;
    fees_minor: number;
    currency: string;
  };
  pipeline: {
    new: number;
    shortlisting: number;
    ready_to_invoice: number;
    invoiced: number;
    payment_review: number;
    active_hires: number;
  };
  needs_action: NeedsActionHire[];
  needs_action_total: number;
  invoices_paid_series: { month: string; total_minor: number }[];
}
