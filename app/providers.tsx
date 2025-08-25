"use client";

import UserProvider from "@/context/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
}
