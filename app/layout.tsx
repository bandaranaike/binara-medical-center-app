import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_TITLE,
    description: "Created By Eranda Bandaranaike",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" className="dark">
        <body className={inter.className}>{children}</body>
        </html>
    );
}
