import { AppText } from "@/components/shared/app-text";
import { formatMoney } from "@/lib/utils";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { EarningsTrendPoint } from "@/types/earnings";

interface Props {
  trend: EarningsTrendPoint[];
  currency: string;
}

const monthName = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export const PayslipsCard = function ({ trend, currency }: Props) {
  const months = trend.filter((point) => point.total_minor > 0).reverse();

  return (
    <div className="border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="px-4 pt-4 md:px-5 md:pt-5">
        <AppText type="h4" className="text-[15px] font-semibold">
          Payslips
        </AppText>
        <AppText type="caption" className="text-muted-foreground block">
          Monthly statements you can download as PDF - proof of income for a
          landlord or a bank.
        </AppText>
      </div>

      {!months.length ? (
        <AppText
          type="caption"
          className="text-muted-foreground block px-4 pt-3 pb-5 md:px-5"
        >
          Your first payslip appears once Haya Drivers pays you.
        </AppText>
      ) : (
        <div className="mt-2">
          {months.map((point) => (
            <Link
              key={point.month}
              href={`/driver/dashboard/earnings/payslips/${point.month}`}
              className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 transition-colors first:border-t-0 hover:bg-slate-50 md:px-5"
            >
              <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-[11px]">
                <FileText className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <AppText
                  type="label"
                  className="block text-[13px] font-semibold"
                >
                  {monthName(point.month)}
                </AppText>
                <AppText type="caption" className="text-muted-foreground block">
                  Earned {formatMoney(point.total_minor, currency)}
                </AppText>
              </span>
              <ChevronRight className="text-muted-foreground size-4" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
