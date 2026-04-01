"use client";

import React, {createContext, useContext, useEffect, useState} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const storageKey = "ui-theme";

const applyTheme = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
        const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme;

        setThemeState(nextTheme);
        applyTheme(nextTheme);
        setMounted(true);
    }, []);

    const setTheme = (nextTheme: Theme) => {
        setThemeState(nextTheme);
        window.localStorage.setItem(storageKey, nextTheme);
        applyTheme(nextTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                resolvedTheme: mounted ? theme : "dark",
                toggleTheme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }

    return context;
};
