import { create } from "zustand";

interface SupportSheetState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// The client top bar owns the sheet; anything on the page can open it through here.
export const useSupportSheet = create<SupportSheetState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
