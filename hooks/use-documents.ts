import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import type { DocumentsResponse, DriverDocument } from "@/types/driver";

export const useGetDocuments = function () {
  const { data, isFetching, refetch } = useGetData<
    APIResponse<DocumentsResponse>
  >({
    url: API_ENDPOINTS.driverOnboarding.documents,
  });

  return {
    documents: data?.data.documents ?? [],
    missing: data?.data.missing ?? [],
    isFetching,
    refetch,
  };
};

export const useUploadDocument = function ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { mutate, isPending } = useSubmitData<
    FormData,
    APIResponse<DriverDocument>
  >({
    url: API_ENDPOINTS.driverOnboarding.documents,
    method: "post",
    onSuccessMessage: "Document uploaded",
    onSuccess: () => onSuccess?.(),
  });

  return { uploadDocument: mutate, isPending };
};

export const useDeleteDocument = function () {
  const { mutate, isPending } = useSubmitData<
    { id: string },
    APIResponse<{ id: string }>
  >({
    url: (data) => API_ENDPOINTS.driverOnboarding.deleteDocument(data.id),
    method: "delete",
    onSuccessMessage: "Document removed",
  });

  return { deleteDocument: mutate, isPending };
};
