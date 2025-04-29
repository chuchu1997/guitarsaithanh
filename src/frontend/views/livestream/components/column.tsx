/** @format */

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

export type LiveStreamColumn = {
  id: string;
  name: string;
  proxy: string;
  pathProfile: string;
  isOpen: boolean;
  isCheckChooseChrome: boolean;
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
    cell: ({ row }) => <>{row.original.isOpen ? "Đang mở " : "Đang tắt"}</>,
  },
];
