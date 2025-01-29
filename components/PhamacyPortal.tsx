import React, {useEffect, useState} from "react";
import axios from "../lib/axios";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Bill, HistoryItem, Option, ServicesStatus} from "@/types/interfaces";
import {formatReadableDateTime} from "@/lib/readbale-date";
import Services from "@/components/Services";
import TextInput from "@/components/form/TextInput";
import Loader from "@/components/form/Loader";
import {DeleteIcon} from "@nextui-org/shared-icons";

interface Drug {
    id: number;
    quantity: number;
    total_price: number;
    brand: string;
    drug: string;
}

const PharmacyPortal: React.FC = () => {
    const [pendingBills, setPendingBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState<number | null>(null);
    const [servicesCount, setServicesCount] = useState(0);
    const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
    const [medicineTotal, setMedicineTotal] = useState<number>(0);
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [billsFetchError, setBillFetchErrors] = useState("");
    const [brand, setBrand] = useState<Option | undefined>()
    const [drugQuantity, setDrugQuantity] = useState<string>("1")
    const [drugPrice, setDrugPrice] = useState<string>("")
    const [drugUnitPrice, setDrugUnitPrice] = useState<string>("")
    const [drugListAddError, setDrugListAddError] = useState<string>("")
    const [drugLisFetchError, setDrugListFetchError] = useState<string>("")
    const [drugList, setDrugList] = useState<Drug [] | undefined>()
    const [isDrugListLoading, setIsDrugListLoading] = useState<boolean>(false)
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

    useEffect(() => {
        setIsDrugListLoading(true)
        const debounceFetch = setTimeout(fetchDrugsSaleForBill, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [activeBillId]);

    useEffect(() => {
        if (drugUnitPrice)
            setDrugPrice((Number(drugUnitPrice) * Number(drugQuantity)).toFixed(2).toString())
    }, [drugQuantity, drugUnitPrice])

    useEffect(() => {
        if (drugList) {
            const total = drugList.reduce((c: number, item: any) => c + Number(item.total_price), 0);
            setMedicineTotal(total)
        } else setMedicineTotal(0)
    }, [drugList]);

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

    const fetchDrugsSaleForBill = () => {
        if (activeBillId) {
            setIsDrugListLoading(true)
            setDrugListFetchError("")
            axios.get(`bills/${activeBillId}/sales`)
                .then(response => {
                    setDrugList(response.data)
                })
                .catch(error => setDrugListFetchError(error.response.data.message))
                .finally(() => setIsDrugListLoading(false))
        }
    }

    const handleOnServiceStatusChange = (billStatus: ServicesStatus) => {
        setFinalBillAmount(billStatus.total);
        setError("")
        setServicesCount(billStatus.count);
    }

    const activeBill = pendingBills.find((bill) => bill.id === activeBillId);

    const addDrugsToList = () => {
        if (!brand || !drugQuantity || !drugPrice) {
            setDrugListAddError("Please fill all the fields")
            return;
        }
        setDrugListAddError("")

        axios.post(`sales`, {
            bill_id: activeBillId, brand_id: brand?.value, quantity: drugQuantity, total_price: drugPrice
        }).then(() => {
            setDrugPrice("")
            setDrugQuantity("1")
            setDrugUnitPrice("")
            setBrand({value: "0", label: "Select.."})
            fetchDrugsSaleForBill()
        }).catch(error => setDrugListAddError(error.response.data.message))

    };

    const handleExtraData = (item: string) => {
        setDrugUnitPrice(item)
    };


    const removeDrug = (deletingDrug: Drug) => {
        setDeleteError("")
        axios.delete(`sales/${deletingDrug.id}`).then(() => {
            if (drugList)
                setDrugList(drugList.filter(drug => drug.id !== deletingDrug.id))
        }).catch(error => setDeleteError(error.response.data.message));
    };
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
                    <div className="flex justify-between py-3">
                        <div className="">
                            <h2 className="text-2xl font-bold mb-1 text-gray-400">
                                {activeBill.patient.name}
                            </h2>
                            <div className="text-gray-500">Age: {activeBill.patient.age} <span className="px-1">|</span> Gender: {activeBill.patient.gender}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold mb-1 text-lg">Doctor : {activeBill.doctor ? activeBill.doctor?.name : "No doctor assigned"}</div>
                            <div className="text-gray-500 text-xs">
                                <div className="">Bill Created at: {formatReadableDateTime(activeBill.created_at)}</div>
                                <div className="">Bill last update at : {formatReadableDateTime(activeBill.updated_at)}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="grid grid-cols-2 gap-12">
                            <div className="mb-6">
                                {activeBill && (
                                    <Services
                                        key="pharmacy-portal"
                                        patientId={activeBill.patient_id}
                                        onServiceStatusChange={handleOnServiceStatusChange}
                                        resetBillItems={false}
                                        initialBill={activeBill}
                                        showMedicineTable={true}
                                        medicineTotal={medicineTotal}
                                    ></Services>
                                )}
                            </div>
                            <div className="">
                                <h3 className="text-xl font-semibold mb-4">Prepare the drug list</h3>
                                <div className="grid gap-4 grid-cols-5 items-center">
                                    <div className="col-span-2">
                                        <SearchableSelect
                                            placeholder="Drug/Brand"
                                            apiUri="brands"
                                            onChange={(option: any) => setBrand(option)}
                                            value={brand}
                                            id="DrugBrandSelect"
                                            onExtraDataHas={handleExtraData}
                                        />
                                    </div>
                                    <TextInput name="Quantity" onChange={setDrugQuantity} value={drugQuantity}/>
                                    <TextInput name="Price" onChange={setDrugPrice} value={drugPrice}/>
                                    <button
                                        onClick={addDrugsToList}
                                        className="border border-green-600 bg-green-700 text-white rounded hover:border-green-500 p-2 mt-4"
                                    >Add
                                    </button>
                                </div>
                                {drugListAddError && <div className="mb-4 text-red-500">{drugListAddError}</div>}
                                <div className="">
                                    {(!drugList || (drugList && drugList.length === 0) || isDrugListLoading) && (
                                        <div className="p-4 text-center text-sm border border-gray-800 rounded-lg">
                                            {isDrugListLoading && <Loader/>}
                                            {(drugList && drugList.length === 0) && !isDrugListLoading && (
                                                <div className="text-gray-500 text-sm">Drugs list will appear here</div>
                                            )}
                                        </div>
                                    )}
                                    {!isDrugListLoading && drugList && drugList.length > 0 && <div>
                                        <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                                            <table className="w-full text-sm text-left text-gray-400">
                                                <thead className="bg-gray-700">
                                                <tr className="bg-gray-800">
                                                    <th className="px-4 py-2">Brand Name</th>
                                                    <th className="px-4 py-2 text-left">Drug Name</th>
                                                    <th className="px-4 py-2 text-left">Quantity</th>
                                                    <th className="px-4 py-2 text-left">Price</th>
                                                    <th className="px-4 py-2 text-left w-8"><DeleteIcon/></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {drugList.map((drug: Drug) => (
                                                    <tr key={drug.id} className="border-t border-gray-800">
                                                        <td className="px-4 py-2 border-r border-gray-800">{drug.brand}</td>
                                                        <td className="px-4 py-2 border-r border-gray-800">{drug.drug}</td>
                                                        <td className="px-4 py-2 border-r border-gray-800">{drug.quantity}</td>
                                                        <td className="px-4 py-2 border-r border-gray-800">{drug.total_price}</td>
                                                        <td className="px-4 py-2 text-red-500">
                                                            <button onClick={() => removeDrug(drug)}><DeleteIcon/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                            <div className="border border-gray-800 border-t px-4 py-2 flex justify-between">
                                                <div>Total : {medicineTotal.toFixed(2)}</div>
                                                {deleteError && <div className="text-red-500 ml-3 text-right">{deleteError}</div>}
                                            </div>
                                        </div>
                                    </div>}
                                    {drugLisFetchError && <div className="text-red-500">{drugLisFetchError}</div>}
                                </div>
                            </div>
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
                                className="mt-8 bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-600 mb-3"
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
