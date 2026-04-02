import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import StatusLabel from "@/components/form/StatusLabel";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import {Booking} from "@/types/interfaces";
import ShowBillAndPrint from "@/components/popup/ShowBillAndPrint";

const TodayList: React.FC = () => {
    const [bills, setBills] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showBill, setShowBill] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Booking | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean | undefined>()

    const handleShowBill = (bill: Booking) => {
        setSelectedBill(bill);
        setShowBill(true);
    };

    const fetchBills = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get("/bills/pending/reception");
            setBills(response.data);
        } catch (err) {
            setError("Failed to load bills. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleDeleteBooking = () => {
        fetchBills();
    };
    const showDeleteConfirmation = (bill: Booking) => {
        setSelectedBill(bill)
        setShowDeleteModal(true);
    };
    return (
        <div className="space-y-5">
            <div
                className="rounded-[var(--radius-md)] border p-4"
                style={{borderColor: "var(--border-subtle)", background: "color-mix(in srgb, var(--surface-soft) 72%, transparent)"}}
            >
                <h2 className="text-2xl font-bold">Ongoing Bills</h2>
                <p className="mt-1 text-sm" style={{color: "var(--muted)"}}>
                    Track pending reception bills and complete or remove them as needed.
                </p>
            </div>
            {loading ? (
                <p>Loading bills...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : bills.length > 0 ? (
                <div
                    className="relative overflow-x-auto rounded-[var(--radius-md)] border"
                    style={{borderColor: "var(--border-subtle)", background: "var(--surface-elevated)"}}
                >
                    <table className="w-full text-left text-sm" style={{color: "var(--muted-strong)"}}>
                        <thead className="font-bold">
                        <tr>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Bill #</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Queue #</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Status</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Doctor Name</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Type</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Patient Name</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Amount</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Date</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Payment</th>
                            <th className="px-4 py-4" style={{background: "var(--surface-soft)"}}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.id} style={{borderTop: "1px solid var(--border-subtle)"}}>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.id}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.queue_number}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}><StatusLabel status={bill.status}/></td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.doctor_name}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.appointment_type}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.patient_name}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{(Number(bill.bill_amount) + Number(bill.system_amount)).toFixed(2)}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.queue_date}</td>
                                <td className="px-4 py-3" style={{borderRight: "1px solid var(--border-subtle)"}}>{bill.payment_status}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="app-button-primary mr-3 px-4 py-2 text-sm"
                                        onClick={() => handleShowBill(bill)}
                                    >
                                        {bill.status == "done" ? "Print bill" : "Mark as Done"}
                                    </button>
                                    {bill.status != "done" &&
                                        <button
                                            className="rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium transition"
                                            style={{
                                                borderColor: "rgba(244, 63, 94, 0.28)",
                                                background: "rgba(244, 63, 94, 0.08)",
                                                color: "rgb(225, 29, 72)",
                                            }}
                                            onClick={() => showDeleteConfirmation(bill)}
                                        >
                                            Delete
                                        </button>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No pending bills available.</p>
            )}

            {showBill &&
                <ShowBillAndPrint
                    selectedBooking={selectedBill}
                    onRemoveSelectedBooking={() => setSelectedBill(null)}
                    onConverted={() => fetchBills()}
                    status="done"
                    onCloseBooking={() => setShowBill(false)}/>
            }

            {showDeleteModal && (
                <DeleteConfirm
                    deleteApiUrl="bills"
                    onClose={() => setShowDeleteModal(false)}
                    onDeleteSuccess={() => handleDeleteBooking()}
                    deleteId={selectedBill!.uuid}
                >Are you sure you want to delete this booking?</DeleteConfirm>
            )}
        </div>
    );
};

export default TodayList;
