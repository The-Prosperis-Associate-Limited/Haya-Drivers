"use client";

import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { AppText } from "@/components/shared/app-text";
import { AppAvatar } from "@/components/shared/app-avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLE_OPTIONS,
  personName,
  statusBadgeClass,
  statusLabel,
} from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatRelativeTime } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PaginatedResponse } from "@/types/response";
import type { AdminRole, TeamMember } from "@/types/admin";
import { InviteAdminDialog } from "./invite-admin-dialog";

export const TeamTab = function () {
  const { profile } = useGetProfile();
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [suspending, setSuspending] = useState<TeamMember | null>(null);

  const teamUrl = API_ENDPOINTS.adminTeam.list({ page, limit: 10 });

  const { data, isFetching } = useGetData<PaginatedResponse<TeamMember>>({
    url: teamUrl,
  });

  const rows = data?.data ?? [];

  const { mutate: changeRole } = useSubmitData<{
    id: string;
    admin_role: AdminRole;
  }>({
    url: ({ id }) => API_ENDPOINTS.adminTeam.role(id),
    getBody: ({ admin_role }) => ({ admin_role }),
    method: "patch",
    onSuccessMessage: "Admin role updated",
  });

  const { mutate: setStatus, isPending: isSettingStatus } = useSubmitData<{
    id: string;
    action: "suspend" | "reactivate";
  }>({
    url: ({ id, action }) =>
      action === "suspend"
        ? API_ENDPOINTS.adminTeam.suspend(id)
        : API_ENDPOINTS.adminTeam.reactivate(id),
    getBody: () => ({}),
    method: "patch",
    onSuccessMessage: "Admin updated",
    onSuccess: () => setSuspending(null),
  });

  const { mutate: removeAdmin, isPending: isRemoving } = useSubmitData<{
    id: string;
  }>({
    url: ({ id }) => API_ENDPOINTS.adminTeam.remove(id),
    method: "delete",
    onSuccessMessage: "Admin removed",
    onSuccess: () => setRemoving(null),
  });

  const onAction = (member: TeamMember, action: string) => {
    if (action === "suspend") setSuspending(member);
    if (action === "reactivate")
      setStatus({ id: member.id, action: "reactivate" });
    if (action === "remove") setRemoving(member);
  };

  return (
    <div className="border-border rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <AppText
            type="label"
            className="text-foreground font-semibold tracking-wide uppercase"
          >
            All admin accounts
          </AppText>
          <AppText type="caption" className="text-muted-foreground block">
            Who can access this console, and with what role.
          </AppText>
        </div>

        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        total={data?.total}
        isLoading={isFetching}
      >
        {!rows.length ? (
          <EmptyState title="No admins yet" />
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full text-sm [&_td:first-child]:pl-3 [&_th]:py-2.5 [&_th:first-child]:pl-3">
                <thead>
                  <tr className="bg-slate-50 text-left text-[11.5px] font-semibold tracking-wide text-slate-500 uppercase">
                    <th className="py-3 pr-4 font-medium">Admin</th>
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Last active</th>
                    <th className="py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {rows.map((member) => {
                    const isSelf = member.id === profile?.id;
                    // Pre-roles admins have no profile row and count as supers.
                    const role =
                      member.admin_profile?.admin_role ?? "SUPER_ADMIN";

                    return (
                      <tr key={member.id}>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-3">
                            <AppAvatar
                              src={member.profile_pic ?? undefined}
                              fallback={personName(member)}
                              className="h-9 w-9"
                            />
                            <span className="min-w-0">
                              <span className="block font-medium">
                                {personName(member)}
                                {isSelf && (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    (you)
                                  </span>
                                )}
                              </span>
                              <span className="text-muted-foreground block truncate text-xs">
                                {member.email}
                              </span>
                            </span>
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {isSelf ? (
                            <StatusBadge
                              label={ADMIN_ROLE_LABELS[role]}
                              className="border-brand/30 bg-brand-soft text-brand"
                            />
                          ) : (
                            <AppSimpleSelect
                              options={ADMIN_ROLE_OPTIONS}
                              value={role}
                              onValueChange={(value) =>
                                changeRole({
                                  id: member.id,
                                  admin_role: value as AdminRole,
                                })
                              }
                              containerClassName="w-[160px]"
                            />
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge
                            label={statusLabel(member.account_status)}
                            className={statusBadgeClass(member.account_status)}
                          />
                        </td>
                        <td className="text-muted-foreground py-3 pr-4">
                          {member.admin_profile?.last_active_at
                            ? formatRelativeTime(
                                member.admin_profile.last_active_at,
                              )
                            : "-"}
                        </td>
                        <td className="py-3 text-right">
                          {!isSelf && (
                            <AppSimpleSelect
                              triggerVariant="ellipsis"
                              options={[
                                member.account_status === "ACTIVE"
                                  ? { value: "suspend", label: "Suspend Admin" }
                                  : {
                                      value: "reactivate",
                                      label: "Reactivate Admin",
                                    },
                                { value: "remove", label: "Remove admin" },
                              ]}
                              onValueChange={(action) =>
                                onAction(member, action)
                              }
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3 md:hidden">
              {rows.map((member) => {
                const isSelf = member.id === profile?.id;
                const role = member.admin_profile?.admin_role ?? "SUPER_ADMIN";

                return (
                  <div
                    key={member.id}
                    className="border-border rounded-xl border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 text-sm font-medium">
                        {personName(member)}
                        {isSelf && (
                          <span className="text-muted-foreground"> (you)</span>
                        )}
                      </span>
                      {!isSelf && (
                        <AppSimpleSelect
                          triggerVariant="ellipsis"
                          options={[
                            member.account_status === "ACTIVE"
                              ? { value: "suspend", label: "Suspend Admin" }
                              : {
                                  value: "reactivate",
                                  label: "Reactivate Admin",
                                },
                            { value: "remove", label: "Remove admin" },
                          ]}
                          onValueChange={(action) => onAction(member, action)}
                        />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {member.email}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        label={ADMIN_ROLE_LABELS[role]}
                        className="border-brand/30 bg-brand-soft text-brand"
                      />
                      <StatusBadge
                        label={statusLabel(member.account_status)}
                        className={statusBadgeClass(member.account_status)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Pagination>

      <InviteAdminDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />

      <ConfirmDialog
        isOpen={!!suspending}
        onOpenChange={(open) => !open && setSuspending(null)}
        title={`Suspend ${suspending ? personName(suspending) : "this admin"}?`}
        description="They are signed out everywhere immediately and cannot sign back in until reactivated."
        confirmLabel="Suspend Admin"
        confirmVariant="destructive"
        isLoading={isSettingStatus}
        onConfirm={() =>
          suspending && setStatus({ id: suspending.id, action: "suspend" })
        }
      />

      <ConfirmDialog
        isOpen={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing ? personName(removing) : "this admin"}?`}
        description="Their account is deleted permanently. This cannot be undone."
        confirmLabel="Remove Admin"
        confirmVariant="destructive"
        icon={Trash2}
        iconClassName="text-destructive"
        isLoading={isRemoving}
        onConfirm={() => removing && removeAdmin({ id: removing.id })}
      />
    </div>
  );
};
