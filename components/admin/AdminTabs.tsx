import React, {useEffect, useState} from "react";
import TableComponent from "@/components/TableComponent";
import Loader from "@/components/form/Loader";
import Link from "next/link";
import {AdminTab} from "@/types/admin";

interface ActiveTabsProps {
    tabs: AdminTab[],
    onSelectActiveTab?: (activeTab: string) => void
}

const AdminTabs: React.FC<ActiveTabsProps> = ({tabs, onSelectActiveTab}) => {

    const [activeTab, setActiveTab] = useState<AdminTab>(tabs[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (onSelectActiveTab)
            onSelectActiveTab(activeTab.id)
    }, [activeTab]);

    const activeTabClass = "border-[var(--accent-strong)] text-[var(--accent-strong)]";
    const inactiveTabClass = "border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]";

    return (
        <div>
            <div className="overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[var(--shadow-soft)]" style={{borderColor: "var(--border-subtle)"}}>
                <nav className="border-b text-sm font-medium" style={{borderColor: "var(--border-subtle)", background: "var(--surface-soft)"}}>
                    <ul className="flex flex-wrap -mb-px">
                        {tabs.length > 0 && tabs.map((tab) => (
                            <li className="me-2" key={tab.id}>
                                <Link
                                    href={`/dashboard/admin/${tab.id}`}
                                    onClick={() => setActiveTab(tab)}
                                    className={`inline-block rounded-t-lg border-b-2 p-4 capitalize transition ${
                                        activeTab.id === tab.id ? activeTabClass : inactiveTabClass
                                    }`}
                                >{tab.title ?? tab.id.replace('-', ' ')}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="">
                    {
                        activeTab.id !== "summary" && activeTab.id !== "" && (
                            <TableComponent tab={activeTab} onLoaded={(status) => setLoading(status)}/>
                        )
                    }
                    {
                        (activeTab.id !== "summary" && loading) &&
                        <div className="my-24 min-w-max p-6"><Loader/></div>
                    }
                </div>
            </div>
        </div>
    )

}

export default AdminTabs;
