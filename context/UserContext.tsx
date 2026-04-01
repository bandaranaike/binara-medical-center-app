import {LoggedUser} from "@/types/interfaces";
import React, {createContext, useContext, useEffect, useState} from "react";
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

    const refreshUser = async (): Promise<LoggedUser | null> => {
        try {
            const response = await axios.get("/check-user-session");
            setUser(response.data);
            return response.data;
        } catch {
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

    const setShiftWithStorage = (nextShift: string) => {
        localStorage.setItem("shift", nextShift);
        setShift(nextShift);
    };

    const logout = async () => {
        try {
            await ensureCsrfCookie();
            await axios.post("/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
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
