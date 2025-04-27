/** @format */

import { Button } from "@/components/ui/button";
import useChromeStore, { ChromeProfile } from "@/hooks/use-chromes";
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
    for (let i = 1; i <= 12; i++) {
      // Dùng từ 1 đến 10
      const profile: ChromeProfile = {
        isOpen: false,
        id: uuidv4(),
        username: generateMeaningfulUsername(i),
        proxy: "", // Thêm proxy nếu cần
        pathProfile: settingStore.profilePath,
      };

      await chromeStore.addItem(profile);
    }
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
              }}
            >
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
