"use client";

import React, {useEffect} from "react";
import Authenticate from "@/components/authentication/Authenticate";
import {useUserContext} from "@/context/UserContext";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const {setUser, user, initializing} = useUserContext();
    const router = useRouter();

    useEffect(() => {
        if (!initializing && user) {
            router.replace("/dashboard");
        }
    }, [initializing, user, router]);

    if (initializing) return null; // or a spinner/skeleton

    return <Authenticate onLoginStatusChange={(u) => {
        setUser(u);
        router.replace("/dashboard");
    }}/>;
}
