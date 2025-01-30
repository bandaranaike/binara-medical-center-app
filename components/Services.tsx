import React, {useEffect, useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, ServicesStatus} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import ServiceMedicinesTable from "@/components/ServiceMedicinesTable";


export interface ServicesProps {
    patientId: number;
    onServiceStatusChange: (servicesStatus: ServicesStatus) => void;
    resetBillItems: boolean;
    showMedicineTable?: boolean;
    initialBill?: Bill;
    medicineTotal?: number;
    onBillCreated?: (billId: number) => void
}

export type BillTotals = {
    billTotal: number;
    systemTotal: number;
    total: number
}

const Services: React.FC<ServicesProps> = (
    {patientId, onServiceStatusChange, resetBillItems, initialBill, medicineTotal, onBillCreated, showMedicineTable = false}) => {

    const billTotalDefault: BillTotals = {billTotal: 0, systemTotal: 0, total: 0}

    const [selectedService, setSelectedService] = useState<Option>();
    const [activeBill, setActiveBill] = useState<Bill>();
    const [servicePrice, setServicePrice] = useState<string>("");
    const [finalBillAmounts, setFinalBillAmounts] = useState<BillTotals>(billTotalDefault);
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
            system_total: finalBillAmounts.systemTotal,
            bill_total: finalBillAmounts.billTotal,
            total: finalBillAmounts.total,
        });
    }, [finalBillAmounts]);

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

    const handleInputChange = (itemId: number, newAmountValue: string, key: string) => {
        const newAmount = newAmountValue || '0';
        setActiveBill((prevBill) => {
            if (prevBill) {
                return {
                    ...prevBill,
                    bill_items: prevBill.bill_items.map((item) =>
                        item.id === itemId ? {...item, [key]: newAmountValue} : item
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
            const totalValues = activeBill.bill_items.reduce(
                (acc, item) => {
                    const bill = parseFloat(item.bill_amount) || 0
                    const system = parseFloat(item.system_amount) || 0

                    acc.billTotal += bill;
                    acc.systemTotal += system;
                    acc.total += bill + system;

                    return acc;
                }, billTotalDefault);


            setFinalBillAmounts(totalValues);
        } else {
            setFinalBillAmounts(billTotalDefault);
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
                <div className="mt-4">
                    <div className="mb-2 gap-4 grid grid-cols-4 items-center text-center">
                        <div className="text-right">Treatment</div>
                        <div>Charge</div>
                        <div>Institution charge</div>
                        <div>Action</div>
                    </div>
                    {activeBill && activeBill.bill_items.map((item) => (
                        <React.Fragment key={item.id}>
                            <div className="mb-2 gap-4 grid grid-cols-4 items-center">
                                <label className="block text-sm font-medium text-gray-400 text-right">
                                    {item.service?.name || "Service"}
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-2 py-1 border rounded dark:border-gray-600 bg-gray-800"
                                    value={item.bill_amount}
                                    onChange={(e) =>
                                        handleInputChange(item.id, e.target.value, 'bill_amount')
                                    }
                                />
                                <input
                                    type="text"
                                    className="mt-1 px-2 py-1 border rounded dark:border-gray-600 bg-gray-800"
                                    value={item.system_amount}
                                    onChange={(e) =>
                                        handleInputChange(item.id, e.target.value, 'system_amount')
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
                </div>
                {isLoading && <Loader/>}
                {activeBill && (
                    <div className="flex justify-between content-center">
                        <div className={showMedicineTable ? "font-bold text-lg mt-4" : "mt-4"}>
                            {showMedicineTable ? 'Total' : "Service total: "}: LKR {finalBillAmounts.total.toFixed(2)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
