"use client"
import {redirect} from "next/navigation";
import {tabs} from "./tabs";

export default function AdminRootPage() {
    redirect(`/dashboard/pharmacy-admin/${tabs[0].id}`);
}