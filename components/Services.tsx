import React, {useEffect, useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, ServicesStatus} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import ServiceMedicinesTable from "@/components/ServiceMedicinesTable";
import {useEffectEvent} from "@react-aria/utils";


export interface ServicesProps {
    patientId: number;
    onServiceStatusChange: (servicesStatus: ServicesStatus) => void;
    resetBillItems: boolean;
    showMedicineTable?: boolean;
    initialBill?: Bill;
    medicineTotal?: number;
    onBillCreated?: (billId: number) => void
}

const
    Services: React.FC<ServicesProps> = (
        {
            patientId, onServiceStatusChange, resetBillItems, initialBill, medicineTotal, onBillCreated, showMedicineTable = false
        }) => {

        const [selectedService, setSelectedService] = useState<Option>();
        const [activeBill, setActiveBill] = useState<Bill>();
        const [servicePrice, setServicePrice] = useState<string>("");
        const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
        const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
        const [isLoading, setIsLoading] = useState(false);
        const [addServiceError, setAddServiceError] = useState<string>("")
        const [itemUpdateError, setItemUpdateError] = useState<{ id: number, message: string } | undefined>()

        useEffect(() => {
            calculateFinalBillAmount();
        }, [activeBill]);

        useEffect(() => {
            if (initialBill) setActiveBill(initialBill);
        }, [initialBill]);

        useEffect(() => {
            if (resetBillItems)
                setActiveBill(undefined)
        }, [resetBillItems]);

        useEffect(() => {
            onServiceStatusChange({
                bill_id: activeBill?.id || 0,
                count: activeBill?.bill_items.length || 0,
                total: finalBillAmount,
            });
        }, [finalBillAmount]);

        useEffect(() => {
            if (activeBill && medicineTotal) {
                setActiveBill((prevBill) => {
                    if (prevBill) {
                        return {
                            ...prevBill,
                            bill_items: prevBill.bill_items.map((item) =>
                                item.service.name === "Medicines" ? {...item, bill_amount: medicineTotal.toString()} : item
                            ),
                        };
                    }
                    return prevBill;
                });
            }
        }, [medicineTotal]);

        const handleAddService = () => {
            setAddServiceError("")
            if (!patientId) {
                setAddServiceError("Please select a patient.")
                return;
            }

            if (selectedService && servicePrice) {
                setIsLoading(true);
                const billId = activeBill ? activeBill.id : -1
                const newBillItem = {
                    bill_id: billId,
                    service_id: selectedService.value,
                    service_name: selectedService.value === '-1' ? selectedService.label : null,
                    bill_amount: servicePrice,
                    patient_id: patientId,
                };

                axios.post("bill-items", newBillItem).then((response) => {
                    const updatedBillItem = response.data;
                    if (billId === -1) {
                        if (onBillCreated) onBillCreated(updatedBillItem.id)
                        setActiveBill(updatedBillItem)
                    } else {
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
                    }

                    setSelectedService({label: "", value: ""});
                    setServicePrice("");
                    calculateFinalBillAmount();
                }).catch((error) => setAddServiceError("Error adding service: " + error.response.data.message)).finally(() => setIsLoading(false));
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

        const handleInputChange = (itemId: number, newAmountValue: string, changeTotalBill: boolean = false) => {
            console.log("Came here")
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

        const updateBillItemAmount = (itemId: number, amount: string) => {
            setItemUpdateError(undefined)
            axios.put(`bill-items/${itemId}`, {bill_amount: amount})
                .catch(error => setItemUpdateError({id: itemId, message: error.response.data.message}));
        };

        const calculateFinalBillAmount = () => {
            if (activeBill) {
                const billAmount = activeBill.bill_items.reduce((total, item) => {
                    const serviceAmount = parseFloat(item.bill_amount) || 0;
                    let medicineAmount = 0;
                    return total + serviceAmount + medicineAmount;
                }, 0);
                setFinalBillAmount(parseFloat(billAmount.toFixed(2)));
            } else {
                setFinalBillAmount(0);
            }
        };

        return (
            <div className="bg-gray-900">
                <div>
                    {showMedicineTable && activeBill && activeBill.patient_medicines.length > 0 && (
                        <div className="mb-6">
                            <h3 className="mb-3 font-semibold text-xl">Doctor recommended medicine list</h3>
                            <ServiceMedicinesTable patientMedicines={activeBill.patient_medicines}/>
                        </div>
                    )}
                    <div>
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
                                className="mt-3.5 border border-green-600 bg-green-700 text-white py-1.5 px-4 rounded hover:border-green-500"
                                onClick={handleAddService}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {addServiceError && <div className="text-red-500 mb-4">{addServiceError}</div>}

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

                            {itemUpdateError && itemUpdateError.id === item.id && <div className="mb-4 text-right text-red-500">{itemUpdateError.message}</div>}
                        </React.Fragment>
                    ))}
                    {isLoading && <Loader/>}
                    {activeBill && (
                        <div className="flex justify-between content-center">
                            <div className={showMedicineTable ? "font-bold text-lg mt-4" : "mt-4"}>
                                {showMedicineTable ? 'Total' : "Service total: "}: LKR {finalBillAmount.toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

export default Services;
