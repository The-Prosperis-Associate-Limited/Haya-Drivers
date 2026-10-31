import { useGetData } from "./use-get-data";
import { useSubmitData } from "./use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse, PaginatedResponse } from "@/types/response";
import type { Ticket, TicketCategory, TicketPriority } from "@/types/ticket";

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

const listUrl = API_ENDPOINTS.tickets.list({ page: 1, limit: 20 });

export const useTickets = function (shouldFetch = true) {
  const { data, isFetching } = useGetData<PaginatedResponse<Ticket>>({
    url: listUrl,
    shouldFetch,
  });

  return { tickets: data?.data ?? [], isFetching };
};

export const useTicket = function (id: string | null) {
  const { data, isFetching } = useGetData<APIResponse<Ticket>>({
    url: id ? API_ENDPOINTS.tickets.get(id) : "",
    shouldFetch: !!id,
  });

  return { ticket: data?.data, isFetching };
};

export const useCreateTicket = function ({
  onSuccessMessage,
  onSuccess,
}: {
  onSuccessMessage: string;
  onSuccess?: (ticket: Ticket) => void;
}) {
  const { mutate, isPending } = useSubmitData<
    CreateTicketPayload,
    APIResponse<Ticket>
  >({
    url: API_ENDPOINTS.tickets.create,
    method: "post",
    onSuccessMessage,
    onSuccess: (response) => onSuccess?.(response.data),
  });

  return { createTicket: mutate, isPending };
};

export const useCommentOnTicket = function (id: string | null) {
  const { mutate, isPending } = useSubmitData<{ message: string }>({
    url: () => (id ? API_ENDPOINTS.tickets.comment(id) : ""),
    method: "post",
    onSuccessMessage: "Message sent",
  });

  return { sendMessage: mutate, isPending };
};
