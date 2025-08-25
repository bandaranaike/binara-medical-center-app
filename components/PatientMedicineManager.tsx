import React, {useState, useEffect, useRef} from 'react';
import axios from '@/lib/axios';
import {HistoryItem, Option} from '@/types/interfaces';
import Loader from "@/components/form/Loader";
import {randomString} from "@/lib/strings";
import {DeleteIcon} from "@nextui-org/shared-icons";
import DeleteConfirm from "@/components/popup/DeleteConfirm";
import SearchableSelectOrCreate from "@/components/form/SearchableSelectOrCreate";
import {InformationCircleIcon} from "@heroicons/react/24/outline";
import {isFloat, isNumeric} from "@/lib/numbers";

interface PatientMedicineProps {
    patientId: number;
    billId: string | number;
    editable?: boolean;
    onNewServiceAdded?: (addedMedicineItem: any) => void;
    onMedicineTotalChange?: (medicineTotal: number) => void;
}

const PatientMedicineManager: React.FC<PatientMedicineProps> = ({
                                                                    patientId,
                                                                    billId,
                                                                    onNewServiceAdded,
                                                                    editable = true,
                                                                    onMedicineTotalChange
                                                                }) => {
    const [patientMedicineHistories, setPatientMedicineHistories] = useState<HistoryItem[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [medicationFrequency, setMedicationFrequency] = useState<Option>();
    const [duration, setDuration] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [medicineFetchError, setMedicineFetchError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [addMedicineError, setAddMedicineError] = useState<string | undefined>()
    const [historyUpdatedVersion, setHistoryUpdatedVersion] = useState("")
    const [deleteId, setDeleteId] = useState(0)
    const [medicineFrequencyResetter, setMedicineFrequencyResetter] = useState(0)
    const [medicineResetter, setMedicineResetter] = useState(0)
    const [total, setTotal] = useState(0)
    const [count, setCount] = useState(0)
    const [quantityChangingId, setQuantityChangingId] = useState(0)

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchMedicineHistories = () => {
            try {
                setMedicineFetchError("")
                axios.get(`/doctors/patient/bill/${billId}/medicine-histories`).then(response => {
                    setPatientMedicineHistories(response.data);
                }).catch(error => {
                    setMedicineFetchError('Error fetching medicine histories: ' + error.response.data.message);
                }).finally(() => {
                    setLoading(false);
                    setQuantityChangingId(0);
                });
            } catch (error) {
                console.error(error)
            }
        };

        const debounceFetch = setTimeout(fetchMedicineHistories, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [patientId, historyUpdatedVersion]);

    useEffect(() => {
        calculateCountAndTotal();
    }, [patientMedicineHistories, historyUpdatedVersion]);


    const handleCreateNewMedicationFrequency = (item: any) => {
        setMedicationFrequency({label: item, value: "-1"})
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !duration || !medicationFrequency) {
            setAddMedicineError('Please fill out all fields before saving.');
            return;
        }

        if (!isNumeric(quantity)) {
            setAddMedicineError('Quantity must be a number.');
            return;
        }

        try {
            setAddMedicineError('');
            setLoading(true)

            axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: billId,
                brand_id: selectedMedicine.value,
                quantity: quantity,
                medicine_name: selectedMedicine.value === '-1' ? selectedMedicine.label : null,
                medication_frequency_name: medicationFrequency.value === '-1' ? medicationFrequency.label : null,
                medication_frequency_id: medicationFrequency.value,
                duration,
            }).then(response => {
                // Update the medicine history for the current bill
                setHistoryUpdatedVersion(randomString())

                if (onNewServiceAdded && response.data.added_medicine_item) {
                    onNewServiceAdded(response.data.added_medicine_item)
                }

                // Clear the form fields
                setMedicineFrequencyResetter(prev => prev + 1);
                setMedicineResetter(prev => prev + 1);
                setDuration("");
                setQuantity("");
            }).catch(error => {
                setAddMedicineError('Error: ' + error.response.data.message)
            }).finally(() => setLoading(false));


        } catch (error) {
            console.error();
        }
    };

    const calculateCountAndTotal = () => {
        let total = 0;
        let count = 0;
        patientMedicineHistories.forEach((item) => {
            total += Number(item.sale.total_price);
            count += 1;
        });

        setTotal(total);
        setCount(count);
        if (onMedicineTotalChange) {
            onMedicineTotalChange(total)
        }
    }

    const medicineDeleted = () => {
        setLoading(true)
        setHistoryUpdatedVersion(randomString());
        setDeleteId(0)
    };

    const handleQuantityChange = (value: string, id: number, saleId: number) => {

        if (!isNumeric(value)) {
            setAddMedicineError('Quantity must be a number.');
            return;
        } else {
            setAddMedicineError(undefined)
        }

        setPatientMedicineHistories(prevHistories =>
            prevHistories.map(medicine =>
                medicine.id === id ? {...medicine, sale: {...medicine.sale, quantity: Number(value)}} : medicine
            )
        );

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setQuantityChangingId(id);
            axios.patch(`/sales/update-quantity`, {sale_id: saleId, quantity: Number(value)})
                .then(() => {
                    setHistoryUpdatedVersion(randomString())
                })
                .catch(error => {
                    console.error('Error updating quantity:', error);
                });
        }, 800);
    };

    const handleTotalQuantityChange = (value: string, id: number, saleId: number) => {
        setPatientMedicineHistories(prevHistories =>
            prevHistories.map(medicine =>
                medicine.id === id ? {
                    ...medicine,
                    sale: {
                        ...medicine.sale,
                        total_quantity: Number(value)
                    }
                } : medicine
            )
        );

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setQuantityChangingId(id);
            axios.put(`/sales/update-total-quantity`, {
                sale_id: saleId,
                total_quantity: Number(value)
            })
                .then(() => {
                    setHistoryUpdatedVersion(randomString());
                })
                .catch(error => {
                    console.error('Error updating total quantity:', error);
                });
        }, 800);
    };


    return (
        <div className="my-4">
            <div className="text-left">
                {editable && <form onSubmit={handleAddMedicine}>
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 max-w-4xl">
                        <div className="col-span-2">
                            <label className="block mb-2 text-left">Brand/Drug:</label>
                            <SearchableSelectOrCreate
                                apiUri={'medicines'}
                                onSelect={setSelectedMedicine}
                                placeholder={`Medicine`}
                                resetTrigger={medicineResetter}
                            />

                        </div>
                        <div>
                            <label className="block mb-2 text-left">Frequency:</label>
                            <SearchableSelectOrCreate
                                apiUri={'medication_frequencies'}
                                onSelect={setMedicationFrequency}
                                onNotSelect={handleCreateNewMedicationFrequency}
                                resetTrigger={medicineFrequencyResetter}
                                placeholder={`Frequency`}
                                creatable={true}
                            />

                        </div>
                        <div>
                            <label className="block mb-2 text-left">Duration:</label>
                            <input
                                type="text"
                                className="block w-full px-2 py-2 border border-gray-700 rounded mb-4 bg-gray-800"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Duration"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-left">Total Quantity:</label>
                            <input
                                type="text"
                                className="block w-full px-2 py-2 border border-gray-700 rounded mb-4 bg-gray-800"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Quanitity"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full mt-8 border border-green-600 bg-green-700 text-gray-200 py-2 px-4 rounded hover:border-green-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    {addMedicineError && <div className="text-red-500 mb-4">{addMedicineError}</div>}
                    {medicineFetchError && <div className="text-red-500">{medicineFetchError}</div>}
                </form>}
                <div className="max-w-5xl">
                    <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                        {(patientMedicineHistories.length > 0) &&
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="bg-gray-700">
                                <tr className="bg-gray-800">
                                    <th className="px-4 py-2">Medicine/Treatment</th>
                                    <th className="px-4 py-2 text-left">Frequency</th>
                                    <th className="px-4 py-2 text-left">Duration</th>
                                    <th className="px-4 py-2 text-left">Quantity</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    {editable && <th className="px-4 py-2 text-left w-16">Action</th>}
                                </tr>
                                </thead>
                                <tbody>
                                {patientMedicineHistories && patientMedicineHistories.map((medicine: HistoryItem) => (
                                    <tr key={medicine.id} className="border-t border-gray-800">
                                        <td className="px-4 py-2 border-r border-gray-800">
                                            {medicine.sale.brand.name}
                                            <span
                                                className="text-gray-500 text-xs pl-1">- {medicine.sale.brand.drug.name}</span>
                                        </td>
                                        <td className="px-4 py-2 border-r border-gray-800">{medicine.medication_frequency.name}</td>
                                        <td className="px-4 py-2 border-r border-gray-800">{medicine.duration}</td>
                                        <td className="p-1 border-r border-gray-800 pr-4 relative">
                                            <input
                                                className="w-16 block px-2 py-1 border border-gray-700 rounded bg-gray-800 focus:outline-none focus:border-blue-600"
                                                value={medicine.sale?.quantity ?? ""}
                                                onChange={(e) => handleQuantityChange(e.target.value, medicine.id, medicine.sale.id)}
                                            />
                                            {quantityChangingId == medicine.id &&
                                                <span className="absolute right-2 top-3"><Loader
                                                    size={'w-4 h-4'}/></span>}
                                        </td>
                                        <td className="px-4 py-2 border-r border-gray-800">{medicine.sale.total_price}</td>
                                        {editable && <td className="px-4 py-2">
                                            <DeleteIcon
                                                onClick={() => setDeleteId(medicine.id)}
                                                className="mx-auto hover:text-red-500 cursor-pointer"
                                            />
                                        </td>}
                                    </tr>
                                ))}
                                </tbody>
                            </table>}
                        {count > 0 &&
                            <div className="border-t border-gray-800 p-4 font-semibold flex justify-between">
                                <div
                                    className="text-sm text-gray-500"> {`${count} medicine${count > 1 ? 's' : ''}`} </div>
                                <div>Total : {total.toFixed(2)} </div>
                            </div>
                        }
                        {(patientMedicineHistories.length == 0) &&
                            <div className="p-4 text-gray-500 text-xs text-center">Medicine list will appear here</div>}
                    </div>
                    {loading && <div className="my-1 text-center"><Loader/></div>}
                    {!editable && <div className="text-sm text-gray-500 pt-6 flex gap-2 content-center items-center">
                        <InformationCircleIcon width={20} className="text-blue-800"/>
                        List modifications require doctor authorization. Please return the list to the doctor for
                        editing.
                    </div>}
                </div>
            </div>
            {deleteId > 0 &&
                <DeleteConfirm
                    deleteApiUrl="patient-medicine-histories"
                    onClose={() => setDeleteId(0)}
                    onDeleteSuccess={medicineDeleted}
                    deleteId={deleteId}
                >Are you sure you want to delete this medicine?</DeleteConfirm>
            }
        </div>
    );
};

export default PatientMedicineManager;
