"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { useHandleErrors } from "@/lib/handle-errors";
import { showToast } from "@/lib/show-toast";
import type { APIResponse } from "@/types/response";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  userId: string;
  name: string;
  backHref: string;
  anonymisedAt: string | null;
}

// Deletion is super-admin only on the server; anyone else gets the 403 toast.
export const DeleteAccountButton = function ({
  userId,
  name,
  backHref,
  anonymisedAt,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const handleErrors = useHandleErrors();

  const { mutate, isPending } = useSubmitData<
    object,
    APIResponse<{ id: string; outcome: "DELETED" | "ANONYMISED" }>
  >({
    url: API_ENDPOINTS.adminUsers.remove(userId),
    method: "delete",
    silent: true,
    onError: handleErrors,
    onSuccess: (response) => {
      showToast("success", response.message);
      router.push(backHref);
    },
  });

  if (anonymisedAt) {
    return (
      <span className="text-muted-foreground bg-muted shrink-0 rounded-lg px-3 py-2 text-sm">
        Deleted {new Date(anonymisedAt).toLocaleDateString()} - personal data
        erased
      </span>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="text-destructive border-destructive/40 h-10 shrink-0 rounded-lg px-4 text-sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </Button>

      <ConfirmDialog
        isOpen={open}
        onOpenChange={setOpen}
        icon={Trash2}
        iconClassName="text-destructive"
        title={`Delete ${name}'s account?`}
        description="An account with no bookings is removed entirely. One with booking history is anonymised instead: their personal details, profile and documents are erased, while the bookings and payments the other party relies on are kept. Either way it cannot be undone, and they can sign up again with the same email - suspend instead to keep someone off the platform."
        confirmLabel="Delete permanently"
        confirmVariant="destructive"
        isLoading={isPending}
        onConfirm={() => mutate({})}
      />
    </>
  );
};
