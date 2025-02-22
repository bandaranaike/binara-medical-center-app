import React, {FC} from "react";
import TableComponent from "@/components/TableComponent";
import {AdminTab} from "@/components/admin/AdminTabs";

const DoctorAvailabilityManager: FC = () => {
    const tab: AdminTab = {
        id: "doctors-availabilities",
        fields: ['doctor', 'time', 'date', 'seats', 'available_seats', 'status'],
        dropdowns: {doctor: "doctors"},
        select: {status: ['active', 'canceled']},
    };

    return <div>
        <TableComponent tab={tab}/>
    </div>
}

export default DoctorAvailabilityManager;