import React from "react";
import AdminTabs, {AdminTab} from "@/components/admin/AdminTabs";

const ReceptionAdmin = () => {

    const tabs: AdminTab[] = [
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
            }
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
            }
        },
        {
            id: "bill-cruds",
            fields: ["doctor", "patient", "payment", "appointment_date", "created_at", "appointment_type", "payment_type", "payment_status", "status"],
            dropdowns: {doctor: 'doctors'},
            readonly: true,
            filters: {
                options: [
                    {label: "Doctor name", value: "doctor:name"},
                    {label: "Patient name", value: "patient:name"},
                    {label: "Appointment date", value: "date"},
                    {label: "Created date", value: "created_at"},
                ],
                types: {date: "date", created_at: "date"}
            }
        },
    ];

    return (<AdminTabs tabs={tabs}/>)
}

export default ReceptionAdmin;