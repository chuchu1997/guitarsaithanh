/** @format */

import { create } from "zustand";

// Định nghĩa interface cho settings
export interface ExcuteStore {
  isLoading: boolean;
  messageExcute: string;
  setLoading: (value: boolean) => void;
  setMessageExcute: (value: string) => void;
  stopSeedingBtn?: boolean;
}

const useExcuteStore = create<ExcuteStore>((set) => ({
  messageExcute: "",
  isLoading: false,
  stopSeedingBtn: true,
  setMessageExcute: (value) => {
    set({ messageExcute: value });
  },
  setLoading(value) {
    set({ isLoading: value });
  },
}));

export default useExcuteStore;
