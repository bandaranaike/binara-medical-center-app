"use client";
import dynamic from "next/dynamic";

const TreatmentsPortal = dynamic(() => import("@/components/TreatmentsPortal"));

export default function Page() {
    return <TreatmentsPortal/>;
}
