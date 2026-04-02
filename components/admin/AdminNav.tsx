"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import type {AdminTab} from "@/types/admin";

export default function AdminNav({tabs, baseUrl = 'admin'}: { tabs: AdminTab[], baseUrl?: string }) {
    const pathname = usePathname();
    const getActive = (id: string) => pathname?.endsWith(`/dashboard/${baseUrl}/${id}`);

    return (
        <nav
            className="mb-5 overflow-x-auto rounded-[var(--radius-md)] border p-2"
            style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}
        >
            <ul className="flex min-w-max flex-wrap gap-2">
                {tabs.map((tab) => (
                    <li key={tab.id}>
                        <Link
                            href={`/dashboard/${baseUrl}/${tab.id}`}
                            className="inline-flex rounded-[var(--radius-sm)] border px-4 py-2.5 capitalize text-sm font-medium transition"
                            style={
                                getActive(tab.id)
                                    ? {
                                        background: "linear-gradient(135deg, var(--accent), var(--accent-strong))",
                                        borderColor: "transparent",
                                        color: "#ffffff",
                                    }
                                    : {
                                        background: "var(--surface-elevated)",
                                        borderColor: "var(--border-subtle)",
                                        color: "var(--muted-strong)",
                                    }
                            }
                        >
                            {tab.title ?? tab.id.replace("-", " ")}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
