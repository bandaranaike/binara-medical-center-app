"use client";

import React from "react";

import UserProvider from "@/context/UserContext";
import Main from "@/components/Main";

const Page = () => {
    return (
        <UserProvider>
            <Main/>
        </UserProvider>
    );
};

export default Page;
