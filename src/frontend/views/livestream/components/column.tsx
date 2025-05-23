/** @format */

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CaptionsIcon, CaptionsOffIcon } from "lucide-react";

export type LiveStreamColumn = {
  id: string;
  name: string;
  proxy: string;
  pathProfile: string;
  isOpen: boolean;
  cookie:string;
};

export const columns: ColumnDef<LiveStreamColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Chọn tất cả"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn dòng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Tên Nick Tiktok Chrome ",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "proxy",
    header: "Sử dụng Proxy",
    cell: ({ row }) => row.original.proxy,
  },
  {
    accessorKey: "path",
    header: "Đường dẫn của Profile",
    cell: ({ row }) => row.original.pathProfile,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <>
        {row.original.isOpen ? (
          <div className="bg-gradient-to-r inline-block from-green-400 to-teal-500 text-white font-semibold text-sm py-1 px-4 rounded-lg italic shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-x-2 ">
              <span>Đang mở</span> <CaptionsIcon size={18} />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r inline-block from-red-400 to-red-900 text-white font-semibold text-sm py-1 px-4 rounded-lg italic shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-x-2 ">
              <span>Đang tắt</span> <CaptionsOffIcon size={18} />
            </div>
          </div>
        )}
      </>
    ),
  },
];
