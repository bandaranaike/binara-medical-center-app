"use client"
import {notFound} from "next/navigation";
import {use} from 'react'
import {tabs} from "@/app/dashboard/pharmacy-admin/tabs";
import AdminNav from "@/components/admin/AdminNav";
import TableComponent from "@/components/TableComponent";

export default function PharmacyAdminTabPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const tab = tabs.find((t) => t.id === id);
    if (!tab) notFound();

    return (
        <div className="bg-gray-900 text-gray-400">
            <AdminNav baseUrl="pharmacy-admin" tabs={tabs}/>
            <div className="">
                {/* TableComponent already handles loading/pagination/search/etc. */}
                <TableComponent tab={tab}/>
            </div>
        </div>
    );
}
