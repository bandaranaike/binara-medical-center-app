import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from './form/SearchableSelect';
import {MedicineHistory, Option} from '@/types/interfaces';

interface PatientMedicineProps {
    patientId: number;
    initialBillId: string;
}

const PatientMedicine: React.FC<PatientMedicineProps> = ({patientId, initialBillId}) => {
    const [medicineHistories, setMedicineHistories] = useState<MedicineHistory[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [medicationFrequency, setMedicationFrequency] = useState<Option>();
    const [type, setType] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [billId, setBillId] = useState<string>(initialBillId);

    useEffect(() => {
        const fetchMedicineHistories = async () => {
            try {
                const response = await axios.get(`/doctors/patient/${patientId}/medicine-histories`);
                setMedicineHistories(response.data);
            } catch (error) {
                console.error('Error fetching medicine histories:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(fetchMedicineHistories, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);
    }, [patientId]);

    const handleCreateNewMedicine = (item: any) => {
        setSelectedMedicine({label: item, value: "-1"})
    }
    const handleCreateNewMedicationFrequency = (item: any) => {
        setMedicationFrequency({label: item, value: "-1"})
    }

    const setActiveTabAndBillId = (index: number, billId: string) => {
        setActiveTab(index);
        setBillId(billId);
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !duration || !medicationFrequency) {
            alert('Please fill out all fields before saving.');
            return;
        }

        try {
            const response = await axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: billId,
                medicine_id: selectedMedicine.value,
                medicine_name: selectedMedicine.value === '-1' ? selectedMedicine.label : null,
                medication_frequency_name: medicationFrequency.value === '-1' ? selectedMedicine.label : null,
                medication_frequency_id: medicationFrequency.value,
                duration,
            });

            // Update the medicine history for the current bill
            setMedicineHistories(response.data.data);

            // Clear the form fields
            setSelectedMedicine(undefined);
            setMedicationFrequency(undefined);
            setType('');
            setDuration('');
        } catch (error) {
            console.error('Error adding medicine:', error);
        }
    };

    if (loading) {
        return <div>Loading medicine histories...</div>;
    }

    return (
        <div className="mt-8">
            <ul className="flex flex-wrap -mb-px">
                {medicineHistories.length === 0 && (
                    <li key="first" className="me-2 ml-2">
                        <button className={`inline-block p-3 border-b-2 text-blue-500 border-blue-500 rounded-t-lg`}>
                            Add new
                        </button>
                    </li>
                )}
                {medicineHistories.map((history, index) => (
                    <li key={index} className="me-2 ml-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activeTab === index
                                    ? 'text-blue-500 border-blue-500'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                            } rounded-t-lg`}
                            onClick={() => setActiveTabAndBillId(index, history.billId)}
                        >
                            {history.date}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                {(medicineHistories[activeTab]?.status === 'doctor' || medicineHistories.length === 0) && (
                    <form onSubmit={handleAddMedicine}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                            <div>
                                <SearchableSelect
                                    id="selectMedicine"
                                    value={selectedMedicine}
                                    onChange={(item: any) => setSelectedMedicine(item)}
                                    onCreateOption={item => handleCreateNewMedicine(item)}
                                    placeholder="Medicine"
                                    apiUri="medicines"
                                />
                            </div>
                            <div>
                                <SearchableSelect
                                    id="selecteMedicationFrequency"
                                    value={selectedMedicine}
                                    onChange={(item: any) => setMedicationFrequency(item)}
                                    onCreateOption={item => handleCreateNewMedicationFrequency(item)}
                                    placeholder="Medication frequency"
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
                                    placeholder="Enter duration (e.g., 5 days)"
                                />
                            </div>
                            <div>
                                <div className="py-3.5"></div>
                                <button
                                    type="submit"
                                    className="px-4 pt-2 mt-0.5 pb-2 bg-blue-800 text-white rounded"
                                >
                                    Add Medicine
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <h3 className="font-bold">Medicines List for {medicineHistories[activeTab]?.date}</h3>
                <ul>
                    {medicineHistories[activeTab]?.medicines.map((medicine, idx) => (
                        <li key={idx}>
                            <strong>{medicine.name}</strong>: {medicine.dosage}, {medicine.type}, {medicine.duration}
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default PatientMedicine;
