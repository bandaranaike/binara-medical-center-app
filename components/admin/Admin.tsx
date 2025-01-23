import React from "react";
import AdminTabs, {AdminTab} from "@/components/admin/AdminTabs";

const Admin = () => {

    const tabs: AdminTab[] = [
        {id: "allergies", fields: ["name"]},
        {id: "diseases", fields: ["name"]},
        {id: "hospitals", fields: ["name", "location"]},
        {id: "specialties", fields: ["name"]},
        {
            id: "doctors",
            fields: ["name", "hospital", "specialty", "user", "telephone", "type", "email"],
            dropdowns: {hospital: 'hospitals', specialty: 'specialties', user: 'users'},
            select: {type: ['specialist', 'opd', 'dental']}
        },
        {id: "roles", fields: ["name", "key", "description"]}
    ];

    return (<AdminTabs tabs={tabs}/>)
}

export default Admin;