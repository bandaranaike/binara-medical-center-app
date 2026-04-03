import React from "react";
import {Booking} from "@/types/interfaces";

const BookingsTable: React.FC<{
    bookings: Booking[];
    isTodayTab: boolean;
    handleShowBooking: (booking: Booking) => void;
    showDeleteConfirmation: (booking: Booking) => void;
}> = ({bookings, handleShowBooking, showDeleteConfirmation}) => (
    <div
        className="overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]"
        style={{borderColor: "var(--border-subtle)"}}
    >
        <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[var(--foreground)]">
                <thead style={{background: "var(--surface-soft)"}}>
                    <tr>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Bill Id</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Booking Number</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Doctor Name</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Appointment Type</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Patient</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Amount</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Date</th>
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{color: "var(--muted)"}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => {
                        const isLocked = !!booking.bill_id;

                        return (
                            <tr
                                key={booking.id}
                                className="transition hover:bg-[var(--surface-soft)]"
                                style={{borderTop: "1px solid var(--border-subtle)"}}
                            >
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{booking.id}</td>
                                <td className="whitespace-nowrap px-4 py-3" style={{color: "var(--muted-strong)"}}>{booking.queue_number}</td>
                                <td className="whitespace-nowrap px-4 py-3" style={{color: "var(--muted-strong)"}}>{booking.doctor_name ?? "No doctor assigned"}</td>
                                <td className="whitespace-nowrap px-4 py-3" style={{color: "var(--muted-strong)"}}>{booking.appointment_type}</td>
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{booking.patient_name}</td>
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{(Number(booking.bill_amount) + Number(booking.system_amount)).toFixed(2)}</td>
                                <td className="whitespace-nowrap px-4 py-3" style={{color: "var(--muted-strong)"}}>{booking.queue_date}</td>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            className="rounded-[0.8rem] px-3 py-2 text-sm font-medium transition"
                                            style={{
                                                background: isLocked ? "var(--surface-soft)" : "linear-gradient(135deg, var(--accent), var(--accent-strong))",
                                                color: isLocked ? "var(--muted)" : "#ffffff",
                                                border: isLocked ? "1px solid var(--border-subtle)" : "1px solid transparent",
                                                cursor: isLocked ? "not-allowed" : "pointer",
                                            }}
                                            onClick={() => handleShowBooking(booking)}
                                            disabled={isLocked}
                                        >
                                            Create Bill
                                        </button>
                                        <button
                                            className="rounded-[0.8rem] border px-3 py-2 text-sm font-medium transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                                            style={{
                                                borderColor: "var(--border-subtle)",
                                                background: "var(--surface-elevated)",
                                                color: isLocked ? "var(--muted)" : "#dc2626",
                                                cursor: isLocked ? "not-allowed" : "pointer",
                                                opacity: isLocked ? 0.7 : 1,
                                            }}
                                            onClick={() => showDeleteConfirmation(booking)}
                                            disabled={isLocked}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

export default BookingsTable;
