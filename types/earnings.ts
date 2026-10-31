import type { SalaryPaymentWithParties } from "./salary";

export type WalletTransactionType =
  | "BOOKING_PAYMENT"
  | "PLATFORM_FEE"
  | "PAYOUT"
  | "PAYOUT_REVERSAL"
  | "ADJUSTMENT";

export type WalletTransactionStatus =
  "PENDING" | "AVAILABLE" | "PAID_OUT" | "REVERSED";

export type PayoutStatus =
  "REQUESTED" | "PROCESSING" | "PAID" | "FAILED" | "REVERSED";

export interface EarningsSummary {
  currency: string;
  received_minor: number;
  awaiting_confirmation_minor: number;
  awaiting_confirmation_count: number;
  due_minor: number;
  overdue_minor: number;
  overdue_count: number;
  disputed_minor: number;
  disputed_count: number;
  wallet: { available_minor: number; pending_minor: number };
}

export interface WalletTransaction {
  id: string;
  reference: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount_minor: number;
  currency: string;
  description: string | null;
  createdAt: string;
  booking: {
    reference: string;
    title: string;
    client: { first_name: string | null; last_name: string | null };
  } | null;
}

export interface EarningsTrendPoint {
  month: string;
  label: string;
  total_minor: number;
}

export interface BankOption {
  name: string;
  code: string;
  currency: string;
}

export interface BankAccount {
  id: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency: string;
  is_default: boolean;
}

export interface Payout {
  id: string;
  reference: string;
  amount_minor: number;
  currency: string;
  status: PayoutStatus;
  failure_reason: string | null;
  processed_at: string | null;
  createdAt: string;
  bankAccount: BankAccount | null;
}

export interface EarningsStatement {
  month: string;
  reference: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  currency: string;
  driver: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    state_of_residence: string | null;
  } | null;
  lines: SalaryPaymentWithParties[];
  totals: {
    received_minor: number;
    awaiting_minor: number;
    total_minor: number;
  };
}
