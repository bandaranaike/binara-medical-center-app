"use client";
import dynamic from "next/dynamic";

const TodayList = dynamic(() => import("@/components/TodayList"));

export default function Page() {
    return <TodayList/>;
}
