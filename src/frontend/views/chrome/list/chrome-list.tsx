import { DataTable } from "@/components/ui/data-table";


import {ChromeColumn, columns} from "../components/column";


import useChromeStore from "@/hooks/use-chromes";
const ChromeListView = ()=>{

    const items = useChromeStore((state) => state.items); // TRỰC TIẾP chọn `items`
    const formatColumn: ChromeColumn[] = items.map((item) => ({
        id: item.id,
        name: item.username,
        proxy: item.proxy,
        path: item.pathProfile,
        isOpen: item.isOpen,
      }));
    

    return <>
    <h1>Danh sách Nick Tiktok Chrome </h1>
    <DataTable searchKey="name" columns={columns} data={formatColumn}></DataTable>
    </>
}

export default ChromeListView;
