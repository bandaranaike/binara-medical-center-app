import React, {useEffect, useState} from "react";
import axios from "../lib/axios";
import {Bill, ServicesStatus} from "@/types/interfaces";
import {formatReadableDateTime} from "@/lib/readableDate";
import Services from "@/components/Services";
import Loader from "@/components/form/Loader";

const PharmacyPortal: React.FC = () => {
    const [pendingBills, setPendingBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState<number | null>(null);
    const [servicesCount, setServicesCount] = useState(0);
    const [finalBillAmounts, setFinalBillAmounts] = useState<ServicesStatus>();
    const [error, setError] = useState("");
    const [billsFetchError, setBillFetchErrors] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        setIsLoading(true)
        const fetchPharmacyPendingBills = () => {
            setBillFetchErrors("")
            axios.get("bills/pending/pharmacy").then((response) => {
                setPendingBills(response.data);
                if (response.data.length > 0) {
                    setActiveBillId(response.data[0].id);
                }
            }).catch((error) => setBillFetchErrors("Error fetching pending bills:" + error.response.data.message))
                .finally(() => setIsLoading(false));
        }
        const debounceFetch = setTimeout(fetchPharmacyPendingBills, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, []);

    const handleFinalizeBill = (billId: number) => {
        if (servicesCount === 0) {
            setError("Please add at least one service to finalize the bill.")
            return;
        }

        if (!finalBillAmounts) {
            setError("Bill totals have some issues.")
            return;
        }

        axios.put(`bills/${billId}/send-to-reception`, {
            status: "reception",
            bill_amount: finalBillAmounts.bill_total,
            system_amount: finalBillAmounts.system_total,
        })
            .then(() => {
                removeCurrentBillAndFocusNext(billId);
            })
            .catch((error) => console.error("Error finalizing bill:", error));
    };

    const removeCurrentBillAndFocusNext = (billId: number) => {
        // Remove the target bill from the state
        setPendingBills((prevBills) =>
            prevBills.filter((bill) => bill.id !== billId)
        );

        // Reset the active bill if the current one was finalized
        const nextBillIndex = pendingBills.length - 2;
        if (activeBillId === billId && pendingBills[nextBillIndex]) {
            setActiveBillId(pendingBills[nextBillIndex].id);
        }
    }

    const sendBackToDoctor = (billId: number) => {
        setIsLoading(true)
        try {
            axios.put(`/bills/${billId}/status`, {
                status: 'doctor',
            }).then(() => {
                removeCurrentBillAndFocusNext(billId);
            }).finally(() => setIsLoading(false));
        } catch (error) {
            console.error('Error updating the bill status:', error);
        }
    }

    const handleOnServiceStatusChange = (billStatus: ServicesStatus) => {
        setFinalBillAmounts(billStatus);
        setError("")
        setServicesCount(billStatus.count);
    }

    const activeBill = pendingBills.find((bill) => bill.id === activeBillId);

    return (
        <div className="font-medium text-gray-400 border-gray-700 relative">

            {isLoading && <div className="my-4"><Loader/></div>}

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
                    <div className="flex justify-between pt-3 pb-5 border-b border-gray-800 mb-8">
                        <div className="">
                            <h2 className="text-2xl font-bold mb-1 text-gray-400">
                                {activeBill.patient.name}
                            </h2>
                            <div className="text-gray-500">Age: {activeBill.patient.age} <span className="px-1">|</span> Gender: {activeBill.patient.gender}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold -mt-2 mb-1 text-lg">Doctor : {activeBill.doctor ? activeBill.doctor?.name : "No doctor assigned"}</div>
                            <div className="text-gray-500 text-xs">
                                <div className="">Bill Created at: {formatReadableDateTime(activeBill.created_at)}</div>
                                <div className="">Bill last update at : {formatReadableDateTime(activeBill.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-6">
                            {activeBill && (
                                <Services
                                    patientId={activeBill.patient_id}
                                    onServiceStatusChange={handleOnServiceStatusChange}
                                    resetBillItems={false}
                                    initialBill={activeBill}
                                    showMedicineTable={true}
                                ></Services>
                            )}
                        </div>
                        <div className="flex justify-between content-center gap-3">
                            <div className="text-lg flex grow text-right">
                                {error && (
                                    <div className="mt-4 text-red-700 px-4 py-3 relative w-full" role="alert">
                                        {error}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                className="mt-8 bg-blue-800 text-gray-300 py-2 px-4 rounded hover:bg-blue-600 mb-3 border border-blue-700"
                                onClick={() => sendBackToDoctor(activeBill.id)}
                            >
                                Send back to doctor
                            </button>
                            <button
                                type="button"
                                className="mt-8 bg-blue-800 text-gray-300 py-2 px-4 rounded hover:bg-blue-600 mb-3 border border-blue-700"
                                onClick={() => handleFinalizeBill(activeBill.id)}
                            >
                                Finalize & send to reception
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!activeBill && !isLoading && (
                <>
                    <h2 className="text-2xl font-bold mb-2 text-left">Pharmacy portal</h2>
                    {billsFetchError &&
                        <div className="text-red-500">{billsFetchError}</div> ||
                        <p className="text-left text-normal">No pending bills available.</p>
                    }
                </>
            )}
        </div>
    );
};

export default PharmacyPortal;
