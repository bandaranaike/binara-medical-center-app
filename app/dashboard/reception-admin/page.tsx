"use client";
import dynamic from "next/dynamic";

const ReceptionAdmin = dynamic(() => import("@/components/reception/ReceptionAdmin"));

export default function Page() {
    return <ReceptionAdmin/>;
}
