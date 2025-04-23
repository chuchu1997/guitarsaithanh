

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";

interface ActionsDropdownProps {
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onOpenDeleteModal: () => void;
  }


  const ActionDropdown =(props:ActionsDropdownProps) => {
    const {onCopy,onEdit,onDelete,onOpenDeleteModal} = props;

     return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"} type = "button" className="h-8 w-8 p-0">
          <span className="sr-only">Mở Menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          className="flex items-center mb-2 cursor-pointer"
          onClick={onCopy}
        >
          <Copy className="mr-2 h-4 w-4" />
          <span className="text-sm font-base">Copy ID</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center mb-2 cursor-pointer"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Chỉnh sửa</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center mb-2 cursor-pointer"
          onClick={onOpenDeleteModal}
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Xóa </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

}

export default ActionDropdown;
