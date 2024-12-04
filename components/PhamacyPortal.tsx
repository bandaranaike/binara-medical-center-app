import React, {useEffect, useState} from "react";
import axios from "../lib/axios";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Option} from "@/types/interfaces"; // Adjust import as per your project structure

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
                    setSelectedService({label: '', value: ''});
                    setServicePrice("");
                })
                .catch((error) => console.error("Error adding service:", error));
        }
    };

    const handleUpdateBillItem = (billId: number, itemId: number, newAmount: string) => {
        setPendingBills((prevBills) =>
            prevBills.map((bill) =>
                bill.id === billId
                    ? {
                        ...bill,
                        bill_items: bill.bill_items.map((item) =>
                            item.id === itemId ? {...item, bill_amount: newAmount} : item
                        ),
                    }
                    : bill
            )
        );
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
                                        id={'ServiceNameSelect'}
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
                                    {item.service?.name || 'Service'}
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 p-2 border rounded dark:border-gray-600 bg-gray-800"
                                    value={item.bill_amount}
                                    onChange={(e) =>
                                        (activeBill.id, item.id, e.target.value)
                                    }
                                />
                            </div>
                        ))}

                        <div className="font-bold text-lg mt-4">
                            Total: $
                            {activeBill.bill_items.reduce((total, item) => {
                                const itemTotal = parseFloat(item.bill_amount) || 0;
                                const medicineTotal = item.patient_medicines.reduce(
                                    (sum, med) => sum + (parseFloat(med.price) || 0),
                                    0
                                );
                                return total + itemTotal + medicineTotal;
                            }, 0).toFixed(2)}
                        </div>
                        <button
                            type="button"
                            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={() => console.log("Update button clicked")}
                        >
                            Finalize bill
                        </button>
                    </form>
                </div>
            )}

            {!activeBill && (
                <div className="p-4 bg-gray-100 rounded-lg shadow mt-4">
                    <p className="text-gray-600">No pending bills available.</p>
                </div>
            )}
        </div>
    );
};

export default PendingBillsPortal;
