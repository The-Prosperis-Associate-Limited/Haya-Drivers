import type { AdminRole } from "@/types/admin";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  FLEET_MANAGER: "Fleet Manager",
  FINANCE_OFFICER: "Finance Officer",
  SUPPORT_AGENT: "Support Agent",
  READ_ONLY: "Read only",
};

export const ADMIN_CARD =
  "border-border rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

export const ADMIN_TABLE_HEAD =
  "bg-slate-50 text-left text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase";

export const ADMIN_ROLE_OPTIONS = (
  Object.entries(ADMIN_ROLE_LABELS) as [AdminRole, string][]
).map(([value, label]) => ({ value, label }));

// Naming a person: "first last", falling back to the email's local part.
export const personName = (person: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}) =>
  [person.first_name, person.last_name].filter(Boolean).join(" ") ||
  person.email?.split("@")[0] ||
  "-";

// A client is addressed by its organisation name when it has one.
export const clientName = (client: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  client_profile?: { organisation_name: string | null } | null;
}) => client.client_profile?.organisation_name || personName(client);

// No stored Haya Drivers ID exists - this is a stable display form of the record id,
// not a second identifier.
export const tegatDisplayId = (userId: string, role: "DRIVER" | "CLIENT") =>
  `TG-${role === "DRIVER" ? "DRV" : "CLT"}-${userId.slice(-4).toUpperCase()}`;

// One palette for every status badge on the console - green for settled
// states, orange for in-flight, red for refusals.
export const STATUS_BADGE_CLASSES: Record<string, string> = {
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAID_OUT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PROCESSING: "border-amber-200 bg-amber-50 text-amber-700",
  REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-700",
  SUSPENDED: "border-amber-200 bg-amber-50 text-amber-700",
  UNSUBMITTED: "border-slate-200 bg-slate-50 text-slate-600",
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  ABANDONED: "border-slate-200 bg-slate-50 text-slate-600",
  DEACTIVATED: "border-slate-200 bg-slate-50 text-slate-600",
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-600",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REVERSED: "border-red-200 bg-red-50 text-red-700",
};

export const statusBadgeClass = (status: string) =>
  STATUS_BADGE_CLASSES[status] ?? "border-slate-200 bg-slate-50 text-slate-600";

export const statusLabel = (status: string) =>
  status.toLowerCase().replace(/_/g, " ");

// Rows → CSV → browser download. Small exports only, built in memory.
export const downloadCsv = function (
  filename: string,
  header: string[],
  rows: (string | number)[][],
) {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const csv = [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
