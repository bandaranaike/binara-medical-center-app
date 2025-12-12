"use client";
import dynamic from "next/dynamic";

const Welcome = dynamic(() => import("@/components/table/Welcome"));

export default function Page() {
    return <Welcome/>;
}
