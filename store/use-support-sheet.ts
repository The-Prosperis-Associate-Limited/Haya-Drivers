import { create } from "zustand";

interface SupportSheetState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// The floating support widget reads this; anything on the page (the overview's "Talk to our team" card) can open it.
export const useSupportSheet = create<SupportSheetState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
