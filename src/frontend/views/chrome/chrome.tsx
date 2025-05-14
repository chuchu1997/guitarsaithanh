/** @format */

import { Button } from "@/components/ui/button";
import useChromeStore, { ChromeProfile } from "@/hooks/use-chromes";
import useExcuteStore from "@/hooks/use-excute";
import useSettings from "@/hooks/use-settings";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const ChromeView = () => {
  const location = useLocation();
  const isCreateOrEdit =
    location.pathname === "/chrome/create" ||
    location.pathname.startsWith("/chrome/edit");
  const chromeStore = useChromeStore();
  const settingStore = useSettings();
  const excuteStore = useExcuteStore();

  const [isloading, setLoading] = useState(false);

  function generateMeaningfulUsername(index: number): string {
    const prefixes = ["User", "Admin", "Member"]; // Các tiền tố có ý nghĩa
    const suffixLength = 6; // Độ dài phần ngẫu nhiên
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Chọn ngẫu nhiên một tiền tố
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    // Tạo phần ngẫu nhiên của username
    let randomSuffix = "";
    for (let i = 0; i < suffixLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomSuffix += characters[randomIndex];
    }

    // Kết hợp tiền tố và phần ngẫu nhiên
    return `${randomPrefix}_${randomSuffix}${index}`; // Thêm số thứ tự vào cuối
  }
  const handleCreateTenProfile = async () => {
    setLoading(true);
    excuteStore.setLoading(true);
    excuteStore.setMessageExcute("Đang tự tạo 10 Profile ngẫu nhiên ");
    const promises: Promise<void>[] = [];

    for (let i = 1; i <= 12; i++) {
      const profile: ChromeProfile = {
        isOpen: false,
        id: uuidv4(),
        username: generateMeaningfulUsername(i),
        proxy: "",
        pathProfile: settingStore.profilePath,
      };

      // Không await, mà push vào mảng
      promises.push(chromeStore.addItem(profile));
    }

    // Đợi tất cả profile được thêm xong cùng lúc
    await Promise.all(promises);
    excuteStore.setLoading(false);
    setLoading(false);
  };
  return (
    <div>
      <div className="flex justify-end items-center">
        <div className="gap-x-4 flex">
          {!isCreateOrEdit && (
            <Link to="create">
              <Button className="italic bg-gradient-to-r from-[#0f172a]  to-[#334155] text-white font-semibold text-sm sm:text-base py-2 px-5 rounded-lg shadow-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl flex items-center gap-x-2">
                <Plus size={18} /> Tạo mới Profile
              </Button>
            </Link>
          )}
          {!isCreateOrEdit && (
            <Button
              disabled={isloading}
              onClick={handleCreateTenProfile}
              className="italic bg-gradient-to-r from-[#0f172a]  to-[#334155] text-white font-semibold text-sm sm:text-base py-2 px-5 rounded-lg shadow-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl flex items-center gap-x-2">
              <Plus size={18} />
              Tạo 10 Profile
            </Button>
            // <Button
            //   disabled={isloading}
            //   className="bg-gradient-to-r inline-block from-yellow-600 via-amber-600 to-yellow-400 text-white font-semibold text-sm sm:text-base py-2 px-5 rounded-lg shadow-md transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl flex items-center gap-x-20"
            //   onClick={() => {
            //     handleCreateTenProfile();
            //   }}>
            //   <Plus size={18} /> Tạo mới Profile Ngẫu Nhiên Nhiều Profile (10)
            // </Button>
          )}
        </div>
      </div>
      {/* Chỉ render nội dung của route con ở đây */}
      <Outlet />
    </div>
  );
};

export default ChromeView;
