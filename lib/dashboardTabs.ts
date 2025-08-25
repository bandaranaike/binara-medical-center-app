import type { ReactElement } from "react";

export type TabDef = {
    id: string;
    label: string;
    path: string;      // route path under /dashboard
    roles: string[];
};

// Keep route names stable & readable
export const DASHBOARD_TABS: TabDef[] = [
    { id: "channel",          label: "Channel",            path: "/dashboard/channel",          roles: ["reception"] },
    { id: "opd",              label: "OPD",                path: "/dashboard/opd",              roles: ["reception"] },
    { id: "dental",           label: "Dental Portal",      path: "/dashboard/dental",           roles: ["reception"] },
    { id: "services",         label: "Treatments",         path: "/dashboard/services",         roles: ["reception"] },
    { id: "doctor-portal",    label: "Doctor Portal",      path: "/dashboard/doctor-portal",    roles: ["doctor"] },
    { id: "pharmacy-portal",  label: "Pharmacy Portal",    path: "/dashboard/pharmacy-portal",  roles: ["pharmacy", "pharmacy_admin", "doctor"] },
    { id: "stat-summary",     label: "Stat Summary",       path: "/dashboard/stat-summary",     roles: ["admin"] },
    { id: "bookings",         label: "Bookings",           path: "/dashboard/bookings",         roles: ["reception", "admin"] },
    { id: "today-list",       label: "Today List",         path: "/dashboard/today-list",       roles: ["reception", "admin"] },
    { id: "reception-admin",  label: "Reception Admin",    path: "/dashboard/reception-admin",  roles: ["reception"] },
    { id: "admin",            label: "Admin",              path: "/dashboard/admin",            roles: ["admin"] },
    { id: "pharmacy-admin",   label: "Pharmacy Admin",     path: "/dashboard/pharmacy-admin",   roles: ["pharmacy_admin", "admin"] },
    { id: "reports",          label: "Reports",            path: "/dashboard/reports",          roles: ["admin"] },
    { id: "welcome",          label: "Welcome",            path: "/dashboard/welcome",          roles: ["patient"] },
];
