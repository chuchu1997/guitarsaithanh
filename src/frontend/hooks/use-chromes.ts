/** @format */

import toast from "react-hot-toast";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// Định nghĩa interface cho settings

export interface ChromeProfile {
  id: string;
  username: string;
  proxy: string;
  pathProfile: string;
}

export interface ChromeStore {
  items: ChromeProfile[];
  addItem: (data: ChromeProfile) => Promise<void>;
  updateItem: (data: ChromeProfile) => void;
  removeItem: (id: string) => void;
  getChromeProfileWithID: (id: string) => ChromeProfile;
}

const useChromeStore = create(
  persist<ChromeStore>(
    (set, get) => ({
      items: [],
      getChromeProfileWithID: (id: string) => {
        return get().items.find((item) => item.id === id);
      },
      addItem: async (data: ChromeProfile) => {
        const pathChromeProfile = await backend.createChromeProfile(
          data.username,
          data.pathProfile
        );
        if (pathChromeProfile) {
          data.pathProfile = pathChromeProfile;
          const currentItems = get().items;
          const existItem = currentItems.find(
            (item) => item.username === data.username
          );
          if (existItem) {
            toast.error("Profile này đã có trong danh sách không thể tạo !!");
            return;
          }

          set({ items: [...currentItems, data] });
          toast.success("Đã tạo profile này !!");
        }
      },
      updateItem: async (data: ChromeProfile) => {
        const updateItems = get().items.map((item) => {
          if (item.id === data.id) {
            return data;
          }
          return item;
        });
        set({ items: updateItems });
        toast.success("Đã cập nhật thông tin của Profile");
      },
      removeItem: async (id: string) => {
        const itemToDelete = get().items.find((item) => item.id === id);
        await backend.deleteChromeProfile(itemToDelete.pathProfile);
        const newItems = get().items.filter((item) => item.id !== id);
        set({ items: newItems });
        toast.success("Đã xóa profile");
      },
    }),
    {
      name: "chrome-profiles-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export default useChromeStore;
