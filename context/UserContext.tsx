import {LoggedUser} from "@/types/interfaces";
import React, {createContext, useContext, useState, useEffect} from "react";
import axios from "@/lib/axios";

// Define the context type
interface UserContextType {
    user: LoggedUser | null;
    setUser: (user: LoggedUser | null) => void;
    logout: () => void;
    shift: string;
    setShift: (shift: string) => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a custom hook for accessing the context
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

// Create the Provider component
const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUser] = useState<LoggedUser | null>(null);
    const [shift, setShift] = useState("morning");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const shift = localStorage.getItem("shift");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (shift) {
            setShift(shift);
        }
    }, []);

    // Function to set user data and persist to localStorage
    const setUserWithStorage = (user: LoggedUser | null) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
        setUser(user);
    };

    const setShiftWithStorage = (shift: string) => {
        localStorage.setItem("shift", shift);
        setShift(shift);
    }

    // Logout function
    const logout = () => {
        axios.post('logout')
        setUserWithStorage(null);
    };

    return (
        <UserContext.Provider value={{user, setUser: setUserWithStorage, logout, shift, setShift: setShiftWithStorage}}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
