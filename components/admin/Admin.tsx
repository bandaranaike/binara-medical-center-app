import React from "react";
import AdminTabs, {AdminTab} from "@/components/admin/AdminTabs";
import axios from "@/lib/axios";

const Admin = () => {
    const createUserForDoctor = async (record: any) => {
        return axios.post('users/create-from-doctor', {doctor_id: record.id})
    }

    const tabs: AdminTab[] = [
        {id: "allergies", fields: ["name"]},
        {id: "diseases", fields: ["name"]},
        {id: "hospitals", fields: ["name", "location"]},
        {id: "specialties", fields: ["name"]},
        {
            id: "doctors",
            fields: ["name", "hospital", "specialty", "user", "telephone", "type", "email"],
            dropdowns: {hospital: 'hospitals', specialty: 'specialties', user: 'users'},
            select: {type: ['specialist', 'opd', 'dental']},
            actions: [{key: "Create a user", callBack: createUserForDoctor}]
        },
        {
            id: "doctors-schedules",
            fields: ["doctor", "weekday", "recurring", "status", "time", "seats"],
            dropdowns: {doctor: 'doctors'},
            select: {
                weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                recurring: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Bi-Monthly', 'Quarterly', 'Yearly', 'Once', 'As Needed', 'Variable'],
                status: ['active', 'inactive']
            }
        },
        {id: "roles", fields: ["name", "key", "description"]},
        {id: "users", fields: ["name", "role", "email", "password"], dropdowns: {role: "roles"}},
        {id: "trusted-sites", fields: ["domain", "api_key"]},
    ];

    return (<AdminTabs tabs={tabs}/>)
}

export default Admin;