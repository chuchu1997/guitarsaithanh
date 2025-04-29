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
              <Button className="text-sm sm:text-base font-medium">
                <Plus /> Tạo mới Profile
              </Button>
            </Link>
          )}
          {!isCreateOrEdit && (
            <Button
              disabled={isloading}
              className="text-sm sm:text-base font-medium"
              onClick={() => {
                handleCreateTenProfile();
              }}>
              <Plus /> Tạo mới Profile Ngẫu Nhiên Nhiều Profile (10)
            </Button>
          )}
        </div>
      </div>
      {/* Chỉ render nội dung của route con ở đây */}
      <Outlet />
    </div>
  );
};

export default ChromeView;
