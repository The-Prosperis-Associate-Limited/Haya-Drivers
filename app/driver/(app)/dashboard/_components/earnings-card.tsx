"use client";

import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, toMajorUnits } from "@/lib/utils";
import { ArrowDownToLine, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { EarningsSummary, EarningsTrendPoint } from "@/types/earnings";

interface Props {
  summary?: EarningsSummary;
  trend: EarningsTrendPoint[];
  isFetching: boolean;
}

const EARNINGS_HREF = "/driver/dashboard/earnings";

export const EarningsCard = function ({ summary, trend, isFetching }: Props) {
  const currency = summary?.currency ?? "NGN";
  const recent = trend.slice(-6);
  const recentTotal = recent.reduce((sum, point) => sum + point.total_minor, 0);
  const data = recent.map((point) => ({
    ...point,
    total: toMajorUnits(point.total_minor),
  }));

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Earnings
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Paid out by Haya Drivers each month
          </AppText>
        </div>
        <Link
          href={EARNINGS_HREF}
          className="text-brand inline-flex items-center gap-0.5 text-[13px] font-semibold"
        >
          All earnings
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {isFetching && !summary ? (
        <Skeleton className="mt-4 h-64 rounded-xl" />
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <AppText type="caption" className="text-muted-foreground block">
                Last 6 months
              </AppText>
              <AppText
                type="h2"
                as="p"
                className="text-[26px] font-semibold tracking-tight"
              >
                {formatMoney(recentTotal, currency)}
              </AppText>
            </div>
            <AppText type="caption" className="text-muted-foreground">
              Lifetime {formatMoney(summary?.total_earnings_minor, currency)}
            </AppText>
          </div>

          <div className="mt-3 h-[170px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9", radius: 8 }}
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="border-border rounded-lg border bg-white px-3 py-2 shadow-sm">
                        <AppText
                          type="caption"
                          className="text-muted-foreground block"
                        >
                          {label}
                        </AppText>
                        <AppText type="label" className="block">
                          {formatMoney(
                            (payload[0].payload as EarningsTrendPoint)
                              .total_minor,
                            currency,
                          )}
                        </AppText>
                      </div>
                    ) : null
                  }
                />
                <Bar
                  dataKey="total"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={38}
                  isAnimationActive={false}
                >
                  {data.map((point, index) => (
                    <Cell
                      key={point.month}
                      fill={index === data.length - 1 ? "#2f6bf6" : "#dbe6fe"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-slate-50 p-3">
              <AppText type="caption" className="text-muted-foreground block">
                Available to withdraw
              </AppText>
              <AppText type="label" className="text-base font-semibold">
                {formatMoney(summary?.available_minor, currency)}
              </AppText>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <AppText type="caption" className="text-muted-foreground block">
                On hold
              </AppText>
              <AppText type="label" className="text-base font-semibold">
                {formatMoney(summary?.pending_minor, currency)}
              </AppText>
            </div>
          </div>

          <Button asChild className="mt-4 h-10 rounded-xl px-4">
            <Link href={EARNINGS_HREF}>
              <ArrowDownToLine className="size-4" />
              Withdraw
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};
