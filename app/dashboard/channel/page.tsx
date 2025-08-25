"use client";
import dynamic from "next/dynamic";

const Channel = dynamic(() => import("@/components/Channel"));

export default function Page() {
    return <Channel/>;
}
