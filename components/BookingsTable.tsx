import React from "react";
import {Booking} from "@/types/interfaces";

const BookingsTable: React.FC<{
    bookings: Booking[];
    isTodayTab: boolean;
    handleShowBooking: (booking: Booking) => void;
    showDeleteConfirmation: (booking: Booking) => void;
}> = ({bookings, handleShowBooking, showDeleteConfirmation}) => (
    <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="font-bold">
            <tr className="bg-gray-800">
                <th className="px-4 py-4">Bill Id</th>
                <th className="px-4 py-4">Booking Number</th>
                <th className="px-4 py-4">Doctor Name</th>
                <th className="px-4 py-4">Appointment Type</th>
                <th className="px-4 py-4">Patient</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Action</th>
            </tr>
            </thead>
            <tbody>
            {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-gray-800">
                    <td className="px-4 py-2 border-r border-gray-800">{booking.id}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{booking.queue_number}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{booking.doctor_name ?? 'No doctor assigned'}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{booking.appointment_type}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{booking.patient_name}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{(Number(booking.bill_amount) + Number(booking.system_amount)).toFixed(2)}</td>
                    <td className="px-4 py-2 border-r border-gray-800">{booking.queue_date}</td>
                    <td className="px-4 py-2">
                        <button
                            className="px-4 py-1 rounded bg-blue-800 text-white mr-4"
                            onClick={() => handleShowBooking(booking)}
                            disabled={!!booking.bill_id}
                        >
                            Create Bill
                        </button>
                        <button
                            className="px-4 py-1 rounded bg-red-800 text-white"
                            onClick={() => showDeleteConfirmation(booking)}
                            disabled={!!booking.bill_id}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default BookingsTable;
