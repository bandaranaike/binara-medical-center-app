"use client";
import dynamic from "next/dynamic";

const PharmacyPortal = dynamic(() => import("@/components/PharmacyPortal"));

export default function Page() {
    return <PharmacyPortal/>;
}
