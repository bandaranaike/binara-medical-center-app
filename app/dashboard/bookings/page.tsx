"use client";
import dynamic from "next/dynamic";

const Bookings = dynamic(() => import("@/components/Bookings"));

export default function Page() {
    return <Bookings/>;
}
