/** @format */

"use client";

import { ChromeColumn } from "./column";

import toast from "react-hot-toast";
import { useState } from "react";

import { AlertModal } from "@/components/modals/alert-modal";
import ActionDropdown from "@/components/action-dropdown";
import { useNavigate } from "react-router-dom";
import useChromeStore from "@/hooks/use-chromes";
interface CellActionProps {
  data: ChromeColumn;
}
export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate(); // ✅ React Router navigate
  const chromeStore = useChromeStore();

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
    try {
      setLoading(true);
      chromeStore.removeItem(data.id);
      navigate("/chrome");
    } catch (err) {
      toast.error("Có lỗi ở đâu đó   !!");
    } finally {
      setLoading(false);
    }
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
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenDeleteModal={() => setOpen(true)}
      />
    </>
  );
};
