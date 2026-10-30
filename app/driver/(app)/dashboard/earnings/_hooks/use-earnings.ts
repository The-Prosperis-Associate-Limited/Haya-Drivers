import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type {
  BankAccount,
  BankOption,
  EarningsSummary,
  EarningsTrendPoint,
  Payout,
} from "@/types/earnings";
import type { SalaryPaymentWithParties } from "@/types/salary";

export const useEarningsSummary = function (shouldFetch = true) {
  const { data, isFetching } = useGetData<APIResponse<EarningsSummary>>({
    url: API_ENDPOINTS.earnings.summary,
    shouldFetch,
  });

  return { summary: data?.data, isFetching };
};

export const useEarningsHistory = function ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { data, isFetching } = useGetData<
    PaginatedResponse<SalaryPaymentWithParties>
  >({
    url: API_ENDPOINTS.earnings.history({ page, limit }),
  });

  return {
    payments: data?.data ?? [],
    totalPages: data?.totalPages ?? 1,
    isFetching,
  };
};

export const useEarningsTrend = function (shouldFetch = true) {
  const { data, isFetching } = useGetData<APIResponse<EarningsTrendPoint[]>>({
    url: API_ENDPOINTS.earnings.trend,
    shouldFetch,
  });

  return { trend: data?.data ?? [], isFetching };
};

export const useBankAccounts = function () {
  const { data, isFetching } = useGetData<APIResponse<BankAccount[]>>({
    url: API_ENDPOINTS.earnings.bankAccounts,
  });

  return { bankAccounts: data?.data ?? [], isFetching };
};

export const useBanks = function ({
  country,
  currency,
  shouldFetch,
}: {
  country: string;
  currency: string;
  shouldFetch: boolean;
}) {
  const { data, isFetching } = useGetData<APIResponse<BankOption[]>>({
    url: API_ENDPOINTS.earnings.banks({ country, currency }),
    shouldFetch,
  });

  // Paystack repeats a code across bank variants - duplicate codes break both
  // React keys and account resolution, so only the first of each survives.
  const banks = Array.from(
    new Map((data?.data ?? []).map((bank) => [bank.code, bank])).values(),
  );

  return { banks, isFetching };
};

export const useAddBankAccount = function ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useSubmitData<
    {
      bank_code: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      currency: string;
    },
    APIResponse<BankAccount>
  >({
    url: API_ENDPOINTS.earnings.bankAccounts,
    method: "post",
    // No provider name-enquiry on the manual rail - the admin's banking app
    // confirms the name at the moment money is actually sent.
    onSuccessMessage: "Bank account added",
    onSuccess: () => onSuccess?.(),
  });

  return { addBankAccount: mutate, isPending };
};

export const useRequestWithdrawal = function ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useSubmitData<
    { amount: number; bankAccountId?: string },
    APIResponse<Payout>
  >({
    url: API_ENDPOINTS.earnings.requestWithdrawal,
    method: "post",
    onSuccessMessage: "Withdrawal requested",
    onSuccess: () => onSuccess?.(),
  });

  return { requestWithdrawal: mutate, isPending };
};

export const useWithdrawals = function ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const { data, isFetching } = useGetData<PaginatedResponse<Payout>>({
    url: API_ENDPOINTS.earnings.withdrawals({ page, limit }),
  });

  return { withdrawals: data?.data ?? [], isFetching };
};
