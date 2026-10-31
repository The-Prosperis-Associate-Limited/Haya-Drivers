"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { useGetData } from "@/hooks/use-get-data";
import { downloadCsv } from "@/lib/admin";
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
import type { GrowthPeriod, GrowthSeries } from "@/types/admin";

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

export const GrowthChart = function () {
  const [period, setPeriod] = useState<GrowthPeriod>("14d");

  const { data } = useGetData<APIResponse<GrowthSeries>>({
    url: API_ENDPOINTS.adminDashboard.growth(period),
  });

  const series = (data?.data.series ?? []).map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  }));

  const exportSeries = (format: string) => {
    if (format === "csv") {
      downloadCsv(
        `user-growth-${period}.csv`,
        ["Date", "New drivers", "New clients"],
        series.map((point) => [point.date, point.drivers, point.clients]),
      );
      return;
    }
    window.print();
  };

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText type="h3" className="text-base font-semibold">
            User growth · {PERIOD_TITLES[period]}
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            New driver vs client registrations
          </AppText>
        </div>

        <AppSimpleSelect
          placeholder="EXPORT AS"
          options={[
            { value: "pdf", label: "PDF" },
            { value: "csv", label: "CSV" },
          ]}
          onValueChange={exportSeries}
          containerClassName="w-[130px]"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs font-medium">
            <span className="bg-brand h-3 w-3 rounded-sm" />
            New drivers
          </span>
          <span className="flex items-center gap-2 text-xs font-medium">
            <span className="h-3 w-3 rounded-sm bg-indigo-900" />
            New clients
          </span>
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

      <div className="mt-4 h-65 w-full md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="growth-drivers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f6bf6" stopOpacity={0.2} />
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
            <YAxis
              allowDecimals={false}
              width={36}
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
                    <AppText type="caption" className="block font-semibold">
                      {payload[0].payload.drivers} drivers ·{" "}
                      {payload[0].payload.clients} clients
                    </AppText>
                  </div>
                ) : null
              }
            />
            <Area
              type="monotone"
              dataKey="drivers"
              stroke="#2f6bf6"
              strokeWidth={2}
              fill="url(#growth-drivers)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="clients"
              stroke="#312e81"
              strokeWidth={2}
              fill="transparent"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
