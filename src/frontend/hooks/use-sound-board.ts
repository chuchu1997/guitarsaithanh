/** @format */

import toast from "react-hot-toast";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SoundBoardInfo {
  id: string;
  name: string;
  category: string;
  pathSound: string;
}
export interface CategorySound {
  name: string;
  value: string;
}
export const CategorySoundData: CategorySound[] = [
  { name: "Tương tác", value: "tuongtac" },
  { name: "Thanh lý", value: "thanhly" },
  { name: "DIY", value: "diy" },
  { name: "ST X1 Pro", value: "st-x1-pro" },
  { name: "X1 Pro", value: "x1-pro" },
  { name: "X2", value: "x2" },
  { name: "X4", value: "x4" },
  { name: "X7", value: "x7" },
  { name: "Sata", value: "sata" },
];

export interface SoundBoardStore {
  items: SoundBoardInfo[];
  addItem: (data: SoundBoardInfo) => void;
  deleteItem: (name: string) => void;
}
const useSoundBoardStore = create(
  persist<SoundBoardStore>(
    (set, get) => ({
      items: [],
      deleteItem: (name: string) => {
        const currentItems = get().items;
        const newItems = currentItems.filter((item) => item.name !== name);
        set({ items: newItems });
        toast.success("Đã xoá sound!");
      },
      addItem: (data: SoundBoardInfo) => {
        const currentItems = get().items;
        const existItem = currentItems.find((item) => item.id === data.id);
        if (existItem) {
          toast.error("Đã tồn tại sound này  !!!");
          return;
        }
        set({ items: [...currentItems, data] });
        toast.success("Đã tạo sound này !!");
      },
    }),

    {
      name: "sound-board-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useSoundBoardStore;
