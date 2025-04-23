import { DataTable } from "@/components/ui/data-table";


import {ChromeColumn, columns} from "../components/column";


import useChromeStore from "@/hooks/use-chromes";
const ChromeListView = ()=>{
    const chromeStore = useChromeStore();



    const formatColumn:ChromeColumn[] = chromeStore.items.map((item)=>({
        id:item.id,
        name:item.username,
        proxy:item.proxy,
        path:item.pathProfile,
        status:""
    }))

    return <>
    <h1>Danh sách Nick Tiktok Chrome </h1>
    <DataTable searchKey="name" columns={columns} data={formatColumn}></DataTable>
    </>
}

export default ChromeListView;
