"use client";
import dynamic from "next/dynamic";

const DentalPortal = dynamic(() => import("@/components/DentalPortal"));

export default function Page() {
    return <DentalPortal/>;
}
