import React, {useEffect, useState} from "react";
import axios from "../lib/axios";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, ServicesStatus} from "@/types/interfaces";
import {formatReadableDateTime} from "@/lib/readbale-date";
import Services from "@/components/Services";

const PharmacyPortal: React.FC = () => {
    const [pendingBills, setPendingBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState<number | null>(null);
    const [servicesCount, setServicesCount] = useState(0);
    const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
    const [error, setError] = useState("Please add at least one service to finalize the bill");

    useEffect(() => {
        axios
            .get("bills/pending/pharmacy")
            .then((response) => {
                setPendingBills(response.data);
                if (response.data.length > 0) {
                    setActiveBillId(response.data[0].id); // Set the first bill as active by default
                }
            })
            .catch((error) => console.error("Error fetching pending bills:", error));
    }, []);

    const handleFinalizeBill = (billId: number) => {
        if (servicesCount === 0) {
            setError("Please add at least one service to finalize the bill.")
            return;
        }

        axios.put(`bills/${billId}/send-to-reception`, {status: "reception", "bill_amount": finalBillAmount})
            .then(() => {
                // Remove the finalized bill from the state
                setPendingBills((prevBills) =>
                    prevBills.filter((bill) => bill.id !== billId)
                );

                // Reset the active bill if the current one was finalized
                const nextBillIndex = pendingBills.length - 2;
                if (activeBillId === billId && pendingBills[nextBillIndex]) {
                    setActiveBillId(pendingBills[nextBillIndex].id);
                }
            })
            .catch((error) => console.error("Error finalizing bill:", error));
    };

    const handleOnServiceStatusChange = (billStatus: ServicesStatus) => {
        setFinalBillAmount(billStatus.total);
        setError("")
        setServicesCount(billStatus.count);
    }

    const activeBill = pendingBills.find((bill) => bill.id === activeBillId);

    return (
        <div className="font-medium text-center text-gray-400 border-gray-700 relative">
            {/* Tabs for Bills */}
            {pendingBills.length > 0 && (
                <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                    {pendingBills.map((bill) => (
                        <li key={bill.id} className="me-2">
                            <button
                                className={`inline-block p-4 border-b-2 ${
                                    activeBillId === bill.id
                                        ? "text-blue-500 hover:text-blue-400 border-blue-500"
                                        : "border-transparent hover:border-gray-300 hover:text-gray-300"
                                } rounded-t-lg`}
                                onClick={() => setActiveBillId(bill.id)}
                            >
                                Bill #{bill.id}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Active Bill Details */}
            {activeBill && (
                <div className="py-3 text-left">
                    <div className="flex justify-between py-3">
                        <div className="">
                            <h2 className="text-2xl font-bold mb-1 text-gray-400">
                                {activeBill.patient.name}
                            </h2>
                            <div className="text-gray-500">Age: {activeBill.patient.age} <span className="px-1">|</span> Gender: {activeBill.patient.gender}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold mb-1 text-lg">Doctor : {activeBill.doctor ? activeBill.doctor?.name : "No doctor assigned"}</div>
                            <div className="text-gray-500">
                                <div className="">Created : {formatReadableDateTime(activeBill.created_at)}</div>
                                <div className="">Last edit : {formatReadableDateTime(activeBill.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {/* Add New Service Section */}
                        <div className="mb-6 w-1/2">
                            {activeBill && (
                                <Services
                                    key="pharmacy-portal"
                                    patientId={activeBill.patient_id}
                                    onServiceStatusChange={handleOnServiceStatusChange}
                                    resetBillItems={false}
                                    initialBill={activeBill}
                                    showMedicineTable={true}
                                ></Services>
                            )}
                        </div>

                        <div className="flex justify-between content-center">
                            <div className="text-lg flex grow text-right">
                                {error && (
                                    <div className="mt-4 text-red-700 px-4 py-3 relative w-full" role="alert">
                                        {error}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-3"
                                onClick={() => handleFinalizeBill(activeBill.id)}
                            >
                                Finalize & send to reception
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!activeBill && (
                <>
                    <h2 className="text-2xl font-bold mb-4 text-left">Pharmacy portal</h2>
                    <p className="text-left text-normal">No pending bills available.</p>
                </>
            )}
        </div>
    );
};

export default PharmacyPortal;
