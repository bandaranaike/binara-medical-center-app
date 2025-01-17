import React from 'react';

interface StatusLabelProps {
    status: string;
}

const StatusLabel: React.FC<StatusLabelProps> = ({status}) => {
    const statusStyles: { [key: string]: string } = {

        booked: "bg-blue-800",
        doctor: "bg-purple-800",
        done: "bg-green-800",
        pharmacy: "bg-cyan-800",
        reception: "bg-red-800",
        temporary: "bg-yellow-500",
    };

    const getStatusStyle = (status: string) => {
        return statusStyles[status.toLowerCase()] || "bg-gray-600"; // Default style for unknown statuses
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
