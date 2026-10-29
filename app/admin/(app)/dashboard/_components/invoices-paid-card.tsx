"use client";

import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatMoney, toMajorUnits } from "@/lib/utils";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { AdminOverview } from "@/types/admin";

interface Props {
  series?: AdminOverview["invoices_paid_series"];
  currency?: string;
}

export const InvoicesPaidCard = function ({ series, currency = "NGN" }: Props) {
  const data = (series ?? []).map((point) => ({
    ...point,
    label: format(new Date(`${point.month}-01T00:00:00`), "MMM"),
    total: toMajorUnits(point.total_minor),
  }));
  const total = data.reduce((sum, point) => sum + point.total_minor, 0);
  const current = data.at(-1)?.total_minor ?? 0;
  const previous = data.at(-2)?.total_minor ?? 0;
  // A month with nothing paid yet is still in progress, not a 100% drop.
  const delta =
    previous && current
      ? Math.round(((current - previous) / previous) * 100)
      : null;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Invoices paid
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Last 6 months · {formatMoney(total, currency)}
          </AppText>
        </div>
        {delta === null && previous > 0 && !current && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {formatMoney(previous, currency)} last month
          </span>
        )}
        {delta !== null && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              delta >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600",
            )}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>

      {!series ? (
        <Skeleton className="mt-4 h-[170px] rounded-xl" />
      ) : (
        <div className="mt-4 h-[170px] w-full">
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
                          (payload[0].payload as { total_minor: number })
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
      )}
    </div>
  );
};
