/** @format */

import toast from "react-hot-toast";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// import { ChromeProfile } from "./use-chromes";
// Định nghĩa interface cho settings

export interface LiveStreamInfo {
  id: string;
  linkLive: string;
  name: string;
  comments: string;
  delay: number;
  acceptDupplicateComment: boolean;
}

export interface LiveStreamStore {
  items: LiveStreamInfo[];
  update: (data: LiveStreamInfo) => void;

  addItem: (data: LiveStreamInfo) => Promise<void>;
  getItemWithID: (id: string) => LiveStreamInfo;
  reset: () => void;
}

const useLiveStreamStore = create(
  persist<LiveStreamStore>(
    (set, get) => ({
      items: [],

      update: (data: LiveStreamInfo) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          ),
        }));
      },
      getItemWithID: (id: string) => {
        return get().items.find((item) => item.id === id);
      },
      addItem: async (data: LiveStreamInfo) => {
        const currentItems = get().items;
        const existItem = currentItems.find((item) => item.id === data.id);
        if (existItem) {
          toast.error("Đã tồn tại live này !!!");
          return;
        }
        set({ items: [...currentItems, data] });
        toast.success("Đã tạo seeding cho livestream này !!");
      },
      reset: () => {
        set({ items: [] });
      },
    }),

    {
      name: "livestream-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export default useLiveStreamStore;
