export type SalaryPaymentStatus = "DUE" | "PAID" | "CONFIRMED" | "DISPUTED";

export type SalaryResolution = "PAID" | "UNPAID";

export interface SalaryPayment {
  id: string;
  period_start: string;
  period_end: string;
  period_label: string;
  due_at: string;
  amount_minor: number;
  currency: string;
  status: SalaryPaymentStatus;
  overdue: boolean;
  paid_at: string | null;
  receipt_url: string | null;
  client_note: string | null;
  confirmed_at: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
  resolution: SalaryResolution | null;
  resolution_note: string | null;
  resolved_at: string | null;
}

export interface SalarySchedule {
  engagement_type: "MONTHLY" | "CONTRACT" | string;
  amount_minor: number;
  currency: string;
  starts_at: string;
  ends_at: string | null;
  grace_days: number;
  summary: {
    confirmed_minor: number;
    outstanding_minor: number;
    overdue_count: number;
    awaiting_confirmation: number;
    disputed: number;
  };
  payments: SalaryPayment[];
}

interface SalaryParty {
  id: string;
  name: string;
  profile_pic: string | null;
}

export interface SalaryPaymentWithParties extends SalaryPayment {
  booking: {
    reference: string;
    title: string;
    engagement_type: "MONTHLY" | "CONTRACT" | string;
  };
  client: SalaryParty;
  driver: SalaryParty | null;
}

export type AdminSalaryFilter = "disputed" | "overdue" | "awaiting" | "all";

export interface AdminSalaryCounts {
  disputed: number;
  overdue: number;
  awaiting: number;
}
