import React from "react";
import LoginWindow from "@/components/authentication/LoginWindow";
import {LoggedUser} from "@/types/interfaces";
import {useUserContext} from "@/context/UserContext";

const Authenticate: React.FC<{ onLoginStatusChange: (loggedUser: LoggedUser) => void }> = ({onLoginStatusChange}) => {
    const {setUser} = useUserContext();

    const handleLogin = (loggedUser: LoggedUser) => {
        setUser(loggedUser);
        onLoginStatusChange(loggedUser);
    };

    return (
        <div className="min-h-screen px-6 py-10" style={{background: "var(--shell-gradient)", color: "var(--foreground)"}}>
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
                <LoginWindow onUserHasLoggedIn={handleLogin}/>
            </div>
        </div>
    );
};

export default Authenticate;
