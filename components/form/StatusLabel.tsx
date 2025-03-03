import React from "react";

interface StatusLabelProps {
    status: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({status}) => {
    const statusStyles: { [key: string]: string } = {
        // Medical Departments
        dental: "bg-teal-800",
        opd: "bg-indigo-800",
        specialist: "bg-fuchsia-800",
        treatment: "bg-yellow-600",

        // Payment Status
        pending: "bg-orange-800",
        paid: "bg-green-800",
        cancelled: "bg-red-800",
        refunded: "bg-gray-700",

        // Booking Status
        booked: "bg-blue-800",
        doctor: "bg-fuchsia-800",
        done: "bg-green-800",
        pharmacy: "bg-cyan-800",
        reception: "bg-violet-800",

        // General Status
        active: "bg-green-700",
        canceled: "bg-red-700",
        inactive: "bg-gray-700",

        // Recurrence Types
        daily: "bg-blue-900",
        weekly: "bg-indigo-900",
        "bi-weekly": "bg-fuchsia-900",
        monthly: "bg-pink-900",
        "bi-monthly": "bg-yellow-900",
        quarterly: "bg-orange-900",
        yearly: "bg-teal-900",
        once: "bg-gray-800",
        "as needed": "bg-red-900",
        variable: "bg-green-900",

        // Payment Methods
        cash: "bg-green-900",
        card: "bg-blue-900",
        online: "bg-purple-900",

        // Roles
        admin: "bg-pink-900",
        patient: "bg-amber-800",
        nurse: "bg-blue-800",
        pharmacy_admin: "bg-stone-700",

        // Days of the Week
        monday: "bg-teal-800",
        tuesday: "bg-lime-800",
        wednesday: "bg-emerald-800",
        thursday: "bg-purple-800",
        friday: "bg-green-800",
        saturday: "bg-indigo-800",
        sunday: "bg-fuchsia-800",
    };

    const getStatusStyle = (status: string) => {
        return status && statusStyles[status.toLowerCase()] || "bg-gray-600"; // Default style for unknown statuses
    };

    return (
        <span
            className={`inline-block px-2 py-0.5 text-white rounded text-sm font-medium ${getStatusStyle(
                status
            )}`}
        >
      {status}
    </span>
    );
};

export default StatusLabel;
