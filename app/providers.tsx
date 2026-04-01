"use client";

import UserProvider from "@/context/UserContext";
import {ThemeProvider} from "@/context/ThemeContext";

export default function Providers({children}: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <UserProvider>{children}</UserProvider>
        </ThemeProvider>
    );
}
