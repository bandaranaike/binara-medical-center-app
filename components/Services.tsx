import React, {useEffect, useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, Option, ServicesStatus} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import PatientMedicineManager from "@/components/PatientMedicineManager";
import {DeleteIcon} from "@nextui-org/shared-icons";

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
    const [doctorMedicineId, setDoctorMedicineId] = useState(0)

    useEffect(() => {
        calculateFinalBillAmount();
        findDoctorMedicineItem();
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
                            item.id === doctorMedicineId ? {...item, system_amount: medicineTotal.toString()} : item
                        ),
                    };
                }
                return prevBill;
            });
        }
    }, [medicineTotal]);

    useEffect(() => {

    }, []);

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
            updateBillItemAmount(itemId, newAmount, key);
        }, 800);
        setTypingTimeout(timeout);
    };

    const updateBillItemAmount = (itemId: number, amount: string, key: string) => {
        setItemUpdateError(undefined)
        axios.put(`bill-items/${itemId}`, {[key]: amount})
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

    const findDoctorMedicineItem = () => {
        const doctorMedicineBillItem = activeBill?.bill_items.find(billItem => billItem.service.name === "Medicines")
        if (doctorMedicineBillItem) {
            setDoctorMedicineId(doctorMedicineBillItem.id)
        }
    }

    const insertMedicineBillItem = (onNewServiceAdded: any) => {
        if (activeBill) {
            const medicineBillItem = activeBill.bill_items.find(billItem => billItem.service.name == "Medicines");
            if (!medicineBillItem) {
                setActiveBill((prevBill) => {
                    if (prevBill) {
                        return {
                            ...prevBill,
                            bill_items: [...prevBill.bill_items, onNewServiceAdded],
                        };
                    }
                    return prevBill;
                });
            }
        }
    }

    return (
        <div className="bg-gray-900">
            <div>
                {showMedicineTable && activeBill &&  (
                    <div className="mb-12">
                        <h3 className="mb-1 font-semibold text-xl">Doctor recommended medicine list</h3>
                        <PatientMedicineManager patientId={patientId} billId={activeBill.id.toString()} onNewServiceAdded={insertMedicineBillItem}/>
                    </div>
                )}
                <div>
                    <h3 className="mb-5 font-semibold text-xl">Treatments List</h3>
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
                    <div className="mb-2 gap-4 grid grid-cols-5 items-center text-center">
                        <div className="text-right col-span-2">Treatment</div>
                        <div>Charge</div>
                        <div>Institution charge</div>
                        <div>Action</div>
                    </div>
                    {activeBill && activeBill.bill_items.map((item) => (
                        <React.Fragment key={item.id}>
                            <div className="mb-2 gap-4 grid grid-cols-5 items-center">
                                <label className="block text-sm font-medium text-gray-400 text-right col-span-2">
                                    {item.id == doctorMedicineId ? "Doctor Medicines" : item.service?.name || "Service"}
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
                                <div className="w-full">
                                    <DeleteIcon
                                        onClick={item.id == doctorMedicineId ? () => false : () => handleRemoveBillItem(item.id)}
                                        className={`${item.id == doctorMedicineId ? 'text-gray-600 cursor-not-allowed hover:text-gray-600' : 'hover:text-red-500 cursor-pointer'} mx-auto`}/>
                                </div>
                            </div>

                            {itemUpdateError && itemUpdateError.id === item.id && <div className="mb-4 text-right text-red-500">{itemUpdateError.message}</div>}
                        </React.Fragment>
                    ))}
                </div>
                {isLoading && <Loader/>}
                {activeBill && (
                    <table className={showMedicineTable ? "mt-12" : "mt-4"}>
                        <tbody>
                        <tr>
                            <td className="text-right pr-1 pb-1">Institution charge</td>
                            <td className="font-bold pb-1">: {finalBillAmounts.systemTotal.toFixed(2)}</td>
                        </tr>
                        <tr className="">
                            <td className="text-right pr-1 pb-1">Bill charge</td>
                            <td className="font-bold pb-1">: {finalBillAmounts.billTotal.toFixed(2)}</td>
                        </tr>
                        <tr className="">
                            <td className="text-right pr-1 pb-1">{showMedicineTable ? 'Total' : "Service total: "}</td>
                            <td className="font-bold pb-1">: {finalBillAmounts.total.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Services;
