import React, {useState} from "react";
import LoginWindow from "@/components/authentication/LoginWindow";
import RegisterWindow from "@/components/authentication/RegisterWindow";
import ForgotPasswordWindow from "@/components/authentication/ForgotPasswordWindow";
import {LoggedUser} from "@/types/interfaces";
import {useUserContext} from "@/context/UserContext";

const tabs = [
    {key: "login", label: "Login", component: LoginWindow},
    {key: "forgot-password", label: "Forgot Password", component: ForgotPasswordWindow}
];

if (process.env.NEXT_PUBLIC_ALLOW_REGISTRATION && process.env.NEXT_PUBLIC_ALLOW_REGISTRATION == 'true') {
    tabs.push({key: "register", label: "Register", component: RegisterWindow})
}

const Authenticate: React.FC<{ onLoginStatusChange: (loggedUser: LoggedUser) => void }> = ({onLoginStatusChange}) => {
    const [activeTab, setActiveTab] = useState("login");
    const {setUser} = useUserContext();

    const setLoggedUserDataInCookies = (loggedUser: LoggedUser) => {
        setUser(loggedUser);
        onLoginStatusChange(loggedUser);
    };

    const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component;

    return (
        <div id="authentication-modal" className="mt-36 inset-0 z-50 items-center justify-center bg-black">
            <div className="relative p-4 max-w-xl mx-auto max-h-full">
                <div className="relative rounded-lg shadow bg-gray-800">
                    <div className="w-full">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 text-lg px-4 text-sm">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`flex-1 py-4 text-center ${
                                        activeTab === tab.key
                                            ? "border-b border-blue-500 text-blue-500"
                                            : "text-gray-400"
                                    }`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="pb-4">
                            {ActiveComponent && <ActiveComponent onUserHasLoggedIn={setLoggedUserDataInCookies}/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Authenticate;
