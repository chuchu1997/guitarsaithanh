/** @format */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Định nghĩa interface cho settings
export interface SettingsStore {
  profilePath: string;
  soundPath: string;
  updateProfilePath: (path: string) => void;
  updateSoundPath: (path: string) => void;
  resetSettings: () => void;
}

const useSettings = create(
  persist<SettingsStore>(
    (set, get) => ({
      profilePath: "", // Giá trị mặc định cho đường dẫn Profile
      soundPath: "", // Giá trị mặc định cho đường dẫn Sound

      // Cập nhật đường dẫn Profile
      updateProfilePath: (path: string) => {
        set({ profilePath: path });
      },

      // Cập nhật đường dẫn Sound
      updateSoundPath: (path: string) => {
        console.log("CO GOI MA");
        set({ soundPath: path });
      },

      // Reset lại tất cả cài đặt về mặc định
      resetSettings: () => {
        set({ profilePath: "", soundPath: "" });
      },
    }),
    {
      name: "user-settings", // Tên key lưu trong localStorage
      storage: createJSONStorage(() => localStorage), // Dùng localStorage để lưu trữ
    }
  )
);

export default useSettings;
