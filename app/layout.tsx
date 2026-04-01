import type {Metadata} from "next";
import {Manrope, Space_Grotesk} from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
});

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_APP_TITLE,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
