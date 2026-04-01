import React from "react";

interface StatusLabelProps {
    status: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({status}) => {
    const statusStyles: { [key: string]: string } = {
        // Medical Departments
        dental: "bg-teal-100 text-teal-800 dark:bg-teal-500/18 dark:text-teal-200",
        opd: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/18 dark:text-indigo-200",
        specialist: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/18 dark:text-fuchsia-200",
        treatment: "bg-amber-100 text-amber-800 dark:bg-amber-500/18 dark:text-amber-200",

        // Payment Status
        pending: "bg-orange-100 text-orange-800 dark:bg-orange-500/18 dark:text-orange-200",
        paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",
        cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-500/18 dark:text-rose-200",
        refunded: "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200",

        // Booking Status
        booked: "bg-blue-100 text-blue-800 dark:bg-blue-500/18 dark:text-blue-200",
        doctor: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/18 dark:text-fuchsia-200",
        done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",
        pharmacy: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/18 dark:text-cyan-200",
        reception: "bg-violet-100 text-violet-800 dark:bg-violet-500/18 dark:text-violet-200",

        // General Status
        active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",
        canceled: "bg-rose-100 text-rose-800 dark:bg-rose-500/18 dark:text-rose-200",
        inactive: "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200",

        // Recurrence Types
        daily: "bg-blue-100 text-blue-800 dark:bg-blue-500/18 dark:text-blue-200",
        weekly: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/18 dark:text-indigo-200",
        "bi-weekly": "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/18 dark:text-fuchsia-200",
        monthly: "bg-pink-100 text-pink-800 dark:bg-pink-500/18 dark:text-pink-200",
        "bi-monthly": "bg-amber-100 text-amber-800 dark:bg-amber-500/18 dark:text-amber-200",
        quarterly: "bg-orange-100 text-orange-800 dark:bg-orange-500/18 dark:text-orange-200",
        yearly: "bg-teal-100 text-teal-800 dark:bg-teal-500/18 dark:text-teal-200",
        once: "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200",
        "as needed": "bg-rose-100 text-rose-800 dark:bg-rose-500/18 dark:text-rose-200",
        variable: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",

        // Payment Methods
        cash: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",
        card: "bg-blue-100 text-blue-800 dark:bg-blue-500/18 dark:text-blue-200",
        online: "bg-purple-100 text-purple-800 dark:bg-purple-500/18 dark:text-purple-200",

        // Roles
        admin: "bg-pink-100 text-pink-800 dark:bg-pink-500/18 dark:text-pink-200",
        patient: "bg-amber-100 text-amber-800 dark:bg-amber-500/18 dark:text-amber-200",
        nurse: "bg-blue-100 text-blue-800 dark:bg-blue-500/18 dark:text-blue-200",
        pharmacy_admin: "bg-stone-200 text-stone-700 dark:bg-stone-500/18 dark:text-stone-200",

        // Days of the Week
        monday: "bg-teal-100 text-teal-800 dark:bg-teal-500/18 dark:text-teal-200",
        tuesday: "bg-lime-100 text-lime-800 dark:bg-lime-500/18 dark:text-lime-200",
        wednesday: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/18 dark:text-emerald-200",
        thursday: "bg-purple-100 text-purple-800 dark:bg-purple-500/18 dark:text-purple-200",
        friday: "bg-green-100 text-green-800 dark:bg-green-500/18 dark:text-green-200",
        saturday: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/18 dark:text-indigo-200",
        sunday: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/18 dark:text-fuchsia-200",
    };

    const getStatusStyle = (status: string) => {
        return status && statusStyles[status.toLowerCase()] || "bg-slate-200 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200";
    };

    return (
        <span
            className={`inline-block rounded-[999px] px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                status
            )}`}
        >
      {status}
    </span>
    );
};

export default StatusLabel;
