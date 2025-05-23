/** @format */

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { CaptionsOffIcon, CaptionsIcon } from "lucide-react";
// import { CellAction } from "./cell-action";
// import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ChromeColumn = {
  id: string;
  name: string;
  isOpen: boolean;
  proxy: string;
  path: string;
  cookie: string;
};

export const columns: ColumnDef<ChromeColumn>[] = [
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
  },

 
  {
    accessorKey: "cookie",
    header: "Cookie",
    cell: ({ row }) => (
      <div className=" max-w-[500px] overflow-hidden text-ellipsis">
        {row.original.cookie}
      </div>
    ),
  },
  // {
  //   accessorKey: "status",
  //   header: "Trạng thái",
  //   cell: ({ row }) => (
  //     <>
  //       {row.original.isOpen ? (
  //         <div className="bg-gradient-to-r inline-block from-green-400 to-teal-500 text-white font-semibold text-sm py-1 px-4 rounded-lg italic shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md">
  //           <div className="flex items-center gap-x-2 ">
  //             <span>Đang mở</span> <CaptionsIcon size={18} />
  //           </div>
  //         </div>
  //       ) : (
  //         <div className="bg-gradient-to-r inline-block from-red-400 to-red-900 text-white font-semibold text-sm py-1 px-4 rounded-lg italic shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md">
  //           <div className="flex items-center gap-x-2 ">
  //             <span>Đang tắt</span> <CaptionsOffIcon size={18} />
  //           </div>
  //         </div>
  //       )}
  //     </>
  //   ),
  // },

  {
    header: "Thao tác",
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
