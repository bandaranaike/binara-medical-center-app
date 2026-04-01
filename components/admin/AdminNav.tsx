"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import type {AdminTab} from "@/types/admin";

export default function AdminNav({tabs, baseUrl = 'admin'}: { tabs: AdminTab[], baseUrl?: string }) {
    const pathname = usePathname();
    const getActive = (id: string) => pathname?.endsWith(`/dashboard/${baseUrl}/${id}`);

    const activeTabClass = "border-[var(--accent-strong)] text-[var(--accent-strong)]";
    const inactiveTabClass = "border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]";

    return (
        <nav
            className="mb-4 overflow-x-auto rounded-[var(--radius-md)] border text-sm font-medium"
            style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}
        >
            <ul className="flex min-w-max flex-wrap px-2">
                {tabs.map((tab) => (
                    <li className="me-2" key={tab.id}>
                        <Link
                            href={`/dashboard/${baseUrl}/${tab.id}`}
                            className={`inline-block rounded-t-lg border-b-2 px-4 py-4 capitalize transition ${
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
