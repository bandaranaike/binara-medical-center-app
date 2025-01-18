"use client";

import React, {useState, useEffect} from "react";
import Channel from "../components/Channel";
import OPD from "../components/OPD";
import StatSummary from "../components/StatSummary";
import LoginWindow from "@/components/LoginWindow";
import Cookies from "js-cookie";
import DoctorsPatientQueue from "@/components/DoctorPortal";
import PharmacyPortal from "@/components/PhamacyPortal";
import Reception from "@/components/Reception";
import Bookings from "@/components/Bookings";
import TreatmentsPortal from "@/components/TreatmentsPortal";
import Admin from "@/components/admin/Admin";
import DentalPortal from "@/components/DentalPortal";

const Page = () => {
    const [activeTab, setActiveTab] = useState("channel");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            setIsLoggedIn(!!Cookies.get("API-TOKEN"));
        };

        checkLoginStatus();
    }, []);

    const activeTabClass =
        "text-fuchsia-600 border-fuchsia-600 active dark:text-blue-500 dark:border-fuchsia-500";
    const inactiveTabClass =
        "border-transparent hover:text-gray-200 hover:border-gray-300 dark:hover:text-gray-300";

    const tabs = [
        {id: "channel", label: "Channel", component: <Channel/>},
        {id: "opd", label: "OPD", component: <OPD/>},
        {id: "dental", label: "Dental Portal", component: <DentalPortal/>},
        {id: "services", label: "Treatments", component: <TreatmentsPortal/>},
        {id: "doctor-portal", label: "Doctor Portal", component: <DoctorsPatientQueue/>},
        {id: "pharmacy-portal", label: "Pharmacy Portal", component: <PharmacyPortal/>},
        {id: "bookings", label: "Bookings", component: <Bookings/>},
        {id: "reception", label: "Reception", component: <Reception/>},
        {id: "stat-summary", label: "Stat Summary", component: <StatSummary/>},
        {id: "admin", label: "Admin", component: <Admin/>},
    ];

    const renderTabContent = () => {
        const activeTabData = tabs.find((tab) => tab.id === activeTab);
        return activeTabData ? activeTabData.component : null;
    };

    return (
        <div>
            {isLoggedIn && (<div className={`min-h-screen ${!isLoggedIn ? "blur" : ""}`}>
                    <header className="flex items-center justify-between w-25">
                        <h1 className="text-3xl mx-6 mt-6 text-gray-400">
                            {process.env.NEXT_PUBLIC_APP_TITLE}
                        </h1>
                    </header>
                    <div className="mx-4 my-6 p-4 border border-gray-800 rounded-lg bg-gray-900 text-gray-400">
                        <nav className="text-sm font-medium text-center text-gray-400 border-b border-gray-800 dark:text-gray-400 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px">
                                {tabs.map((tab) => (
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
            {!isLoggedIn && <LoginWindow loginStatus={setIsLoggedIn}/>}
        </div>
    );
};

export default Page;
