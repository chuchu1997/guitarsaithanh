/** @format */

"use client";

import { ColumnDef } from "@tanstack/react-table";
// import { CellAction } from "./cell-action";
// import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ChromeColumn = {
  id: string;
  name: string;
  status: string;
  proxy: string;
};

export const columns: ColumnDef<ChromeColumn>[] = [
  {
    accessorKey: "name",
    header: "Tên Nick Tiktok Chrome ",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => row.original.status,
  },

  {
    accessorKey: "proxy",
    header: "Sử dụng Proxy",
  },
  {
    accessorKey: "createAt",
    header: "Ngày tạo",
  },

  //   {
  //     header: "Thao tác",
  //     id: "actions",
  //     cell: ({ row }) => <CellAction data={row.original} />,
  //   },
];
