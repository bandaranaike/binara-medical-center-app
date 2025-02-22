import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import StatusLabel from "@/components/form/StatusLabel";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import {Booking} from "@/types/interfaces";
import ShowBillAndPrint from "@/components/popup/ShowBillAndPrint";

const ReceptionList: React.FC = () => {
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
        <div className="rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Ongoing Bills</h2>
            {loading ? (
                <p>Loading bills...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : bills.length > 0 ? (
                <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="font-bold">
                        <tr>
                            <th className="px-4 py-4 bg-gray-800">Bill #</th>
                            <th className="px-4 py-4 bg-gray-800">Queue #</th>
                            <th className="px-4 py-4 bg-gray-800">Status</th>
                            <th className="px-4 py-4 bg-gray-800">Doctor Name</th>
                            <th className="px-4 py-4 bg-gray-800">Type</th>
                            <th className="px-4 py-4 bg-gray-800">Patient Name</th>
                            <th className="px-4 py-4 bg-gray-800">Amount</th>
                            <th className="px-4 py-4 bg-gray-800">Date</th>
                            <th className="px-4 py-4 bg-gray-800">Payment</th>
                            <th className="px-4 py-4 bg-gray-800">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bills.map((bill) => (
                            <tr key={bill.id} className="border-t border-gray-800">
                                <td className="px-4 py-2 border-r border-gray-800">{bill.id}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.queue_number}</td>
                                <td className="px-4 py-2 border-r border-gray-800"><StatusLabel status={bill.status}/></td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.doctor_name}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.appointment_type}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.patient_name}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{(Number(bill.bill_amount) + Number(bill.system_amount)).toFixed(2)}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.queue_date}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.payment_status}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="px-4 py-1 mr-3 rounded bg-blue-800 text-white"
                                        onClick={() => handleShowBill(bill)}
                                    >
                                        Mark as Done
                                    </button>
                                    <button
                                        className="px-4 py-1 rounded bg-red-800 text-white"
                                        onClick={() => showDeleteConfirmation(bill)}
                                        disabled={!!bill.id}
                                    >
                                        Delete
                                    </button>
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
                    deleteId={selectedBill!.id}
                >Are you sure you want to delete this booking?</DeleteConfirm>
            )}
        </div>
    );
};

export default ReceptionList;
