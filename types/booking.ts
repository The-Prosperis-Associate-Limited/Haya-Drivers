import type { TodayAttendance } from "./attendance";
import type { DriverType } from "./driver";
import type { HireInvoice, HireRequest, HireRequestStatus } from "./hire";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DISPUTED";

export type EngagementType =
  "ONE_OFF" | "DAILY" | "WEEKLY" | "MONTHLY" | "CONTRACT";

export interface BookingParty {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
  phone_no: string | null;
  client_profile?: {
    organisation_name: string | null;
    client_type: "INDIVIDUAL" | "ORGANISATION";
  } | null;
}

export interface BookingStatusEvent {
  id: string;
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  note: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  requirements: string[];
  driver_type: DriverType;
  engagement_type: EngagementType;
  pickup_address: string;
  dropoff_address: string | null;
  country: string;
  state: string;
  city: string | null;
  starts_at: string;
  ends_at: string | null;
  schedule: string | null;
  resumption_time: string | null;
  closing_time: string | null;
  amount: number;
  currency: string;
  status: BookingStatus;
  decline_reason: string | null;
  createdAt: string;
  client: BookingParty;
  driver: BookingParty | null;
  status_events?: BookingStatusEvent[];
  today_attendance?: TodayAttendance | null;
}

// The server owns which statuses each bucket covers. Jobs arrive already
// accepted (admin-brokered), so the buckets are about lifecycle, not consent.
export type JobRequestBucket = "active" | "completed";

export interface JobRequestSummary {
  active: number;
  completed: number;
}

export interface DashboardStats {
  total_earnings_minor: number;
  available_minor: number;
  pending_minor: number;
  currency: string;
  ongoing_projects: number;
  jobs_completed: number;
  active_customers: number;
  trust_score: number;
  verification_status: string;
  client_review_average: number;
  client_review_count: number;
  on_time_rate: number | null;
  certifications_earned: number;
  training_completed: number;
}

/*
================= NOTE: the client-surface shapes - hires, the hire detail and
the overview payload.
*/

export interface HireDriver {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
  gender?: string | null;
  city?: string | null;
  state_of_residence?: string | null;
  driver_profile?: {
    driver_type: DriverType | null;
    expected_monthly_rate: number | null;
    rate_currency: string;
    trust_score: number;
  } | null;
}

export interface Hire {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  driver_type: DriverType;
  engagement_type: EngagementType;
  pickup_address: string;
  dropoff_address: string | null;
  state: string;
  city: string | null;
  starts_at: string;
  ends_at: string | null;
  amount: number;
  currency: string;
  status: BookingStatus;
  accepted_at: string | null;
  schedule: string | null;
  resumption_time: string | null;
  closing_time: string | null;
  driver: HireDriver | null;
  today_attendance?: TodayAttendance | null;
}

export interface HireReview {
  id: string;
  rating: number;
  comment: string | null;
  criteria: Record<string, number> | null;
  createdAt: string;
}

export interface HireDetail extends Hire {
  my_review: HireReview | null;
  driver_details: {
    gender: string | null;
    city: string | null;
    state_of_residence: string | null;
    driver_profile: {
      driver_type: DriverType | null;
      years_of_experience: number | null;
      expected_monthly_rate: number | null;
      rate_currency: string;
      trust_score: number;
    } | null;
  } | null;
  driver_rating: number;
  driver_review_count: number;
}

export type OverviewInvoice = Pick<
  HireInvoice,
  | "reference"
  | "status"
  | "amount_minor"
  | "per_driver_minor"
  | "vat_percent"
  | "vat_minor"
  | "fee_minor"
  | "total_minor"
  | "breakdown"
  | "currency"
  | "proof_submitted_at"
  | "proof_rejected_reason"
  | "createdAt"
>;

export interface OverviewHireRequest extends Omit<
  HireRequest,
  "assignments" | "invoice" | "driver"
> {
  shortlist: {
    total: number;
    confirmed: number;
    pending: number;
    declined: number;
  };
  invoice: Pick<
    HireInvoice,
    "status" | "total_minor" | "currency" | "proof_rejected_reason"
  > | null;
}

export interface OverviewData {
  stats: {
    active_drivers: number;
    on_duty: number;
    open_requests: number;
    monthly_spend_minor: number;
    spend_last_month_minor: number;
    spend_delta_percent: number | null;
    on_time_rate: number | null;
  };
  hired_staff: Hire[];
  hired_total: number;
  hire_requests: OverviewHireRequest[];
  invoice_due: {
    reference: string;
    status: HireRequestStatus;
    drivers_needed: number;
    driver_type: DriverType | null;
    invoice: OverviewInvoice;
  } | null;
  recent_payments: {
    id: string;
    reference: string;
    total_minor: number;
    currency: string;
    paid_at: string;
    hire_request: {
      reference: string;
      drivers_needed: number;
      driver_type: DriverType | null;
    };
  }[];
  currency: string;
}
