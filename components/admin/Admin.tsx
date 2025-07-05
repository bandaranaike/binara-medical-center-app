import React from "react";
import AdminTabs, {AdminTab} from "@/components/admin/AdminTabs";
import axios from "@/lib/axios";

const Admin = () => {
    const createUserForDoctor = async (record: any) => {
        return axios.post('users/create-from-doctor', {doctor_id: record.id})
    }

    const tabs: AdminTab[] = [
        {
            id: "allergies", fields: ["name"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "diseases",
            fields: ["name"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "hospitals", fields: ["name", "location"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "specialties",
            fields: ["name"],
            filters: {
                options: [{label: "Name", value: "name"}],
            }
        },
        {
            id: "doctors",
            fields: ["name", "hospital", "specialty", "user", "telephone", "doctor_type", "email"],
            dropdowns: {hospital: 'hospitals', specialty: 'specialties', user: 'users'},
            select: {doctor_type: ['specialist', 'opd', 'dental']},
            actions: [{key: "Create a user", callBack: createUserForDoctor}],
            filters: {
                options: [
                    {label: "Name", value: "name"},
                    {label: "Hospital", value: "hospital:name"},
                    {label: "Specialty", value: "specialty:name"},
                    {label: "Type", value: "doctor_type"},
                ]
            },
            labels: ['doctor_type']
        },
        {
            id: "doctors-schedules",
            fields: ["doctor", "weekday", "recurring", "status", "time", "seats"],
            dropdowns: {doctor: 'doctors'},
            select: {
                weekday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                recurring: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Bi-Monthly', 'Quarterly', 'Yearly', 'Once', 'As Needed', 'Variable'],
                status: ['active', 'inactive']
            },
            filters: {
                options: [
                    {label: "Doctor name", value: "doctor:name"},
                    {label: "Weekday", value: "weekday"},
                    {label: "Recurring", value: "recurring"},
                ]
            },
            labels: ['weekday', 'recurring', 'status']
        },
        {
            id: "doctors-availabilities",
            fields: ['doctor', 'time', 'date', 'seats', 'available_seats', 'status'],
            dropdowns: {doctor: "doctors"},
            select: {status: ['active', 'canceled']},
            filters: {
                options: [
                    {label: "Doctor Name", value: 'doctor:name'},
                    {label: "Date", value: 'date'},
                ],
                types: {date: "date"}
            },
            labels: ['status'],
            types: {date: "date"}
        },
        {
            id: "roles", fields: ["name", "key", "description"],
            filters: {
                options: [{label: "Name", value: "name"}],
            },
            labels: ['key']
        },
        {
            id: "users",
            fields: ["name", "role", "email", "password"],
            dropdowns: {role: "roles"},
            filters: {
                options: [
                    {label: "Name", value: "name"},
                    {label: "Role", value: "role:name"},
                    {label: "Email", value: "email"},
                ],
            },
            labels: ['role']
        },
        {
            id: "trusted-sites", fields: ["domain", "api_key"],
            filters: {
                options: [{label: "Domain", value: "domain"}],
            }
        },
        {
            id: "services", fields: ["name", "key", 'bill_price', 'system_price', 'separate_items', 'is_percentage'],
        },
    ];

    return (<AdminTabs tabs={tabs}/>)
}

export default Admin;