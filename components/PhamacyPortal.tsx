import React, {useEffect, useState} from "react";
import axios from "../lib/axios";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Option} from "@/types/interfaces";

interface Service {
    id: number;
    name: string;
    price: string;
}

interface Medicine {
    id: number;
    name: string;
    drug_name: string;
    price: string;
}

interface PatientMedicine {
    id: number;
    bill_item_id: number;
    medicine_id: number;
    price: string;
    medicine: Medicine;
}

interface BillItem {
    id: number;
    bill_id: number;
    service_id: number;
    service: Service;
    bill_amount: string;
    patient_medicines: PatientMedicine[];
}

interface Patient {
    id: number;
    name: string;
}

interface Bill {
    id: number;
    patient_id: number;
    status: string;
    patient: Patient;
    bill_items: BillItem[];
}

const PendingBillsPortal: React.FC = () => {
    const [pendingBills, setPendingBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState<number | null>(null);
    const [selectedService, setSelectedService] = useState<Option>();
    const [servicePrice, setServicePrice] = useState<string>("");
    const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Fetch pending bills from API
        axios
            .get("bills/pending-invoices")
            .then((response) => {
                setPendingBills(response.data);
                if (response.data.length > 0) {
                    setActiveBillId(response.data[0].id); // Set the first bill as active by default
                }
            })
            .catch((error) => console.error("Error fetching pending bills:", error));
    }, []);

    useEffect(() => {
        // Recalculate the final bill amount whenever the active bill changes
        calculateFinalBillAmount();
    }, [activeBillId, pendingBills]);

    const handleAddService = () => {
        if (activeBillId && selectedService && servicePrice) {
            const newBillItem = {
                bill_id: activeBillId,
                service_id: selectedService.value,
                bill_amount: servicePrice,
            };

            // Send to API
            axios
                .post("bill-items", newBillItem)
                .then((response) => {
                    // Update the state with the new item
                    setPendingBills((prevBills) =>
                        prevBills.map((bill) =>
                            bill.id === activeBillId
                                ? {
                                    ...bill,
                                    bill_items: [...bill.bill_items, response.data.data],
                                }
                                : bill
                        )
                    );

                    // Reset selection and price
                    setSelectedService({label: "", value: ""});
                    setServicePrice("");

                    // Recalculate the total bill amount
                    calculateFinalBillAmount();
                })
                .catch((error) => console.error("Error adding service:", error));
        }
    };

    const handleFinalizeBill = (billId: number) => {
        axios.put(`bills/${billId}/finalize`, {status: "done", "bill_amount": finalBillAmount})
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

    const calculateFinalBillAmount = () => {
        const activeBill = pendingBills.find((bill) => bill.id === activeBillId);
        if (activeBill) {
            const billAmount = activeBill.bill_items.reduce((total, item) => {
                const serviceAmount = parseFloat(item.bill_amount) || 0;
                let medicineAmount = 0;
                if (item.patient_medicines) {
                    medicineAmount = item.patient_medicines.reduce(
                        (medTotal, med) => medTotal + (parseFloat(med.price) || 0),
                        0
                    );
                }
                return total + serviceAmount + medicineAmount;
            }, 0);
            setFinalBillAmount(parseFloat(billAmount.toFixed(2))); // Ensure value is fixed to 2 decimal places
        } else {
            setFinalBillAmount(0); // Reset if no active bill
        }
    };

    const handleInputChange = (billId: number, itemId: number, newAmountValue: string) => {
        const newAmount = newAmountValue ? newAmountValue : '0'
        // Update the state immediately
        setPendingBills((prevBills) =>
            prevBills.map((bill) =>
                bill.id === billId
                    ? {
                        ...bill,
                        bill_items: bill.bill_items.map((item) =>
                            item.id === itemId ? {...item, bill_amount: newAmountValue} : item
                        ),
                    }
                    : bill
            )
        );

        // Add delay before sending API update
        if (typingTimeout) clearTimeout(typingTimeout); // Clear any existing timeout
        const timeout = setTimeout(() => {
            updateBillItemAmount(itemId, newAmount); // Call API update
        }, 800);
        setTypingTimeout(timeout); // Store the timeout
    };

    const updateBillItemAmount = async (itemId: number, amount: string) => {
        try {
            await axios.put(`bill-items/${itemId}`, {bill_amount: amount});
            console.log("Bill item updated successfully");
        } catch (error) {
            console.error("Error updating bill item:", error);
        }
    };

    const activeBill = pendingBills.find((bill) => bill.id === activeBillId);

    return (
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 relative">
            {/* Tabs for Bills */}
            <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                {pendingBills.map((bill) => (
                    <li key={bill.id} className="me-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activeBillId === bill.id
                                    ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                            } rounded-t-lg`}
                            onClick={() => setActiveBillId(bill.id)}
                        >
                            Bill #{bill.id}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Active Bill Details */}
            {activeBill && (
                <div className="py-3 text-left">
                    <h2 className="text-lg font-bold mb-4">
                        #{activeBill.id} : {activeBill.patient.name}
                    </h2>
                    <form>
                        {/* Add New Service Section */}
                        <div className="mt-6">
                            <h3 className="text-sm font-bold mb-4">Add a Service</h3>
                            <div className="grid gap-4 grid-cols-6 items-center ">
                                <div className="">
                                    <SearchableSelect
                                        apiUri="services"
                                        value={selectedService}
                                        onChange={(selectedServiceOption: any) =>
                                            setSelectedService(selectedServiceOption)
                                        }
                                        placeholder="Service"
                                        id={"ServiceNameSelect"}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Price"
                                    className="px-4 mt-3 py-2 border rounded bg-gray-800 dark:border-gray-700"
                                    value={servicePrice}
                                    onChange={(e) => setServicePrice(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="mt-3 bg-green-600 text-white py-2.5 px-4 rounded hover:bg-green-700"
                                    onClick={handleAddService}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <hr className="border-t border-gray-700 mb-4 mt-2"/>

                        {activeBill.bill_items.map((item) => (
                            <div key={item.id} className="mb-6 gap-4 grid grid-cols-6 items-center">
                                <label className="block text-sm font-medium text-gray-400 text-right">
                                    {item.service?.name || "Service"}
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 p-2 border rounded dark:border-gray-600 bg-gray-800"
                                    value={item.bill_amount}
                                    onChange={(e) =>
                                        handleInputChange(activeBill.id, item.id, e.target.value)
                                    }
                                />
                            </div>
                        ))}

                        <div className="font-bold text-lg mt-4">
                            Total: LKR {finalBillAmount}
                        </div>
                        <button
                            type="button"
                            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={() => handleFinalizeBill(activeBill.id)}
                        >
                            Finalize bill
                        </button>
                    </form>
                </div>
            )}

            {!activeBill && (
                <div className="p-4 rounded-lg shadow mt-4">
                    <p className="text-gray-600">No pending bills available.</p>
                </div>
            )}
        </div>
    );
};

export default PendingBillsPortal;
