"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import type {AdminTab} from "@/components/admin/AdminTabs";

export default function AdminNav({tabs, baseUrl = 'admin'}: { tabs: AdminTab[], baseUrl?: string }) {
    const pathname = usePathname();
    const getActive = (id: string) => pathname?.endsWith(`/dashboard/${baseUrl}/${id}`);

    const activeTabClass = "active dark:text-blue-500 border-fuchsia-500";
    const inactiveTabClass = "border-transparent hover:border-gray-300 hover:text-gray-300";

    return (
        <nav className="text-sm font-medium border-b border-gray-700">
            <ul className="flex flex-wrap -mb-px">
                {tabs.map((tab) => (
                    <li className="me-2" key={tab.id}>
                        <Link
                            href={`/dashboard/${baseUrl}/${tab.id}`}
                            className={`inline-block p-4 border-b-2 rounded-t-lg capitalize ${
                                getActive(tab.id) ? activeTabClass : inactiveTabClass
                            }`}
                        >
                            {tab.title ?? tab.id.replace("-", " ")}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
