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
  isOpen: boolean;
}

export interface ChromeStore {
  items: ChromeProfile[];
  addItem: (data: ChromeProfile) => Promise<void>;
  updateItem: (data: ChromeProfile) => void;
  removeItem: (id: string) => void;
  getChromeProfileWithID: (id: string) => ChromeProfile;
  openChromeProfile: (
    id: string,
    totalProfile?: number,
    headless?: boolean
  ) => void;
  closeChromeProfile: (id: string) => Promise<void>;
  closeChromeProfileManual: (id: string) => void;

  resetStateChromeProfile: () => void;
}

const useChromeStore = create(
  persist<ChromeStore>(
    (set, get) => ({
      items: [],
      resetStateChromeProfile: () => {
        set((state) => ({
          items: state.items.map((item) => ({
            ...item,
            isOpen: false,
            injectLiveStreamID: "",
          })),
        }));
      },
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

      openChromeProfile: async (
        id: string,
        totalProfile?: number,
        headless?: boolean
      ) => {
        const store = get();
        const targetProfile = store.items.find((item) => item.id === id);

        let updatedProfile; // 👈 clone và thay đổi

        try {
          if (targetProfile && !targetProfile.isOpen) {
            const result = await backend.openChromeWithProfile({
              id: targetProfile.id,
              profilePath: targetProfile.pathProfile,
              proxy: targetProfile.proxy,
              headless: headless,

              // targetProfile.id,
              // targetProfile.pathProfile,
              // targetProfile.proxy,
              // "",
              // totalProfile,
              // headless
            });

            updatedProfile = {
              ...targetProfile,
              isOpen: result != "" ? true : false,
            };
            store.updateItem(updatedProfile); // 👈 trigger update

            return updatedProfile;
          }
        } catch (err) {
          updatedProfile = { ...targetProfile, isOpen: false };
          store.updateItem(updatedProfile); // 👈 trigger update
        }
      },
      closeChromeProfile: async (id: string) => {
        const store = get();
        await backend.closeChrome(id); // result: boolean = true/false

        const targetProfile = store.items.find((item) => item.id === id);
        if (!targetProfile) return;

        const updatedProfile = { ...targetProfile, isOpen: false }; // ✅ không mutate

        store.updateItem(updatedProfile); // ✅ trigger update trong Zustand
      },
      closeChromeProfileManual(id) {
        const store = get();

        const targetProfile = store.items.find((item) => item.id === id);
        if (!targetProfile) return;

        const updatedProfile = {
          ...targetProfile,
          isOpen: false,
          injectLiveID: "",
        }; // ✅ không mutate
        store.updateItem(updatedProfile); // ✅ trigger update trong Zustand
      },
      updateItem: async (data: ChromeProfile) => {
        const updateItems = get().items.map((item) => {
          if (item.id === data.id) {
            return data;
          }
          return item;
        });
        set({ items: updateItems });
      },
      removeItem: async (id: string) => {
        const itemToDelete = get().items.find((item) => item.id === id);
        await backend.deleteChromeProfile(itemToDelete.pathProfile);
        const newItems = get().items.filter((item) => item.id !== id);
        set({ items: newItems });
      },
    }),
    {
      name: "chrome-profiles-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export default useChromeStore;
