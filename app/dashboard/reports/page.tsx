"use client";
import dynamic from "next/dynamic";

const Reports = dynamic(() => import("@/components/admin/Reports"));

export default function Page() {
    return <Reports/>;
}
