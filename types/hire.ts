import type { DriverType } from "./driver";
import type { EngagementType } from "./booking";

export type HireRequestStatus =
  | "PENDING_REVIEW"
  | "INVOICED"
  | "PAYMENT_REVIEW"
  | "PAID"
  | "DECLINED"
  | "CANCELLED";

export type HireInvoiceStatus = "UNPAID" | "PAYMENT_REVIEW" | "PAID" | "VOID";

export type HirePackage = "PRIVATE" | "SUBSCRIPTION";

export type WorkSchedule =
  "WEEKDAYS" | "WEEKDAYS_AND_SATURDAY" | "FULL_WEEK" | "CUSTOM";

export type HireTransmission = "AUTOMATIC" | "MANUAL" | "BOTH";

export interface HireFeeLine {
  label: string;
  amount_minor: number;
}

export interface HireInvoice {
  id: string;
  reference: string;
  amount_minor: number;
  per_driver_minor: number | null;
  vat_percent: number;
  vat_minor: number;
  fee_minor: number;
  total_minor: number;
  breakdown: HireFeeLine[] | null;
  currency: string;
  status: HireInvoiceStatus;
  note: string | null;
  proof_url: string | null;
  proof_note: string | null;
  proof_submitted_at: string | null;
  proof_rejected_reason: string | null;
  paid_at: string | null;
  createdAt: string;
}

export interface HireInvoiceQuote {
  client_type: "INDIVIDUAL" | "ORGANISATION";
  engagement_type: EngagementType;
  duration_days: number | null;
  drivers: number;
  per_driver_minor: number;
  fee_minor: number;
  lines: HireFeeLine[];
  vat_percent: number;
  vat_minor: number;
  total_minor: number;
  currency: string;
}

export interface HirePricingGuide {
  full_time: {
    annual_fee_percent: number;
    example: { monthly_minor: number; annual_minor: number; fee_minor: number };
  };
  contract: {
    brackets: {
      label: string;
      max_days: number;
      individual_minor: number;
      corporate_minor: number;
    }[];
    multi_driver_discount: {
      min_duration_days: number;
      individual_minor: number;
      corporate_minor: number;
    };
  };
}

export interface PaymentAccount {
  bank_name: string;
  account_name: string;
  account_number: string;
}

export interface HireRequestDriver {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
  city: string | null;
  state_of_residence: string | null;
  driver_profile: {
    driver_type: DriverType | null;
    expected_monthly_rate: number | null;
    rate_currency: string;
    trust_score: number;
    years_of_experience: number | null;
  } | null;
}

export interface HireRequestClient {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  client_profile: {
    organisation_name: string | null;
    client_type: string;
  } | null;
}

// The verified contact details the client pays for.
export interface ComboPack {
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_no: string | null;
  whatsapp_number: string | null;
  city: string | null;
  state_of_residence: string | null;
}

export type AvailabilityStatus = "PENDING" | "CONFIRMED" | "DECLINED";

export interface HireAssignment {
  id: string;
  driverId: string;
  status: AvailabilityStatus;
  responded_at: string | null;
  respond_by: string | null;
  expired_at: string | null;
  driver: HireRequestDriver;
}

export interface DriverShortlist {
  id: string;
  status: AvailabilityStatus;
  respond_by: string | null;
  createdAt: string;
  hire_request: {
    reference: string;
    engagement_type: EngagementType;
    starts_at: string;
    schedule: WorkSchedule;
    resumption_time: string | null;
    closing_time: string | null;
    transmission: HireTransmission | null;
    driver_type: DriverType | null;
    duration_months: number | null;
    duration_days: number | null;
    provides_accommodation: boolean;
    state: string | null;
    nearest_area: string | null;
  };
}

export interface HireRequest {
  id: string;
  reference: string;
  clientId: string;
  driverId: string | null;
  engagement_type: EngagementType;
  starts_at: string;
  note: string | null;
  status: HireRequestStatus;
  package: HirePackage;
  duration_months: number | null;
  duration_days: number | null;
  drivers_needed: number;
  driver_type: DriverType | null;
  schedule: WorkSchedule;
  resumption_time: string | null;
  closing_time: string | null;
  transmission: HireTransmission | null;
  insurance_cover: string | null;
  provides_accommodation: boolean;
  state: string | null;
  nearest_area: string | null;
  preferred_ethnicity: string | null;
  preferred_religion: string | null;
  preferred_age_range: string | null;
  declined_reason: string | null;
  paid_at: string | null;
  createdAt: string;
  driver: HireRequestDriver | null;
  assignments: HireAssignment[];
  client?: HireRequestClient;
  invoice: HireInvoice | null;
  booking?: { id: string; reference: string; status: string } | null;
  combo_pack?: ComboPack[] | null;
  payment_account?: PaymentAccount | null;
}

export interface ClientInvoiceRow {
  id: string;
  reference: string;
  status: HireInvoiceStatus;
  total_minor: number;
  currency: string;
  paid_at: string | null;
  proof_submitted_at: string | null;
  proof_rejected_reason: string | null;
  createdAt: string;
  hire_request: {
    reference: string;
    status: HireRequestStatus;
    drivers_needed: number;
    driver_type: DriverType | null;
    engagement_type: EngagementType;
    starts_at: string;
  };
}

export interface InvoiceSummary {
  outstanding_minor: number;
  outstanding_count: number;
  in_review_count: number;
  paid_minor: number;
  paid_count: number;
}
