/** @format */

import { DataTable } from "@/components/ui/data-table";

import { ChromeColumn, columns } from "../components/column";

import useChromeStore, { ChromeProfile } from "@/hooks/use-chromes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronDown, Chrome, Trash, X } from "lucide-react";
import LogStatusComponent from "@/components/log-status";
import useExcuteStore from "@/hooks/use-excute";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";
import { Link } from "react-router-dom";
import useSettings from "@/hooks/use-settings";
const ChromeListView = () => {
  const [loading, setLoading] = useState(false);
  const chromeStore = useChromeStore();
  const excuteStore = useExcuteStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ChromeColumn[]>([]);
  const [formatColumn, setFormatColumn] = useState<ChromeColumn[]>([]);
  const settingStore = useSettings();
  const items = useChromeStore((state) => state.items); // TRỰC TIẾP chọn `items`
  useEffect(() => {
    setFormatColumn(
      items.map((item) => ({
        id: item.id,
        name: item.username,
        proxy: item.proxy,
        path: item.pathProfile,
        isOpen: item.isOpen,
      }))
    );
  }, [items]);

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const handleOpenMultipleChromeProfile = async (isHeadless: boolean) => {
    try {
      // Bắt đầu quá trình mở profile
      excuteStore.setLoading(true);
      excuteStore.setMessageExcute(
        `Đang thực hiện mở chrome profile ${
          isHeadless ? "(không giao diện)" : "(có giao diện)"
        }`
      );

      // Mở đồng thời tất cả các profile đã chọn
      const openPromises = selected.map((select) =>
        chromeStore.openChromeProfile(select.id, selected.length, isHeadless)
      );

      await Promise.all(openPromises); // ⏱️ Đợi tất cả profile mở xong

      toast.success("Đã mở tất cả profile!");
    } catch (error) {
      console.error("Lỗi khi mở chrome profile:", error);
      toast.error("Lỗi khi mở chrome profile!");
    } finally {
      // Đảm bảo tắt trạng thái loading
      setSelected([]);
      setTimeout(() => {
        excuteStore.setLoading(false);
      }, 100);
    }
  };

  const handleCloseMultipleProfile = async () => {
    try {
      // Bắt đầu quá trình đóng profile
      excuteStore.setLoading(true);
      excuteStore.setMessageExcute("Đang thực hiện đóng Chrome profile...");

      // Tạo danh sách các hàm đóng profile
      const closePromises = selected
        .filter((select) => select.isOpen) // Chỉ đóng các profile đang mở
        .map((select) => chromeStore.closeChromeProfile(select.id));

      // Chờ đóng tất cả profile
      await Promise.all(closePromises);

      // Đảm bảo tất cả profile đã đóng

      // Xóa danh sách đã chọn sau khi đóng
      setSelected([]);
      toast.success("Đã đóng tất cả profile!");
    } catch (error) {
      console.error("Lỗi khi đóng Chrome profile:", error);
      toast.error("Lỗi khi đóng Chrome profile!");
    } finally {
      // Đảm bảo tắt trạng thái loading

      setTimeout(() => {
        excuteStore.setLoading(false);
      }, 100); // Đợi một chút để đảm bảo UI được cập nhật
    }
  };
  const handleDeleteProfile = async () => {
    try {
      // Bắt đầu quá trình xóa profile
      excuteStore.setLoading(true);
      excuteStore.setMessageExcute("Đang thực hiện xóa profile...");

      // Đợi tất cả các profile được xóa
      const deletePromises = selected.map((select) =>
        chromeStore.removeItem(select.id)
      );
      await Promise.all(deletePromises);

      // Cập nhật lại danh sách đã chọn
      setSelected([]);
      toast.success("Đã xóa profile");
    } catch (error) {
      console.error("Lỗi khi xóa profile:", error);
      toast.error("Lỗi khi xóa profile!");
    } finally {
      // Đảm bảo tắt trạng thái loading
      // Dùng setTimeout để đảm bảo UI cập nhật đúng trạng thái
      setTimeout(() => {
        excuteStore.setLoading(false);
      }, 100);
    }
  };

  return (
    <>
      {/* New dropdown version */}
      <div className="rounded-lg mt-4">
        {/* <h3 className="font-medium mb-4">New Dropdown (Space-saving)</h3> */}
        {
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              {/* Primary action kept outside the dropdown for quick access */}

              {/* Dropdown for additional actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-1"
                    disabled={loading}>
                    <Chrome className="w-4 h-4 mr-2 opacity-80" size={20} />

                    <span className="hidden sm:inline">
                      Thao tác với chrome
                    </span>
                    <span className="inline sm:hidden">Actions</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="text-center italic">
                      {" "}
                      Profile Đã Chọn ({selected.length})
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      disabled={selected.length > 0 ? false : true}
                      onClick={() => handleOpenMultipleChromeProfile(false)}>
                      <Chrome className="w-4 h-4 mr-2 opacity-70" />
                      <div className="font-semibold italic">
                        Mở Chrome (Có giao diện)
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={selected.length > 0 ? false : true}
                      onClick={() => handleOpenMultipleChromeProfile(true)}>
                      <Chrome className="w-4 h-4 mr-2 opacity-70" />
                      <div className="font-semibold italic">
                        Mở Chrome (Không giao diện)
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={selected.length > 0 ? false : true}
                      onClick={handleCloseMultipleProfile}
                      className="text-red-500 focus:text-red-500">
                      <X className="w-4 h-4 mr-2" />
                      <div className="font-bold italic">
                        Đóng Chrome Profile
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      disabled={selected.length > 0 ? false : true}
                      onClick={() => setOpen(true)}
                      className="text-red-500 focus:text-red-500">
                      <Trash className="w-4 h-4 mr-2" />
                      <div className="font-bold italic">Xóa Chrome Profile</div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      </div>
      <h1 className="font-bold italic py-4">Danh sách Nick Tiktok Chrome </h1>
      <DataTable
        onSelectionChange={(selected) => {
          setSelected(selected);
        }}
        searchKey="name"
        columns={columns}
        data={formatColumn}></DataTable>
      <AlertModal
        loading={loading}
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          handleDeleteProfile();
          setOpen(false);
          // onDelete();
          // setOpen(false);
        }}
      />
      <LogStatusComponent />
    </>
  );
};

export default ChromeListView;
function uuidv4(): string {
  throw new Error("Function not implemented.");
}
