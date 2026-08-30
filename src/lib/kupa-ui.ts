import { create } from "zustand";
import { currentMonth } from "./kupa";

type KupaUi = {
  month: string;
  setMonth: (month: string) => void;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
};

export const useKupaUi = create<KupaUi>((set) => ({
  month: currentMonth(),
  setMonth: (month) => set({ month }),
  addOpen: false,
  setAddOpen: (addOpen) =>
    set(addOpen ? { addOpen: true } : { addOpen: false, editingId: null }),
  editingId: null,
  setEditingId: (editingId) =>
    set({ editingId, addOpen: editingId != null }),
}));
