"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppText } from "@/components/shared/app-text";
import { FormInput } from "@/components/form/form-input";
import { FormSelect } from "@/components/form/form-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { ADMIN_ROLE_LABELS, ADMIN_ROLE_OPTIONS } from "@/lib/admin";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { APIResponse } from "@/types/response";
import type { AdminRole, InviteResult } from "@/types/admin";

const inviteSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the admin's full name"),
  email: z.email("Enter a valid email address"),
  admin_role: z.enum([
    "SUPER_ADMIN",
    "FLEET_MANAGER",
    "FINANCE_OFFICER",
    "SUPPORT_AGENT",
    "READ_ONLY",
  ]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteAdminDialog = function ({ isOpen, onOpenChange }: Props) {
  const [result, setResult] = useState<InviteResult | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({ resolver: zodResolver(inviteSchema) });

  const { mutate: invite, isPending } = useSubmitData<
    InviteFormValues,
    APIResponse<InviteResult>
  >({
    url: API_ENDPOINTS.adminTeam.invite,
    method: "post",
    onSuccessMessage: "Invite sent successfully",
    onSuccess: (data) => {
      setResult(data.data);
      reset();
    },
  });

  const close = () => {
    setResult(null);
    reset();
    onOpenChange(false);
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    showToast("success", `${label} copied`);
  };

  return (
    <AppDialog
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(open) : close())}
      title={result ? "Share the credentials" : "Invite admin"}
      description={
        result
          ? "The invite email carries only a sign-in link - the password below is shown once and never again."
          : "They'll get an email invitation and a temporary password you share with them securely."
      }
      width="520px"
      dialogFooter={
        result ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <div className="flex w-full justify-end gap-3">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              isLoading={isPending}
              onClick={handleSubmit((data) => invite(data))}
            >
              Send Invite
            </Button>
          </div>
        )
      }
    >
      {result ? (
        <div className="space-y-4">
          <div className="border-border flex items-center justify-between gap-3 rounded-xl border p-3">
            <div className="min-w-0">
              <AppText type="caption" className="block font-semibold">
                {[result.admin.first_name, result.admin.last_name]
                  .filter(Boolean)
                  .join(" ")}
              </AppText>
              <AppText type="caption" className="text-muted-foreground block">
                {result.admin.email}
              </AppText>
            </div>
            <StatusBadge
              label={ADMIN_ROLE_LABELS[result.admin.admin_role as AdminRole]}
              className="border-brand/30 bg-brand-soft text-brand shrink-0"
            />
          </div>

          <div className="space-y-3">
            {[
              { label: "Email", value: result.admin.email },
              {
                label: "Temporary password",
                value: result.temporary_password,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <AppText
                    type="caption"
                    className="text-muted-foreground block text-xs uppercase"
                  >
                    {row.label}
                  </AppText>
                  <AppText
                    type="caption"
                    className="block truncate font-mono font-semibold"
                  >
                    {row.value}
                  </AppText>
                </div>
                <button
                  type="button"
                  onClick={() => copy(row.value, row.label)}
                  className="text-brand hover:bg-brand-soft cursor-pointer rounded-md p-2"
                  aria-label={`Copy ${row.label}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <AppText
            type="caption"
            className="block rounded-lg bg-amber-50 p-3 text-amber-800"
          >
            Share these credentials securely - not via email. The temporary
            password expires after first use and must be changed immediately on
            login.
          </AppText>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit((data) => invite(data))}
          className="space-y-4"
        >
          <FormInput<InviteFormValues>
            control={control}
            name="full_name"
            errors={errors}
            label="Full name"
            placeholder="E.g John Doe"
          />
          <FormInput<InviteFormValues>
            control={control}
            name="email"
            errors={errors}
            label="Email address"
            placeholder="E.g johndoe@gmail.com"
            type="email"
          />
          <FormSelect<InviteFormValues>
            control={control}
            name="admin_role"
            errors={errors}
            label="Assign role"
            placeholder="E.g Support Agent"
            options={ADMIN_ROLE_OPTIONS}
          />
        </form>
      )}
    </AppDialog>
  );
};
