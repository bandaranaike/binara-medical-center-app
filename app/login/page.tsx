"use client";

import React, {Suspense, useEffect} from "react";
import Authenticate from "@/components/authentication/Authenticate";
import Loader from "@/components/form/Loader";
import {useUserContext} from "@/context/UserContext";
import {useRouter, useSearchParams} from "next/navigation";

const LoginPageContent = () => {
    const {setUser, user, initializing} = useUserContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/dashboard";

    useEffect(() => {
        if (!initializing && user) {
            router.replace(nextPath);
        }
    }, [initializing, nextPath, router, user]);

    if (initializing) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader size="h-12 w-12" color="fill-fuchsia-600"/>
            </div>
        );
    }

    return (
        <Authenticate onLoginStatusChange={(loggedUser) => {
            setUser(loggedUser);
            router.replace(nextPath);
        }}/>
    );
};

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader size="h-12 w-12" color="fill-fuchsia-600"/>
            </div>
        }>
            <LoginPageContent/>
        </Suspense>
    );
}
