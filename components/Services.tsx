import React, {useEffect, useState} from 'react';
import {Bill, Option, ServicesStatus} from "@/types/interfaces";
import axios from "@/lib/axios";
import Loader from "@/components/form/Loader";
import PatientMedicineManager from "@/components/PatientMedicineManager";
import {DeleteIcon} from "@nextui-org/shared-icons";
import SearchableSelectOrCreate from "@/components/form/SearchableSelectOrCreate";

export interface ServicesProps {
    patientId: number;
    onServiceStatusChange: (servicesStatus: ServicesStatus) => void;
    resetBillItems: boolean;
    showMedicineTable?: boolean;
    initialBill?: Bill;
    onBillCreated?: (billId: number) => void
}

export type BillTotals = {
    billTotal: number;
    systemTotal: number;
    total: number
}

const Services: React.FC<ServicesProps> = (
    {patientId, onServiceStatusChange, resetBillItems, initialBill, onBillCreated, showMedicineTable = false}) => {

    const billTotalDefault: BillTotals = {billTotal: 0, systemTotal: 0, total: 0}

    const [selectedService, setSelectedService] = useState<Option>();
    const [activeBill, setActiveBill] = useState<Bill>();
    const [servicePrice, setServicePrice] = useState<string>("");
    const [serviceInstitutionPrice, setServiceInstitutionPrice] = useState<string>("");
    const [finalBillAmounts, setFinalBillAmounts] = useState<BillTotals>(billTotalDefault);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addServiceError, setAddServiceError] = useState<string>("")
    const [itemUpdateError, setItemUpdateError] = useState<{ id: number, message: string } | undefined>()
    const [doctorMedicineId, setDoctorMedicineId] = useState(0)
    const [serviceResetter, setServiceResetter] = useState(0)
    const [medicineTotal, setMedicineTotal] = useState(0)

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
            updateBillItemAmount(doctorMedicineId, medicineTotal.toString(), "system_amount")
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
                system_amount: serviceInstitutionPrice,
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
                setServiceResetter(serviceResetter + 1)
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
            setIsLoading(true);
            updateBillItemAmount(itemId, newAmount, key);
        }, 800);
        setTypingTimeout(timeout);
    };

    const updateBillItemAmount = (itemId: number, amount: string, key: string) => {
        setItemUpdateError(undefined)
        if (itemId === 0) return;
        axios.put(`bill-items/${itemId}`, {[key]: amount})
            .catch(error => setItemUpdateError({id: itemId, message: error.response.data.message})).finally(() => setIsLoading(false));
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

    const handleServiceChange = (selectedServiceOption: any) => {
        const [billPrice, systemPrice] = selectedServiceOption.extra.split('-');
        setServicePrice(billPrice);
        setServiceInstitutionPrice(systemPrice);

        setSelectedService(selectedServiceOption)
    }

    return (
        <div className="bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
                <div>
                    <div>
                        <h3 className="mb-4 font-semibold text-xl">Treatments List</h3>
                        <div className="grid gap-4 grid-cols-5 items-center ">
                            <div className="col-span-2">
                                <label className="block mb-2 text-left">Service/Treatment:</label>
                                <SearchableSelectOrCreate
                                    resetTrigger={serviceResetter}
                                    apiUri="services"
                                    onSelect={handleServiceChange}
                                    onNotSelect={handleOnNewServiceCreate}
                                    placeholder="Service"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-left">Fee:</label>
                                <input
                                    type="text"
                                    placeholder="Price"
                                    className="px-4 py-2 border rounded bg-gray-800 dark:border-gray-700 w-full"
                                    value={servicePrice}
                                    onChange={(e) => setServicePrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-left">Institution fee:</label>
                                <input
                                    type="text"
                                    placeholder="Institution Price"
                                    className="px-4 py-2 border rounded bg-gray-800 dark:border-gray-700 w-full"
                                    value={serviceInstitutionPrice}
                                    onChange={(e) => setServiceInstitutionPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="mt-8 border border-green-600 bg-green-700 text-white w-full py-2 px-4 rounded hover:border-green-500"
                                    onClick={handleAddService}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {addServiceError && <div className="text-red-500 mb-4">{addServiceError}</div>}

                    <div className="mt-4 border border-gray-800 rounded-lg">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-800 bg-gray-800">
                                <th className="px-4 py-2 grow">Treatment</th>
                                <th className="px-4 py-2">Charge</th>
                                <th className="px-4 py-2">Institution charge</th>
                                <th className="px-4 py-2">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {activeBill && activeBill.bill_items.length === 0 && (
                                <tr className="border-b border-gray-800">
                                    <td colSpan={4} className="text-center">No treatments added</td>
                                </tr>
                            )}
                            {activeBill && activeBill.bill_items.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="border-b border-gray-800 last:border-b-0">
                                        <td className="px-4 py-2 border-r border-gray-800">  {item.id == doctorMedicineId ? "Doctor Medicines" : item.service?.name || "Service"}</td>
                                        <td className="p-1 border-r border-gray-800">
                                            <input
                                                type="text"
                                                className="text-sm px-2 py-1 border rounded border-gray-700 bg-gray-800 w-32 focus:border-blue-600"
                                                value={item.bill_amount}
                                                onChange={(e) =>
                                                    handleInputChange(item.id, e.target.value, 'bill_amount')
                                                }
                                            />
                                        </td>
                                        <td className="p-1 border-r border-gray-800">
                                            <input
                                                type="text"
                                                className="text-sm px-2 py-1 border rounded border-gray-700 bg-gray-800 w-32 focus:border-blue-600"
                                                value={item.system_amount}
                                                onChange={(e) =>
                                                    handleInputChange(item.id, e.target.value, 'system_amount')
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <DeleteIcon
                                                onClick={item.id == doctorMedicineId ? () => false : () => handleRemoveBillItem(item.id)}
                                                className={`${item.id == doctorMedicineId ? 'text-gray-600 cursor-not-allowed hover:text-gray-600' : 'hover:text-red-500 cursor-pointer'} mx-auto`}/>

                                        </td>
                                    </tr>
                                    {itemUpdateError && itemUpdateError.id === item.id &&
                                        <tr>
                                            <td colSpan={4} className="border-t border-gray-800">
                                                <div className="py-1 px-3 text-right text-red-500">{itemUpdateError.message}</div>
                                            </td>
                                        </tr>
                                    }
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>

                    </div>
                    <div className="py-6 relative">{isLoading && <div className="absolute top-2 right-1"><Loader size="w-6 h-6"/></div>}</div>
                    {activeBill && (
                        <table className={showMedicineTable ? "" : "mt-4"}>
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
                {showMedicineTable && activeBill && (
                    <div className="mb-12">
                        <h3 className="mb-1 font-semibold text-xl"> Doctor recommended medicine list</h3>
                        <PatientMedicineManager
                            editable={false}
                            patientId={patientId}
                            billId={activeBill.id.toString()}
                            onNewServiceAdded={insertMedicineBillItem}
                            onMedicineTotalChange={setMedicineTotal}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
