"use client";
import dynamic from "next/dynamic";

const OPDPortal = dynamic(() => import("@/components/OPDPortal"));

export default function Page() {
    return <OPDPortal/>;
}
