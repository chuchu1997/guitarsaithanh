/** @format */

import { DataTable } from "@/components/ui/data-table";

import { ChromeColumn, columns } from "../components/column";

import useChromeStore from "@/hooks/use-chromes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Chrome, X } from "lucide-react";
import LogStatusComponent from "@/components/log-status";
import useExcuteStore from "@/hooks/use-excute";
import toast from "react-hot-toast";
const ChromeListView = () => {
  const [loading, setLoading] = useState(false);
  const chromeStore = useChromeStore();
  const excuteStore = useExcuteStore();

  const items = useChromeStore((state) => state.items); // TRỰC TIẾP chọn `items`
  const formatColumn: ChromeColumn[] = items.map((item) => ({
    id: item.id,
    name: item.username,
    proxy: item.proxy,
    path: item.pathProfile,
    isOpen: item.isOpen,
  }));
  const [selected, setSelected] = useState<ChromeColumn[]>([]);
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const handleOpenMultipleChromeProfile = async (isHeadless: boolean) => {
    excuteStore.setLoading(true);
    excuteStore.setMessageExcute(
      `Đang thực hiện mở chrome profile ${
        isHeadless ? "(không giao diện)" : "(có giao diện)"
      }`
    );
    setLoading(true);
    const openPromises = selected.map((select) => {
      return chromeStore.openChromeProfile(
        select.id,
        selected.length,
        isHeadless
      );
    });

    await Promise.all(openPromises); // ⏱️ Mở đồng thời tất cả profiles

    setLoading(false);
    excuteStore.setLoading(false);
  };
  const handleCloseMultipleProfile = async () => {
    excuteStore.setLoading(true);
    excuteStore.setMessageExcute("Đang thực hiện mở đóng chrome profile ");
    await Promise.all(
      selected.map((select) => chromeStore.closeChromeProfile(select.id))
    );
    excuteStore.setLoading(false);
    toast.success("Đã đóng profile");
  };
  const handleDeleteProfule = async () => {
    excuteStore.setLoading(true);
    excuteStore.setMessageExcute("Đang thực hiện xóa profile ");
    await Promise.all(
      selected.map((select) => chromeStore.removeItem(select.id))
    );
    excuteStore.setLoading(false);
    toast.success("Đã xóa profile");
  };

  return (
    <>
      <h1>Danh sách Nick Tiktok Chrome </h1>
      {selected.length > 0 && (
        <div className="flex justify-center items-center gap-x-2">
          <Button
            variant="default"
            className="gap-1"
            disabled={loading}
            onClick={() => handleOpenMultipleChromeProfile(false)}>
            <Chrome className="w-4 h-4" />
            Mở Chrome Profile
          </Button>
          <Button
            variant="default"
            className="gap-1"
            disabled={loading}
            onClick={() => handleOpenMultipleChromeProfile(true)}>
            <Chrome className="w-4 h-4" />
            Mở Chrome Profile (KHÔNG GIAO DIỆN)
          </Button>
          <Button
            disabled={loading}
            variant="destructive"
            className="gap-1"
            onClick={handleCloseMultipleProfile}>
            <X className="w-4 h-4" />
            Đóng Chrome Profile
          </Button>
          <Button
            disabled={loading}
            variant="destructive"
            className="gap-1"
            onClick={handleDeleteProfule}>
            <X className="w-4 h-4" />
            Xóa Profile
          </Button>
        </div>
      )}

      <DataTable
        onSelectionChange={(selected) => {
          setSelected(selected);
        }}
        searchKey="name"
        columns={columns}
        data={formatColumn}></DataTable>
      <LogStatusComponent />
    </>
  );
};

export default ChromeListView;
