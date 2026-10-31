"use client";

import { AppText } from "@/components/shared/app-text";
import { BackLink } from "@/components/shared/back-link";
import { TegatLogo } from "@/components/svg/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

interface Party {
  label: string;
  lines: (string | null | undefined)[];
}

interface Props {
  title: string;
  reference: string;
  status?: { label: string; tone: "paid" | "due" | "info" };
  meta: { label: string; value: string }[];
  parties: Party[];
  backHref: string;
  backLabel: string;
  footnote?: string;
  children: React.ReactNode;
}

const STATUS_TONES = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  due: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-brand/20 bg-brand-soft text-brand",
};

// "Download PDF" is the browser's own print-to-PDF; the dashboard chrome is print:hidden.
export const PrintDocument = function ({
  title,
  reference,
  status,
  meta,
  parties,
  backHref,
  backLabel,
  footnote,
  children,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 print:max-w-none print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <BackLink href={backHref} label={backLabel} />
        <Button onClick={() => window.print()} className="h-10 rounded-xl px-4">
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>

      <article
        data-print-document
        className="border-border rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <TegatLogo size={40} />
            <div>
              <p className="text-ink text-lg font-bold tracking-tight">
                Haya Drivers
              </p>
              <p className="text-muted-foreground text-xs">hayadrivers.com</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-ink text-2xl font-semibold tracking-tight">
              {title}
            </p>
            <p className="text-muted-foreground text-sm">{reference}</p>
            {status && (
              <span
                className={cn(
                  "mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_TONES[status.tone],
                )}
              >
                {status.label}
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-3">
          {parties.map((party) => (
            <div key={party.label}>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {party.label}
              </p>
              {party.lines.filter(Boolean).map((line, index) => (
                <p
                  key={index}
                  className={cn(
                    "text-sm",
                    index === 0
                      ? "text-ink mt-1 font-semibold"
                      : "text-foreground/80",
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
          <dl className="space-y-1">
            {meta.map((item) => (
              <div
                key={item.label}
                className="flex justify-between gap-3 text-sm sm:block"
              >
                <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {item.label}
                </dt>
                <dd className="text-ink font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pt-6">{children}</div>

        {footnote && (
          <AppText
            type="caption"
            className="text-muted-foreground mt-8 block border-t border-slate-200 pt-4 text-xs"
          >
            {footnote}
          </AppText>
        )}
      </article>
    </div>
  );
};

interface LinesProps {
  rows: { key: string; cells: React.ReactNode[] }[];
  headers: string[];
  totals: { label: string; value: string; strong?: boolean }[];
}

export const DocumentLines = function ({ rows, headers, totals }: LinesProps) {
  return (
    <div>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-slate-200 text-xs font-semibold tracking-wide uppercase">
            {headers.map((header, index) => (
              <th
                key={header}
                className={cn(
                  "pb-2 font-semibold",
                  index === headers.length - 1 && "text-right",
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 align-top">
              {row.cells.map((cell, index) => (
                <td
                  key={index}
                  className={cn(
                    "py-2.5 pr-3",
                    index === row.cells.length - 1 &&
                      "pr-0 text-right font-medium whitespace-nowrap",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto w-full max-w-xs space-y-1.5">
        {totals.map((total) => (
          <div
            key={total.label}
            className={cn(
              "flex justify-between gap-3 text-sm",
              total.strong &&
                "text-ink border-t border-slate-200 pt-2 text-base font-semibold",
            )}
          >
            <dt className={total.strong ? "" : "text-muted-foreground"}>
              {total.label}
            </dt>
            <dd className="font-medium">{total.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
