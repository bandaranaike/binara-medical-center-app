import React, {useEffect, useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, ServicesProps} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import ServiceMedicinesTable from "@/components/ServiceMedicinesTable";

const
    ServicesPortal: React.FC<ServicesProps> = ({patientId, onNotPatientFound, onServiceStatusChange, resetBillItems, initialBill, showMedicineTable = false}) => {

        const defaultBill = {
            id: -1,
            patient_id: 0,
            status: '',
            patient: {} as any,
            doctor: {} as any,
            bill_items: [],
            patient_medicines: [],
            created_at: '',
            updated_at: ''
        }

        const [selectedService, setSelectedService] = useState<Option>();
        const [activeBill, setActiveBill] = useState<Bill>(defaultBill);
        const [servicePrice, setServicePrice] = useState<string>("");
        const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
        const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            calculateFinalBillAmount();
        }, [activeBill]);

        useEffect(() => {
            if (initialBill) setActiveBill(initialBill);
        }, [initialBill]);

        useEffect(() => {
            setActiveBill(defaultBill)
        }, [resetBillItems]);

        useEffect(() => {
            onServiceStatusChange({
                bill_id: activeBill?.id || 0,
                count: activeBill?.bill_items.length || 0,
                total: finalBillAmount,
            });
        }, [finalBillAmount]);

        const handleAddService = () => {
            console.log("patientId", patientId)
            if (!patientId && onNotPatientFound) {
                onNotPatientFound();
                return;
            }

            console.log("selectedService", selectedService, "servicePrice", servicePrice)

            if (selectedService && servicePrice) {
                setIsLoading(true);
                const newBillItem = {
                    bill_id: activeBill?.id,
                    service_id: selectedService.value,
                    service_name: selectedService.value === '-1' ? selectedService.label : null,
                    bill_amount: servicePrice,
                    patient_id: patientId,
                };

                axios.post("bill-items", newBillItem).then((response) => {
                    const updatedBillItem = response.data.data;

                    setActiveBill((prevBill) => {
                        if (prevBill) {
                            return {
                                ...prevBill,
                                id: updatedBillItem.bill_id,
                                bill_items: [...prevBill.bill_items, updatedBillItem],
                            };
                        }
                        return prevBill;
                    });

                    setSelectedService({label: "", value: ""});
                    setServicePrice("");
                    calculateFinalBillAmount();
                }).catch((error) => console.error("Error adding service:", error)).finally(() => setIsLoading(false));
            }
        };

        const handleRemoveBillItem = (billItemId: number) => {
            if (billItemId) {
                axios.delete(`bill-items/${billItemId}`).then(() => {
                    setActiveBill((prevBill) => {
                        if (prevBill) {
                            return {
                                ...prevBill,
                                bill_items: prevBill.bill_items.filter((item) => item.id !== billItemId),
                            };
                        }
                        return prevBill;
                    });
                    calculateFinalBillAmount();
                }).catch((error) => console.error("Error removing bill item:", error));
            }
        };

        const handleOnNewServiceCreate = (serviceName: string) => {
            setSelectedService({label: serviceName, value: "-1"});
        };

        const handleInputChange = (itemId: number, newAmountValue: string) => {
            const newAmount = newAmountValue || '0';
            setActiveBill((prevBill) => {
                if (prevBill) {
                    return {
                        ...prevBill,
                        bill_items: prevBill.bill_items.map((item) =>
                            item.id === itemId ? {...item, bill_amount: newAmountValue} : item
                        ),
                    };
                }
                return prevBill;
            });

            if (typingTimeout) clearTimeout(typingTimeout);
            const timeout = setTimeout(() => {
                updateBillItemAmount(itemId, newAmount);
            }, 800);
            setTypingTimeout(timeout);
        };

        const updateBillItemAmount = async (itemId: number, amount: string) => {
            try {
                await axios.put(`bill-items/${itemId}`, {bill_amount: amount});
            } catch (error) {
                console.error("Error updating bill item:", error);
            }
        };

        const calculateFinalBillAmount = () => {
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

        return (
            <div className="bg-gray-900">
                <form>
                    <div className="mt-6">
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
                        <React.Fragment key={item.id}>
                            <div className="mb-2 gap-4 grid grid-cols-4 items-center">
                                <label className="block text-sm font-medium text-gray-400 text-right col-span-2">
                                    {item.service?.name || "Service"}
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-2 py-1 border rounded dark:border-gray-600 bg-gray-800"
                                    value={item.bill_amount}
                                    onChange={(e) =>
                                        handleInputChange(item.id, e.target.value)
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
                            {showMedicineTable && item.service?.name == "Medicines" && activeBill.patient_medicines.length > 0 && (
                                <ServiceMedicinesTable patientMedicines={activeBill.patient_medicines}/>
                            )}
                        </React.Fragment>
                    ))}
                    {isLoading && <Loader/>}
                    {activeBill && (
                        <div className="flex justify-between content-center">
                            <div className="font-bold text-lg mt-4">
                                Total: LKR {finalBillAmount}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        );
    };

export default ServicesPortal;
