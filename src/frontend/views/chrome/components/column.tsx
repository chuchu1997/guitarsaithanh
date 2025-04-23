/** @format */

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
// import { CellAction } from "./cell-action";
// import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ChromeColumn = {
  id: string;
  name: string;
  status: string;
  proxy: string;
  path: string;
};

export const columns: ColumnDef<ChromeColumn>[] = [
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
    cell: ({ row }) => row.original.status,
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
