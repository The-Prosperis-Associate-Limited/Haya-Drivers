"use client";

import { AppText } from "@/components/shared/app-text";
import { formatMoney, toMajorUnits } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { EarningsTrendPoint } from "@/types/earnings";

interface Props {
  trend: EarningsTrendPoint[];
  currency: string;
}

export const EarningsTrend = function ({ trend, currency }: Props) {
  // The server already fills empty months with 0, so the line stays continuous
  // rather than skipping a month with no work.
  const data = trend.map((point) => ({
    ...point,
    total: toMajorUnits(point.total_minor),
  }));

  return (
    <div className="h-[260px] w-full md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="earnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6bf6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2f6bf6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} stroke="#eef2f7" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
          />
          <Tooltip
            cursor={{ stroke: "#2f6bf6", strokeDasharray: "4 4" }}
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
          <Area
            type="monotone"
            dataKey="total"
            stroke="#1e40af"
            strokeWidth={2}
            fill="url(#earnings)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#fff",
              stroke: "#1e40af",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
