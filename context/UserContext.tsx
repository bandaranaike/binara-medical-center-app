import {LoggedUser} from "@/types/interfaces";
import React, {createContext, useContext, useEffect, useRef, useState} from "react";
import axios, {ensureCsrfCookie} from "@/lib/axios";

interface UserContextType {
    user: LoggedUser | null;
    setUser: (user: LoggedUser | null) => void;
    refreshUser: () => Promise<LoggedUser | null>;
    logout: () => Promise<void>;
    shift: string;
    setShift: (shift: string) => void;
    initializing: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<LoggedUser | null>(null);
    const [shift, setShift] = useState("morning");
    const [initializing, setInitializing] = useState(true);
    const logoutInProgressRef = useRef(false);
    const refreshRequestIdRef = useRef(0);

    const refreshUser = async (): Promise<LoggedUser | null> => {
        const requestId = ++refreshRequestIdRef.current;

        if (logoutInProgressRef.current) {
            return null;
        }

        try {
            const response = await axios.get("/check-user-session", {
                params: {_t: Date.now()},
            });

            if (logoutInProgressRef.current || requestId !== refreshRequestIdRef.current) {
                return null;
            }

            setUser(response.data);
            return response.data;
        } catch {
            if (requestId !== refreshRequestIdRef.current) {
                return null;
            }

            setUser(null);
            return null;
        }
    };

    useEffect(() => {
        const bootstrapUser = async () => {
            const storedShift = localStorage.getItem("shift");
            if (storedShift) {
                setShift(storedShift);
            }

            await refreshUser();
            setInitializing(false);
        };

        void bootstrapUser();
    }, []);

    const waitForSessionToClear = async (): Promise<void> => {
        for (let attempt = 0; attempt < 4; attempt += 1) {
            try {
                await axios.get("/check-user-session", {
                    params: {_t: Date.now()},
                });
            } catch {
                return;
            }

            await new Promise((resolve) => {
                window.setTimeout(resolve, 250 * (attempt + 1));
            });
        }
    };

    const setShiftWithStorage = (nextShift: string) => {
        localStorage.setItem("shift", nextShift);
        setShift(nextShift);
    };

    const logout = async () => {
        logoutInProgressRef.current = true;
        refreshRequestIdRef.current += 1;
        setUser(null);
        setInitializing(false);

        try {
            await ensureCsrfCookie();
            await axios.post("/logout");
            await waitForSessionToClear();
        } catch (error) {
            console.error("Logout failed", error);
        }

        window.location.replace("/login");
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                refreshUser,
                logout,
                shift,
                setShift: setShiftWithStorage,
                initializing,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
