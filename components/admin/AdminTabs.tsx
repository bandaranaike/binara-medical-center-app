import React, {useEffect, useState} from "react";
import TableComponent from "@/components/TableComponent";

export interface AdminTab {
    id: string,
    fields: string[]
    dropdowns?: any
    readonly ?: boolean
    select?: any
    actions?: [AdminTabActions]
    filters?: {
        options: { value: string, label: string }[],
        types?: any
    }
}

export interface AdminTabActions {
    key: string,
    callBack: (record: any) => Promise<any>
}

interface ActiveTabsProps {
    tabs: AdminTab[],
    onSelectActiveTab?: (activeTab: string) => void
}

const AdminTabs: React.FC<ActiveTabsProps> = ({tabs, onSelectActiveTab}) => {

    const [activeTab, setActiveTab] = useState<AdminTab>(tabs[0]);

    useEffect(() => {
        if (onSelectActiveTab)
            onSelectActiveTab(activeTab.id)
    }, [activeTab]);

    const activeTabClass = "active dark:text-blue-500 border-fuchsia-500";
    const inactiveTabClass = "border-transparent hover:border-gray-300 hover:text-gray-300";

    return (
        <div>
            <div className="bg-gray-900 text-gray-400">
                <nav className="text-sm font-medium border-b border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        {tabs.length > 0 && tabs.map((tab) => (
                            <li className="me-2" key={tab.id}>
                                <a
                                    href="#"
                                    onClick={() => setActiveTab(tab)}
                                    className={`inline-block p-4 border-b-2 rounded-t-lg capitalize ${
                                        activeTab.id === tab.id ? activeTabClass : inactiveTabClass
                                    }`}
                                >{tab.id.replace('-', ' ')}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="">{
                    activeTab.id !== "summary" && activeTab.id !== "" && (
                        <TableComponent tab={activeTab}/>
                    )
                }</div>
            </div>
        </div>
    )

}

export default AdminTabs;