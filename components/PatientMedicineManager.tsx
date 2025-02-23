import React, {useState, useEffect} from 'react';
import axios from '@/lib/axios';
import SearchableSelect from '@/components/form/SearchableSelect';
import {HistoryItem, Option} from '@/types/interfaces';
import Loader from "@/components/form/Loader";
import {randomString} from "@/lib/strings";
import {DeleteIcon} from "@nextui-org/shared-icons";
import DeleteConfirm from "@/components/popup/DeleteConfirm";

interface PatientMedicineProps {
    patientId: number;
    billId: string | number;
    editable?: boolean;
    onNewServiceAdded?: () => void;
}

const PatientMedicineManager: React.FC<PatientMedicineProps> = ({patientId, billId, onNewServiceAdded, editable = true}) => {
    const [patientMedicineHistories, setPatientMedicineHistories] = useState<HistoryItem[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [medicationFrequency, setMedicationFrequency] = useState<Option>();
    const [duration, setDuration] = useState<string>('');
    const [medicineFetchError, setMedicineFetchError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [addMedicineError, setAddMedicineError] = useState<string | undefined>()
    const [historyUpdatedVersion, setHistoryUpdatedVersion] = useState("")
    const [deleteId, setDeleteId] = useState(0)

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
                });
            } catch (error) {
                console.error(error)
            }
        };

        const debounceFetch = setTimeout(fetchMedicineHistories, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [patientId, historyUpdatedVersion]);

    const handleCreateNewMedicine = (item: any) => {
        setSelectedMedicine({label: item, value: "-1"})
    }

    const handleCreateNewMedicationFrequency = (item: any) => {
        setMedicationFrequency({label: item, value: "-1"})
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !duration || !medicationFrequency) {
            setAddMedicineError('Please fill out all fields before saving.');
            return;
        }

        try {
            setAddMedicineError('');
            setLoading(true)

            axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: billId,
                medicine_id: selectedMedicine.value,
                medicine_name: selectedMedicine.value === '-1' ? selectedMedicine.label : null,
                medication_frequency_name: medicationFrequency.value === '-1' ? medicationFrequency.label : null,
                medication_frequency_id: medicationFrequency.value,
                duration,
            }).then(response => {
                // Update the medicine history for the current bill
                setHistoryUpdatedVersion(randomString())

                if (onNewServiceAdded && response.data.is_medicine_item_added) {
                    onNewServiceAdded()
                }

                // Clear the form fields
                setSelectedMedicine(undefined);
                setMedicationFrequency(undefined);
                setDuration('');
            }).catch(error => {
                setAddMedicineError('Error adding medicine: ' + error.response.data.message)
            });


        } catch (error) {
            console.error();
        }
    };

    const medicineDeleted = () => {
        setLoading(true)
        setHistoryUpdatedVersion(randomString());
        setDeleteId(0)
    };
    return (
        <div className="my-4">
            <div className="text-left">
                {editable && <form onSubmit={handleAddMedicine}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 max-w-4xl">
                        <div className="col-span-2">
                            <SearchableSelect
                                id="selectMedicine"
                                value={selectedMedicine}
                                onChange={(item: any) => setSelectedMedicine(item)}
                                onCreateOption={item => handleCreateNewMedicine(item)}
                                placeholder="Medicine/Treatment"
                                apiUri="medicines"
                            />
                        </div>
                        <div>
                            <SearchableSelect
                                id="selecteMedicationFrequency"
                                value={selectedMedicine}
                                onChange={(item: any) => setMedicationFrequency(item)}
                                onCreateOption={item => handleCreateNewMedicationFrequency(item)}
                                placeholder="Frequency"
                                apiUri="medication_frequencies"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-left">Duration:</label>
                            <input
                                type="text"
                                className="block w-full px-2 py-1.5 border border-gray-700 rounded mb-4 bg-gray-800"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Duration"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full mt-8 border border-green-600 bg-green-700 text-white py-1.5 px-4 rounded hover:border-green-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    {addMedicineError && <div className="text-red-500 mb-4">{addMedicineError}</div>}
                    {medicineFetchError && <div className="text-red-500">{medicineFetchError}</div>}
                </form>}
                <div className="max-w-4xl">
                    <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                        {(patientMedicineHistories.length > 0) && <table className="w-full text-sm text-left text-gray-400">
                            <thead className="bg-gray-700">
                            <tr className="bg-gray-800">
                                <th className="px-4 py-2">Medicine/Treatment</th>
                                <th className="px-4 py-2 text-left">Frequency</th>
                                <th className="px-4 py-2 text-left">Duration</th>
                                {editable && <th className="px-4 py-2 text-left w-16">Action</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {patientMedicineHistories && patientMedicineHistories.map((medicine: HistoryItem) => (
                                <tr key={medicine.id} className="border-t border-gray-800">
                                    <td className="px-4 py-2 border-r border-gray-800">{medicine.medicine.name}</td>
                                    <td className="px-4 py-2 border-r border-gray-800">{medicine.medication_frequency.name}</td>
                                    <td className="px-4 py-2 border-r border-gray-800">{medicine.duration}</td>
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
                        {(patientMedicineHistories.length == 0) && <div className="p-4 text-gray-500 text-sm text-center">Medicine list will appear here</div>}
                    </div>
                    {loading && <div className="my-1 text-center"><Loader/></div>}
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
