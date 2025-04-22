import { DataTable } from "@/components/ui/data-table";


import {columns} from "../components/column";


const ChromeListView = ()=>{
    return <>
    <h1>Danh sách Nick Tiktok Chrome </h1>
    <DataTable searchKey="name" columns={columns} data={[]}></DataTable>
    </>
}

export default ChromeListView;
