import React, {useEffect, useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, Patient, ServicesProps} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";

const ServicesPortal: React.FC<ServicesProps> = ({patientId, onNotPatientFound}) => {


    const [selectedService, setSelectedService] = useState<Option>();

    const [pendingBills, setPendingBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState<number>(-1);
    const [servicePrice, setServicePrice] = useState<string>("");
    const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        // Recalculate the final bill amount whenever the active bill changes
        calculateFinalBillAmount();
    }, [activeBillId, pendingBills]);

    const handleAddService = () => {
        if (!patientId) {
            onNotPatientFound();
            return;
        }

        if (selectedService && servicePrice) {
            const newBillItem = {
                bill_id: activeBillId,
                service_id: selectedService.value,
                service_name: selectedService.value === '-1' ? selectedService.label : null,
                bill_amount: servicePrice,
            };

            // Send to API
            axios.post("bill-items", newBillItem).then((response) => {
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

                setActiveBillId(response.data.data.bill_id);

                // Reset selection and price
                setSelectedService({label: "", value: ""});
                setServicePrice("");

                // Recalculate the total bill amount
                calculateFinalBillAmount();
            })
                .catch((error) => console.error("Error adding service:", error));
        }
    };

    const handleRemoveBillItem = (billItemId: number) => {
        if (billItemId) {
            // Send delete request to API
            axios.delete(`bill-items/${billItemId}`).then(() => {
                // Update the state to remove the item
                setPendingBills((prevBills) =>
                    prevBills.map((bill) => ({
                        ...bill,
                        bill_items: bill.bill_items.filter((item) => item.id !== billItemId),
                    }))
                );

                // Recalculate the total bill amount
                calculateFinalBillAmount();
            })
                .catch((error) => console.error("Error removing bill item:", error));
        }
    };

    const handleOnNewServiceCreate = (serviceName: string) => {
        setSelectedService({label: serviceName, value: "-1"});
    }

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
            setFinalBillAmount(parseFloat(billAmount.toFixed(2)));
        } else {
            setFinalBillAmount(0);
        }
    };


    const activeBill = pendingBills.find((bill) => bill.id === activeBillId);

    return (
        <div className="bg-gray-900 text-white">
            <form>
                {/* Add New Service Section */}
                <div className="mt-6">
                    <h3 className="font-bold text-xl mb-4">Services</h3>
                    <div className="grid gap-4 grid-cols-4 items-center ">
                        <div className="col-span-2">
                            <SearchableSelect
                                apiUri="services"
                                value={selectedService}
                                onChange={(selectedServiceOption: any) =>
                                    setSelectedService(selectedServiceOption)
                                }
                                onCreateOption={handleOnNewServiceCreate}
                                placeholder="Service"
                                id={"ServiceNameSelect"}
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Price"
                            className="px-4 mt-3.5 py-1.5 border rounded bg-gray-800 dark:border-gray-700"
                            value={servicePrice}
                            onChange={(e) => setServicePrice(e.target.value)}
                        />
                        <button
                            type="button"
                            className="mt-3.5 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                            onClick={handleAddService}
                        >
                            Add
                        </button>
                    </div>
                </div>

                <hr className="border-t border-gray-700 mb-4 mt-2"/>

                {activeBill && activeBill.bill_items.map((item) => (
                    <div key={item.id} className="mb-2 gap-4 grid grid-cols-4 items-center">
                        <label className="block text-sm font-medium text-gray-400 text-right col-span-2">
                            {item.service?.name || "Service"}
                        </label>
                        <input
                            type="text"
                            className="mt-1 px-2 py-1 border rounded dark:border-gray-600 bg-gray-800"
                            value={item.bill_amount}
                            onChange={(e) =>
                                handleInputChange(activeBill.id, item.id, e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="mt-2 bg-red-800 text-white py-1 px-4 rounded hover:bg-red-900"
                            onClick={() => handleRemoveBillItem(item.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {isLoading && <Loader/>}
                {activeBill && (
                    <div className="flex justify-between content-center">
                        <div className="font-bold text-lg mt-4">
                            Total: LKR {finalBillAmount}
                        </div>
                    </div>)}
            </form>
        </div>
    );
};

export default ServicesPortal;
