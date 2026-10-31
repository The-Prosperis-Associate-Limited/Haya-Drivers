import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during SSR and hydration, true afterwards - for markup that depends on client-only cache.
export const useIsClient = function () {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
};
