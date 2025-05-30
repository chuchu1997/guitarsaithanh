/** @format */

"use client";

import { ChromeColumn } from "./column";

import toast from "react-hot-toast";
import { useState } from "react";

import { AlertModal } from "@/components/modals/alert-modal";
import ActionDropdown from "@/components/action-dropdown";
import { useNavigate } from "react-router-dom";
import useChromeStore from "@/hooks/use-chromes";
import useExcuteStore from "@/hooks/use-excute";
interface CellActionProps {
  data: ChromeColumn;
}
export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate(); // ✅ React Router navigate
  const chromeStore = useChromeStore();
  const excuteStore = useExcuteStore();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(data.id);
    toast.success("Copy ID Thành Công");
  };

  const onEdit = () => {
    navigate(`/chrome/edit/${data.id}`);
  };
  const onDelete = async () => {
    excuteStore.setLoading(true);
    setLoading(true);
    excuteStore.setMessageExcute("Đang thực hiện xóa profile ");
    chromeStore.removeItem(data.id);
    excuteStore.setLoading(false);
    setLoading(false);
    toast.success("Đã xóa profile");
    navigate("/chrome");
  };
  const onAutoFillLogin = async () => {
    await backend.autoFillLogin({
      startSeeding: true,
      chromeProfiles: [
        {
          id: data.id,
          profilePath: data.path,
          proxy: data.proxy,
          headless: false,
          cookie: data.cookie,
        },
      ],
      link: "https://tiktok.com",
    });
  };

  const onOpenChrome = async () => {
    await chromeStore.openChromeProfile(data.id, 1, false);
  };
  const onCloseChrome = async () => {
    await chromeStore.closeChromeProfile(data.id);
  };
  return (
    <>
      <AlertModal
        loading={loading}
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          onDelete();
          setOpen(false);
        }}
      />

      <ActionDropdown
        onOpenChrome={onOpenChrome}
        onCloseChrome={onCloseChrome}
        onCopy={onCopy}
        onEdit={onEdit}
        onAutoFillLogin={onAutoFillLogin}
        onDelete={onDelete}
        onOpenDeleteModal={() => setOpen(true)}
      />
    </>
  );
};
