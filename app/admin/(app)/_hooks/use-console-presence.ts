import { getChatSocket } from "@/lib/chat-socket";
import { queryClient } from "@/lib/utils";
import { useEffect } from "react";

// Opening the socket from the shell is what puts an admin in the support pool, so "Team on shift" means "has the console open".
export const useConsolePresence = function () {
  useEffect(() => {
    const socket = getChatSocket();
    if (!socket) return;

    const refresh = () =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          String(query.queryKey[0]).startsWith("/admin/dashboard/"),
      });

    socket.on("support-notification", refresh);
    socket.on("presence-changed", refresh);

    return () => {
      socket.off("support-notification", refresh);
      socket.off("presence-changed", refresh);
    };
  }, []);
};
