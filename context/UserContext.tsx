import {LoggedUser} from "@/types/interfaces";
import React, {createContext, useContext, useState, useEffect} from "react";
import axios from "@/lib/axios";
import Cookies from "js-cookie"; // for reading cookies on client

// Define the context type
interface UserContextType {
    user: LoggedUser | null;
    setUser: (user: LoggedUser | null) => void;
    logout: () => void;
    shift: string;
    setShift: (shift: string) => void;
    initializing: boolean;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

// Provider
const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<LoggedUser | null>(null);
    const [shift, setShift] = useState("morning");
    const [initializing, setInitializing] = useState(true);

    // Load on mount
    useEffect(() => {
        const shiftStored = localStorage.getItem("shift");
        if (shiftStored) {
            setShift(shiftStored);
        }

        const token = Cookies.get("token");
        if (token) {
            // Fetch logged-in user from backend
            axios.get("/check-user-session")
                .then(res => {
                    setUser(res.data);
                    if (!res.data.token) {
                        Cookies.remove("token");
                    }
                })
                .catch(() => {
                    setUser(null);
                    Cookies.remove("token");
                    localStorage.removeItem("user");
                })
                .finally(() => setInitializing(false));
        } else {
            setUser(null);
            localStorage.removeItem("user");
            setInitializing(false);
        }
    }, []);

    // Set user and persist to localStorage
    const setUserWithStorage = (user: LoggedUser | null) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            Cookies.set("token", JSON.stringify(user.token));
        } else {
            localStorage.removeItem("user");
        }
        setUser(user);
    };

    const setShiftWithStorage = (shift: string) => {
        localStorage.setItem("shift", shift);
        setShift(shift);
    };

    // Logout
    const logout = async () => {
        try {
            await axios.post("/logout").then(() => {
                setUser(null)
                Cookies.remove("token");
                location.replace('/login');
            });
        } catch (e) {
            console.error("Logout failed", e);
        }
        Cookies.remove("token");
        setUserWithStorage(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser: setUserWithStorage,
                logout,
                shift,
                setShift: setShiftWithStorage,
                initializing
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
