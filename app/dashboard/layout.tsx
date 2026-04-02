"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Activity, BriefcaseMedical, CalendarDays, ClipboardList, FlaskConical, LayoutDashboard, Pill, ReceiptText, Shield, Stethoscope, SunMoon, TrendingUp, Users, WalletCards} from "lucide-react";
import {ReactNode, useEffect, useMemo} from "react";
import CustomRadio from "@/components/form/CustomRadio";
import Loader from "@/components/form/Loader";
import ModalRoot from "@/components/ModalRoot";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {useUserContext} from "@/context/UserContext";
import {DASHBOARD_TABS} from "@/lib/dashboardTabs";

const tabIcons = {
    admin: Shield,
    bookings: CalendarDays,
    channel: WalletCards,
    dental: Activity,
    "doctor-portal": Stethoscope,
    opd: BriefcaseMedical,
    "pharmacy-admin": FlaskConical,
    "pharmacy-portal": Pill,
    reports: TrendingUp,
    "reception-admin": Users,
    services: ClipboardList,
    "stat-summary": ReceiptText,
    "today-list": LayoutDashboard,
    welcome: SunMoon,
} as const;

export default function DashboardLayout({children}: { children: ReactNode }) {
    const {user, logout, shift, setShift, initializing} = useUserContext();
    const pathname = usePathname();
    const router = useRouter();
    const userInitials = user?.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "AD";

    const tabs = useMemo(
        () => (user ? DASHBOARD_TABS.filter((tab) => tab.roles.includes(user.role)) : []),
        [user]
    );

    useEffect(() => {
        if (!initializing && !user) {
            router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
        }
    }, [initializing, pathname, router, user]);

    useEffect(() => {
        if (pathname === "/dashboard" && tabs[0]) {
            router.replace(tabs[0].path);
        }
    }, [pathname, router, tabs]);

    if (initializing || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader size="h-12 w-12" color="fill-fuchsia-600"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-3 pb-5 pt-4 sm:px-4 sm:pt-5 lg:px-5">
            <div className="mx-auto flex w-full max-w-[1880px] flex-col gap-3">
                <header className="app-panel-elevated overflow-hidden px-3 py-3 sm:px-4 lg:px-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-[999px] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{background: "var(--accent-soft)", color: "var(--accent-strong)"}}>
                                <span className="h-2 w-2 rounded-full" style={{background: "var(--accent-strong)"}}></span>
                                Medical Center Ops
                            </div>
                            <div className="mt-3">
                                <h1 className="text-[2rem] font-semibold leading-none">{process.env.NEXT_PUBLIC_APP_TITLE}</h1>
                                <p className="mt-1.5 max-w-2xl text-sm leading-5" style={{color: "var(--muted)"}}>
                                    Compact top navigation with more horizontal room for dense billing, inventory, and reporting tables.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 xl:max-w-[560px] xl:items-end">
                            <div className="flex flex-wrap items-center justify-end gap-2 rounded-[var(--radius-md)] border px-2 py-1.5" style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}>
                                <ThemeToggle compact/>
                                <div className="flex flex-wrap items-center gap-3 rounded-full px-3 py-2" style={{background: "var(--surface-elevated)"}}>
                                    <CustomRadio size={5} label="Morning" value="morning" groupValue={shift} onChange={setShift}/>
                                    <CustomRadio size={5} label="Evening" value="evening" groupValue={shift} onChange={setShift}/>
                                </div>
                                <button className="app-button-secondary px-3 py-2 text-sm rounded-full" onClick={() => void logout()}>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                        <nav className="min-w-0 flex-1 overflow-x-auto pb-1">
                            <div className="flex min-w-max items-center gap-2">
                                {tabs.map((tab) => {
                                    const isActive = pathname === tab.path || pathname?.startsWith(`${tab.path}/`);
                                    const TabIcon = tabIcons[tab.id as keyof typeof tabIcons] || LayoutDashboard;

                                    return (
                                        <Link
                                            key={tab.id}
                                            href={tab.path}
                                            className="group flex items-center gap-2.5 rounded-[var(--radius-sm)] border px-2.5 py-2 transition"
                                            style={{
                                                background: isActive ? "linear-gradient(135deg, var(--accent), var(--accent-strong))" : "var(--surface-soft)",
                                                borderColor: isActive ? "transparent" : "var(--border-subtle)",
                                                color: isActive ? "#ffffff" : "var(--muted-strong)",
                                            }}
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]" style={{background: isActive ? "rgba(255,255,255,0.16)" : "var(--surface-elevated)", color: isActive ? "#ffffff" : "var(--accent-strong)"}}>
                                                <TabIcon className="h-4 w-4"/>
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-[13px] font-semibold leading-none">{tab.label}</span>
                                                <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.22em]" style={{color: isActive ? "rgba(255,255,255,0.78)" : "var(--muted)"}}>
                                                    {tab.id.replaceAll("-", " ")}
                                                </span>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        <div className="flex items-center justify-end gap-2 rounded-[var(--radius-md)] border px-3 py-2" style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}>
                            <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold" style={{background: "var(--accent-soft)", color: "var(--accent-strong)"}}>
                                {userInitials}
                            </div>
                            <div className="min-w-0 text-right">
                                <p className="truncate text-sm font-semibold">{user.name}</p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.22em]" style={{color: "var(--muted)"}}>
                                    {user.role.replaceAll("-", " ")}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="app-panel min-h-[68vh] w-full p-3 sm:p-4 lg:p-5">
                    {children}
                </main>

                <footer className="app-panel flex flex-col gap-2 px-5 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between" style={{color: "var(--muted)"}}>
                    <span>{process.env.NEXT_PUBLIC_APP_ADDRESS}</span>
                    <span>Telephone: {process.env.NEXT_PUBLIC_APP_TELEPHONE}</span>
                    <span>Fax: {process.env.NEXT_PUBLIC_APP_FAX}</span>
                    <span>Email: {process.env.NEXT_PUBLIC_APP_EMAIL}</span>
                </footer>
            </div>

            <ModalRoot/>
        </div>
    );
}
