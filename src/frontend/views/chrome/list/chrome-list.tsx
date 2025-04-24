import { DataTable } from "@/components/ui/data-table";


import {ChromeColumn, columns} from "../components/column";


import useChromeStore from "@/hooks/use-chromes";
import { Button } from "@/components/ui/button";
import { useState } from "react";
const ChromeListView = ()=>{
    const [loading,setLoading] = useState(false);

    const items = useChromeStore((state) => state.items); // TRỰC TIẾP chọn `items`
    const formatColumn: ChromeColumn[] = items.map((item) => ({
        id: item.id,
        name: item.username,
        proxy: item.proxy,
        path: item.pathProfile,
        isOpen: item.isOpen,
      }));
    const handleOpenMultipleChromeProfile = ()=>{
      // useChromeStore().
      // backend.openMultipleProfilesWithLink(formatColumn.map(({ path, proxy }) => ({ profilePath: path, proxyPath: proxy })))
    }

    return <>
    <h1>Danh sách Nick Tiktok Chrome </h1>
    <DataTable searchKey="name" columns={columns} data={formatColumn}></DataTable>
    <div className ="flex justify-center">
     {items.length > 0 && <Button>Mở toàn bộ nick </Button>}
    </div>
    
    </>
}

export default ChromeListView;
