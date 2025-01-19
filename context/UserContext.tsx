import {LoggedUser} from "@/types/interfaces";
import React, {createContext, useContext, useState, useEffect} from "react";

// Define the context type
interface UserContextType {
    user: LoggedUser | null;
    setUser: (user: LoggedUser | null) => void;
    logout: () => void;
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

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
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

    // Logout function
    const logout = () => {
        setUserWithStorage(null);
    };

    return (
        <UserContext.Provider value={{user, setUser: setUserWithStorage, logout}}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
