"use client";

import { AppText } from "@/components/shared/app-text";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";
import { useState } from "react";
import type { AttendanceFlag, FlagResolution } from "@/types/attendance";
import { BookingAttendanceDialog } from "./_components/booking-attendance-dialog";
import { FlagCard } from "./_components/flag-card";
import { ResolveFlagDialog } from "./_components/resolve-flag-dialog";

type Status = "open" | "resolved";

interface FlagsPayload {
  data: AttendanceFlag[];
  total: number;
  totalPages: number;
  counts: Record<Status, number>;
}

const TABS: { value: Status; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminAttendance() {
  const [status, setStatus] = useState<Status>("open");
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<{
    flag: AttendanceFlag;
    outcome: FlagResolution;
  } | null>(null);
  const [viewing, setViewing] = useState<AttendanceFlag | null>(null);

  const listUrl = API_ENDPOINTS.adminAttendance.flags({
    page,
    limit: 10,
    status,
  });

  const { data, isFetching } = useGetData<FlagsPayload>({ url: listUrl });

  const flags = data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <AppText type="h2" className="text-xl font-bold md:text-2xl">
          Attendance
        </AppText>
        <AppText type="subtitle" className="text-muted-foreground text-sm">
          Days clients have flagged. Check the month, then uphold or dismiss -
          the client and driver both see your note.
        </AppText>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              status === tab.value
                ? "bg-brand text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {tab.label}
            {data?.counts && (
              <span className="ml-1.5 opacity-70">
                {data.counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isFetching && !flags.length ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={status === "open" ? "No open flags" : "Nothing resolved yet"}
          description={
            status === "open"
              ? "When a client flags a driver's check-in, it lands here for review."
              : "Flags you uphold or dismiss are kept here."
          }
        />
      ) : (
        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          total={data?.total ?? 0}
          onPageChange={setPage}
          isLoading={isFetching}
        >
          <div className="space-y-3">
            {flags.map((flag) => (
              <FlagCard
                key={flag.id}
                flag={flag}
                onResolve={(target, outcome) =>
                  setResolving({ flag: target, outcome })
                }
                onViewMonth={setViewing}
              />
            ))}
          </div>
        </Pagination>
      )}

      <ResolveFlagDialog
        flag={resolving?.flag ?? null}
        outcome={resolving?.outcome ?? "DISMISSED"}
        onClose={() => setResolving(null)}
        listUrl={listUrl}
      />

      <BookingAttendanceDialog
        reference={viewing?.booking.reference ?? null}
        initialMonth={viewing?.work_date.slice(0, 7)}
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
