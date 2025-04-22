/** @format */

import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
const SoundBoardView = () => {
  const location = useLocation();
  const isCreateOrEdit =
    location.pathname === "/sound/create" ||
    location.pathname.startsWith("/sound/edit");
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10">
      <div className="text-center space-y-2 mb-6">
        <div className="flex justify-end">
          {!isCreateOrEdit && (
            <Link to="create">
              <Button className="text-sm sm:text-base font-medium">
                <Plus /> Tạo âm thanh mới
              </Button>
            </Link>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Âm Thanh Livestream
        </h1>
        <p className="text-gray-600">
          Chọn âm thanh theo thể loại và nhấn để phát trong lúc livestream.
        </p>
      </div>
      <Outlet />
    </div>
  );
};

export default SoundBoardView;
