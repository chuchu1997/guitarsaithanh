/** @format */

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
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
    accessorKey: "path",
    header: "Đường dẫn của Profile",
    cell: ({ row }) => row.original.path,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <>{row.original.isOpen ? "Đang mở " : "Đang tắt"}</>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
  //   {
  //     header: "Thao tác",
  //     id: "actions",
  //     cell: ({ row }) => <CellAction data={row.original} />,
  //   },
];
