"use client";
import dynamic from "next/dynamic";

const StatSummary = dynamic(() => import("@/components/StatSummary"));

export default function Page() {
    return <StatSummary/>;
}
