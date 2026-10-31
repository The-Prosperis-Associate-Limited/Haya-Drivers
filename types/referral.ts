export type ReferralStatus =
  | "SIGNED_UP"
  | "REWARDED"
  | "HELD"
  | "REJECTED"
  | "REVERSED";

export type VerificationStatus =
  | "UNSUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface ReferralCodePreview {
  code: string;
  referrer_name: string;
}

export interface ReferralOverview {
  code: string;
  link: string;
  reward_minor: number;
  currency: string;
  hold_hours: number;
  stats: {
    invited: number;
    invited_this_month: number;
    onboarding: number;
    qualified: number;
    under_review: number;
    earned_minor: number;
    waiting_minor: number;
  };
  referred_by: { name: string } | null;
}

export interface DriverReferral {
  id: string;
  status: ReferralStatus;
  reward_minor: number;
  currency: string;
  joined_at: string;
  rewarded_at: string | null;
  referee: {
    name: string;
    initials: string;
    location: string | null;
    verified: boolean;
  };
  progress: { step: number; label: string };
}

export interface WalletOverview {
  currency: string;
  available_minor: number;
  pending_minor: number;
  in_transit_minor: number;
  withdrawn_minor: number;
  referral_earned_minor: number;
  has_open_payout: boolean;
  minimum_payout_minor: number;
}

export interface WalletLedgerEntry {
  id: string;
  reference: string;
  type:
    | "BOOKING_PAYMENT"
    | "PLATFORM_FEE"
    | "VAT_CHARGE"
    | "PAYOUT"
    | "PAYOUT_REVERSAL"
    | "ADJUSTMENT"
    | "FUNDING"
    | "BOOKING_CHARGE"
    | "REFERRAL_BONUS";
  status: "PENDING" | "AVAILABLE" | "PAID_OUT" | "REVERSED";
  amount_minor: number;
  currency: string;
  description: string | null;
  available_at: string | null;
  created_at: string;
  payout: {
    reference: string;
    status: "REQUESTED" | "PROCESSING" | "PAID" | "FAILED" | "REVERSED";
    failure_reason: string | null;
    bank_name: string | null;
    account_last4: string | null;
  } | null;
}

export interface AdminReferralOverview {
  range: string;
  kpis: {
    signups: number;
    signups_change_pct: number | null;
    qualified: number;
    conversion_pct: number;
    rewards_paid_minor: number;
    active_referrers: number;
    held_for_review: number;
  };
  funnel: { key: string; label: string; count: number }[];
  weekly: { week_start: string; count: number }[];
  currency: string;
}

export type NetworkNodeStatus =
  | "root"
  | "rewarded"
  | "held"
  | "onboarding"
  | "signed_up"
  | "reversed";

export interface ReferralNetworkNode {
  id: string;
  name: string;
  status: NetworkNodeStatus;
  verification_status: VerificationStatus | null;
  joined_at: string;
  children: ReferralNetworkNode[];
}

export interface ReferralNetwork {
  roots: ReferralNetworkNode[];
  truncated: boolean;
}

export interface ReferralLeader {
  user_id: string;
  name: string;
  code: string | null;
  rewarded: number;
  total: number;
}

interface ReferralPerson {
  id: string;
  name: string;
  email: string;
  profile_pic: string | null;
  location: string | null;
  account_status: string;
  verification_status: VerificationStatus | null;
  onboarding_step: string | null;
  code: string | null;
}

export interface AdminReferral {
  id: string;
  code: string;
  channel: "SIGNUP" | "ONBOARDING";
  status: ReferralStatus;
  reward_minor: number;
  currency: string;
  risk_score: number;
  risk_flags: { key: string; label: string; blocks: boolean }[];
  qualified_at: string | null;
  rewarded_at: string | null;
  reward_available_at: string | null;
  reward_transaction_status: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  reviewed_by: string | null;
  created_at: string;
  referee: ReferralPerson;
  referrer: ReferralPerson;
}

export interface ReferrerDetail {
  id: string;
  name: string;
  code: string | null;
  verification_status: VerificationStatus | null;
  joined_at: string;
  location: string | null;
  chain: { id: string; name: string }[];
  total: number;
  earned_minor: number;
  referrals: {
    id: string;
    status: ReferralStatus;
    referee_id: string;
    name: string;
    joined_at: string;
    reward_minor: number;
  }[];
}
