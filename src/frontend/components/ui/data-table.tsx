/** @format */

"use client";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  onSelectionChange?: (selected: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const lastSelectedIndexRef = React.useRef<number | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);
      const selectedRows = Object.keys(newRowSelection)
        .filter((key) => newRowSelection[key])
        .map((key) => {
          const rowIndex = parseInt(key);
          return table.getRowModel().rows[rowIndex]?.original;
        })
        .filter(Boolean);
      onSelectionChange?.(selectedRows);
    },
  });

  // Xử lý khi nhấn Shift để chọn nhiều dòng
  const handleRowClick = (event: React.MouseEvent, rowIndex: number) => {
    const shiftKey = event.shiftKey;
    const updatedSelection = { ...rowSelection };

    if (shiftKey && lastSelectedIndexRef.current !== null) {
      const start = Math.min(lastSelectedIndexRef.current, rowIndex);
      const end = Math.max(lastSelectedIndexRef.current, rowIndex);

      for (let i = start; i <= end; i++) {
        updatedSelection[i] = true;
      }
    } else {
      updatedSelection[rowIndex] = !updatedSelection[rowIndex];
    }

    setRowSelection(updatedSelection);
    lastSelectedIndexRef.current = rowIndex;

    const selectedRows = Object.keys(updatedSelection)
      .filter((key) => updatedSelection[parseInt(key)])
      .map((key) => {
        const idx = parseInt(key);
        return table.getRowModel().rows[idx]?.original;
      })
      .filter(Boolean);

    onSelectionChange?.(selectedRows);
  };

  // Reset lựa chọn khi dữ liệu thay đổi
  // React.useEffect(() => {
  //   setRowSelection({});
  //   lastSelectedIndexRef.current = null;
  // }, [data]);

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Tìm kiếm ..."
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(event) => handleRowClick(event, index)}
                  className={`cursor-pointer ${
                    row.getIsSelected() ? "bg-gray-100" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Chưa có thông tin !!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
