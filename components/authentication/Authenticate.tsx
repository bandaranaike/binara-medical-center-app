import React, {useEffect, useState} from "react";
import LoginWindow from "@/components/authentication/LoginWindow";
import RegisterWindow from "@/components/authentication/RegisterWindow";
import Cookies from "js-cookie";
import {LoggedUser} from "@/types/interfaces";
import {useUserContext} from "@/context/UserContext";

const Authenticate: React.FC<{ onLoginStatusChange: (loggedUser: LoggedUser) => void }> = ({onLoginStatusChange}) => {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const {setUser} = useUserContext()

    const setLoggedUserDataInCookies = (loggedUser: LoggedUser) => {
        setUser(loggedUser)
        onLoginStatusChange(loggedUser)
    }

    return (
        <div id="authentication-modal" className="mt-36 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative rounded-lg shadow bg-gray-800">
                    <div className="w-full max-w-md">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-700 text-lg px-4">
                            <button
                                className={`flex-1 py-4 text-center ${
                                    activeTab === "login"
                                        ? "border-b border-blue-500 text-blue-500"
                                        : "text-gray-400"
                                }`}
                                onClick={() => setActiveTab("login")}
                            >
                                Login
                            </button>
                            <button
                                className={`flex-1 py-4 text-center ${
                                    activeTab === "register"
                                        ? "border-b-1 border-blue-500 text-blue-500"
                                        : "text-gray-400"
                                }`}
                                onClick={() => setActiveTab("register")}
                            >
                                Register
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="pb-4">
                            {activeTab === "login" ?
                                <LoginWindow onUserHasLoggedIn={setLoggedUserDataInCookies}/> :
                                <RegisterWindow onUserHasLoggedIn={setLoggedUserDataInCookies}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Authenticate;
