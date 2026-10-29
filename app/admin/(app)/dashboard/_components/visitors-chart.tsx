"use client";

import { AppText } from "@/components/shared/app-text";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { APIResponse } from "@/types/response";
import type { GrowthPeriod, VisitorSeries } from "@/types/admin";

const PERIODS: { value: GrowthPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
];

const PERIOD_TITLES: Record<GrowthPeriod, string> = {
  "7d": "last 7 days",
  "14d": "last 14 days",
  "30d": "last 30 days",
};

export const VisitorsChart = function () {
  const [period, setPeriod] = useState<GrowthPeriod>("14d");

  const { data } = useGetData<APIResponse<VisitorSeries>>({
    url: API_ENDPOINTS.adminDashboard.visitors(period),
  });

  const series = (data?.data.series ?? []).map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText type="h3" className="text-base font-semibold">
            Website visitors · {PERIOD_TITLES[period]}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Unique daily visitors on the public pages
          </AppText>
        </div>

        <div className="border-border flex overflow-hidden rounded-lg border">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-xs font-semibold transition-colors",
                period === option.value
                  ? "bg-brand-soft text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div>
          <AppText
            type="caption"
            className="text-muted-foreground block text-xs"
          >
            Today
          </AppText>
          <AppText type="h3" className="text-xl font-bold">
            {data?.data.today ?? 0}
          </AppText>
        </div>
        <div>
          <AppText
            type="caption"
            className="text-muted-foreground block text-xs"
          >
            Total · {PERIOD_TITLES[period]}
          </AppText>
          <AppText type="h3" className="text-xl font-bold">
            {data?.data.total ?? 0}
          </AppText>
        </div>
      </div>

      <div className="mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="visitors-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6bf6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2f6bf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "#cbd5e1" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke="#2f6bf6"
              strokeWidth={2}
              fill="url(#visitors-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
