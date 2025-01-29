import React, {useEffect, useState} from "react";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import StatusLabel from "@/components/form/StatusLabel";
import printService from "@/lib/printService";

interface Bill {
    bill_amount: number;
    id: number;
    queue_number: number;
    patient_name: string;
    doctor_name: string;
    queue_date: string;
    status: string; // To track the status of the bill
}

const ReceptionList: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showBill, setShowBill] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const handleShowBill = (bill: Bill) => {
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

    const handleMarkAsDone = async (bill: Bill) => {
        try {
            setIsProcessing(true);
            const response = await axios.put(`/bills/${bill.id}/status`, {
                status: "done"
            });

            if (response.status === 201) {

                const data = response.data;

                await printService.sendPrintRequest({
                    bill_id: data.bill_id,
                    customer_name: bill.patient_name,
                    doctor_name: bill.doctor_name,
                    items: data.bill_items,
                    total: Number(data.total).toFixed(2),
                    bill_reference: data.bill_reference,
                    payment_type: data.payment_type
                });

                // Remove the bill from the list after marking as done
                setBills((prevBills) =>
                    prevBills.filter((b) => b.id !== bill.id)
                );
                setSelectedBill(null);
                setShowBill(false);
            }
        } catch (err) {
            alert("Failed to update bill status. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

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
                            <th className="px-4 py-4 bg-gray-800">Bill No.</th>
                            <th className="px-4 py-4 bg-gray-800">Queue Number</th>
                            <th className="px-4 py-4 bg-gray-800">Status</th>
                            <th className="px-4 py-4 bg-gray-800">Doctor Name</th>
                            <th className="px-4 py-4 bg-gray-800">Patient</th>
                            <th className="px-4 py-4 bg-gray-800">Amount</th>
                            <th className="px-4 py-4 bg-gray-800">Date</th>
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
                                <td className="px-4 py-2 border-r border-gray-800">{bill.patient_name}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.bill_amount}</td>
                                <td className="px-4 py-2 border-r border-gray-800">{bill.queue_date}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="px-4 py-1 rounded bg-blue-800 text-white"
                                        onClick={() => handleShowBill(bill)}
                                    >
                                        Mark as Done
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

            {showBill && (
                <div
                    className={`fixed inset-0 bg-opacity-60 bg-black flex justify-center items-center z-50 ${
                        showBill ? "block" : "hidden"
                    }`}
                >
                    <div className="bg-gray-800 rounded-lg shadow-lg max-w-lg w-full pb-3">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Bill Details</h2>
                            <button
                                onClick={() => setShowBill(false)}
                                className="text-gray-500 hover:text-gray-400"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="border rounded border-gray-800 p-4">
                            {showBill && selectedBill && (
                                <div className="border rounded border-gray-800">
                                    <p>
                                        <span className="font-semibold">Queue Number: </span>
                                        {selectedBill.queue_number}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Bill Number: </span>
                                        {selectedBill.id}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Patient Name: </span>
                                        {selectedBill.patient_name}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Doctor Name: </span>
                                        {selectedBill.doctor_name}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Amount: </span>
                                        {selectedBill.bill_amount}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Date: </span>
                                        {selectedBill.queue_date}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Status: </span>
                                        <StatusLabel status={selectedBill.status}/>
                                    </p>
                                    <div className="flex mt-4">
                                        <button
                                            className="px-4 py-1 rounded bg-blue-800 text-white px-3 py-2 mr-3"
                                            onClick={() => handleMarkAsDone(selectedBill)}
                                        >
                                            Confirm the payment & Done
                                        </button>
                                        <button
                                            className="px-4 py-1 rounded bg-gray-600 text-white px-3 py-2"
                                            onClick={() => setShowBill(false)}
                                        >
                                            Cancel
                                        </button>
                                        {isProcessing && (
                                            <div className="mx-3 mt-1">
                                                <Loader/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionList;
