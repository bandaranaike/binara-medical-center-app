"use client"

import React, {useState} from 'react';
import Channel from '../components/Channel';
import OPD from '../components/OPD';
import DaySummary from '../components/DaySummary';

const Page = () => {
    const [activeTab, setActiveTab] = useState('channel');

    const activeTabClass = 'text-fuchsia-600 border-fuchsia-600 active dark:text-blue-500 dark:border-fuchsia-500';
    const inactiveTabClass = 'border-transparent hover:text-gray-200 hover:border-gray-300 dark:hover:text-gray-300';

    const renderTabContent = () => {
        switch (activeTab) {
            case 'channel':
                return <Channel/>;
            case 'opd':
                return <OPD/>;
            case 'day-summary':
                return <DaySummary/>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between w-25">
                <h1 className="text-3xl mx-6 mt-6 text-gray-400">Binara Management System</h1>
            </header>
            <div className="mx-4 my-6 p-4 border border-gray-800 rounded-lg bg-gray-900 text-gray-400">
                <nav className="text-sm font-medium text-center text-gray-400 border-b border-gray-800 dark:text-gray-400 dark:border-gray-700">
                    <ul className="flex flex-wrap -mb-px">
                        <li className="me-2">
                            <a
                                href="#"
                                onClick={() => setActiveTab('channel')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                    activeTab === 'channel' ? activeTabClass : inactiveTabClass
                                }`}
                            >
                                Channel
                            </a>
                        </li>
                        <li className="me-2">
                            <a
                                href="#"
                                onClick={() => setActiveTab('opd')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                    activeTab === 'opd' ? activeTabClass : inactiveTabClass
                                }`}
                            >
                                OPD
                            </a>
                        </li>
                        <li className="me-2">
                            <a
                                href="#"
                                onClick={() => setActiveTab('day-summary')}
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                                    activeTab === 'day-summary' ? activeTabClass : inactiveTabClass
                                }`}
                            >
                                Day Summary
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className="p-4 pt-8">
                    {renderTabContent()}
                </div>
            </div>
            <footer className="text-center mt-4">
                <p>No82. New Town, Kundasale. Tel: 0817213239 / 0812421942, Fax: 0812421942, Email: binara82@gmail.com</p>
            </footer>
        </div>
    );
};

export default Page;

