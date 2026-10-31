import { AppText } from "@/components/shared/app-text";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { AdminOverview } from "@/types/admin";

interface Props {
  pipeline?: AdminOverview["pipeline"];
}

const STAGES: {
  key: keyof AdminOverview["pipeline"];
  label: string;
  bar: string;
}[] = [
  { key: "new", label: "New requests", bar: "bg-brand" },
  { key: "shortlisting", label: "Shortlisting", bar: "bg-brand" },
  { key: "ready_to_invoice", label: "Ready to invoice", bar: "bg-brand" },
  { key: "invoiced", label: "Invoiced", bar: "bg-amber-500" },
  { key: "payment_review", label: "Payment review", bar: "bg-amber-500" },
  { key: "active_hires", label: "Active hires", bar: "bg-emerald-600" },
];

export const PipelineCard = function ({ pipeline }: Props) {
  const max = pipeline ? Math.max(1, ...Object.values(pipeline)) : 1;

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <AppText type="h4" className="text-[15px] font-semibold">
            Hire pipeline
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Where every open request is right now
          </AppText>
        </div>
        <Link
          href="/admin/dashboard/hires"
          className="text-brand inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold"
        >
          All hires
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {STAGES.map((stage) => {
          const value = pipeline?.[stage.key];

          return (
            <div
              key={stage.key}
              className="grid grid-cols-[110px_1fr_36px] items-center gap-3 sm:grid-cols-[130px_1fr_40px]"
            >
              <AppText
                type="caption"
                className="text-foreground/80 text-[13px]"
              >
                {stage.label}
              </AppText>
              {value === undefined ? (
                <Skeleton className="h-2 w-full rounded-full" />
              ) : (
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <i
                    className={cn("block h-full rounded-full", stage.bar)}
                    style={{
                      width: `${value ? Math.max(4, (value / max) * 100) : 0}%`,
                    }}
                  />
                </div>
              )}
              <AppText
                type="label"
                className="text-right text-sm font-semibold"
              >
                {value ?? ""}
              </AppText>
            </div>
          );
        })}
      </div>
    </div>
  );
};
