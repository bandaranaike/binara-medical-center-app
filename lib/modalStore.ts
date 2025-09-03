import { create } from "zustand";
import { ReactNode } from "react";

type ModalState = {
    node: ReactNode | null;
    open: (node: ReactNode) => void;
    close: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
    node: null,
    open: (node) => set({ node }),
    close: () => set({ node: null }),
}));