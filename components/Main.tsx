"use client";

import React, {ReactElement, useEffect, useState} from "react";
import Channel from "../components/Channel";
import StatSummary from "../components/StatSummary";
import DoctorsPatientQueue from "@/components/DoctorPortal";
import PharmacyPortal from "@/components/PhamacyPortal";
import Reception from "@/components/Reception";
import Bookings from "@/components/Bookings";
import TreatmentsPortal from "@/components/TreatmentsPortal";
import Admin from "@/components/admin/Admin";
import DentalPortal from "@/components/DentalPortal";
import Authenticate from "@/components/authentication/Authenticate";
import {useUserContext} from "@/context/UserContext";
import {setAxiosToken} from "@/lib/axios";
import OPDPortal from "@/components/OPDPortal";
import PharmacyAdminPortal from "@/components/pharmacy-admin/PharmacyAdminPortal";

interface Tab {
    id: string;
    label: string;
    component: ReactElement<any, any>;
    roles: string[];
}

const Main = () => {

    const {setUser, user, logout} = useUserContext()

    useEffect(() => {
        // Dynamically set token for Axios
        setAxiosToken(user?.token || null);
    }, [user]);

    const tabs: Tab[] = [
        {id: "channel", label: "Channel", component: <Channel/>, roles: ["reception"]},
        {id: "opd", label: "OPD", component: <OPDPortal/>, roles: ["reception"]},
        {id: "dental", label: "Dental Portal", component: <DentalPortal/>, roles: ["reception"]},
        {id: "services", label: "Treatments", component: <TreatmentsPortal/>, roles: ["reception"]},
        {id: "doctor-portal", label: "Doctor Portal", component: <DoctorsPatientQueue/>, roles: ["doctor"]},
        {id: "pharmacy-portal", label: "Pharmacy Portal", component: <PharmacyPortal/>, roles: ["pharmacy", "pharmacy_admin"]},
        {id: "pharmacy-admin", label: "Pharmacy Admin", component: <PharmacyAdminPortal/>, roles: ["pharmacy_admin"]},
        {id: "bookings", label: "Bookings", component: <Bookings/>, roles: ["reception"]},
        {id: "reception", label: "Reception", component: <Reception/>, roles: ["reception"]},
        {id: "stat-summary", label: "Stat Summary", component: <StatSummary/>, roles: ["admin"]},
        {id: "admin", label: "Admin", component: <Admin/>, roles: ["admin"]},
    ];

    const [activeTab, setActiveTab] = useState("");
    const [filteredTabs, setFilteredTabs] = useState<Tab[]>([]);

    useEffect(() => {
        const filteredTabs = tabs.filter((tab) => {
            return user && tab.roles.includes(user.role)
        })
        if (filteredTabs[0]) {
            setActiveTab(filteredTabs[0].id)
            setFilteredTabs(filteredTabs)
        }
    }, [user]);

    const activeTabClass = "text-fuchsia-600 border-fuchsia-600 active dark:text-blue-500 dark:border-fuchsia-500";
    const inactiveTabClass = "border-transparent hover:text-gray-200 hover:border-gray-300 dark:hover:text-gray-300";

    const renderTabContent = () => {
        const activeTabData = filteredTabs.find((tab) => tab.id === activeTab);
        return activeTabData ? activeTabData.component : null;
    };

    return (
        <div>
            {user && (<div className="min-h-screen">
                    <header className="flex items-center justify-between text-gray-400">
                        <h1 className="text-3xl mx-6 mt-6">
                            {process.env.NEXT_PUBLIC_APP_TITLE}
                        </h1>
                        <div className="mx-6">
                            {user && (
                                <div className="mt-4">
                                    <span className="mr-3">Welcome {user?.name}</span>
                                    <button className="text-blue-400 hover:text-blue-500" onClick={() => logout()}>Logout</button>
                                </div>
                            )}
                        </div>
                    </header>
                    <div className="mx-4 my-6 p-4 border border-gray-800 rounded-lg bg-gray-900 text-gray-400">
                        <nav className="text-sm font-medium text-center text-gray-400 border-b border-gray-800 dark:text-gray-400 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px">
                                {filteredTabs && filteredTabs.map((tab) => (
                                    <li className="me-2" key={tab.id}>
                                        <a
                                            href="#"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                                activeTab === tab.id
                                                    ? activeTabClass
                                                    : inactiveTabClass
                                            }`}
                                        >
                                            {tab.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="p-4 pt-8">{renderTabContent()}</div>
                    </div>
                    <footer className="text-center mt-4">
                        <div className="text-gray-500 pt-3 pb-9">
                            <span className="mr-3">{process.env.NEXT_PUBLIC_APP_ADDRESS}</span>
                            <span className="mr-3">Telephone: {process.env.NEXT_PUBLIC_APP_TELEPHONE}</span>
                            <span className="mr-3">Fax: {process.env.NEXT_PUBLIC_APP_FAX}</span>
                            <span className="mr-3">Email: {process.env.NEXT_PUBLIC_APP_EMAIL}</span>
                        </div>
                    </footer>
                </div>
            )}
            {!user && <Authenticate onLoginStatusChange={setUser}/>}
        </div>
    );
};

export default Main;
