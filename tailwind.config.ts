import type {Config} from "tailwindcss";
import {nextui} from "@nextui-org/react";
import {plugin, content} from "flowbite-react/tailwind";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/flowbite-react/lib/**/*.js",
        "./node_modules/tailwind-datepicker-react/dist/**/*.js",
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
        content(),
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [
        require("flowbite/plugin"), nextui(),
        plugin(),
    ],
};
export default config;
