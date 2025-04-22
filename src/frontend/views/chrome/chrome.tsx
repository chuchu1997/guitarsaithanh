/** @format */

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const ChromeView = () => {
  const location = useLocation();
  const isCreateOrEdit =
    location.pathname === "/chrome/create" ||
    location.pathname.startsWith("/chrome/edit");

  return (
    <div>
      <div className="flex justify-between items-center">
        <div></div>
        {!isCreateOrEdit && (
          <Link to="create">
            <Button className="text-sm sm:text-base font-medium">
              <Plus /> Tạo mới Profile
            </Button>
          </Link>
        )}
      </div>
      {/* Chỉ render nội dung của route con ở đây */}
      <Outlet />
    </div>
  );
};

export default ChromeView;
