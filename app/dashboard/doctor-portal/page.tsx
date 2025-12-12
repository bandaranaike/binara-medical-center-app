"use client";
import dynamic from "next/dynamic";

const DoctorPortal = dynamic(() => import("@/components/DoctorPortal"));

export default function Page() {
    return <DoctorPortal/>;
}
