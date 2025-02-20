import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from './form/SearchableSelect';
import {Option, PatientMedicineHistory} from '@/types/interfaces';
import ServiceMedicinesTable from "@/components/ServiceMedicinesTable";
import Loader from "@/components/form/Loader";

interface PatientMedicineProps {
    patientId: number;
    billId: string;
}

const PatientMedicineManager: React.FC<PatientMedicineProps> = ({patientId, billId}) => {
    const [medicineHistories, setMedicineHistories] = useState<PatientMedicineHistory[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [medicationFrequency, setMedicationFrequency] = useState<Option>();
    const [duration, setDuration] = useState<string>('');
    const [medicineFetchError, setMedicineFetchError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [addMedicineError, setAddMedicineError] = useState<string | undefined>()

    useEffect(() => {
        const fetchMedicineHistories = () => {
            try {
                setMedicineFetchError("")
                axios.get(`/doctors/patient/${patientId}/medicine-histories`).then(response => {
                    setMedicineHistories(response.data);
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
    }, [patientId]);

    const handleCreateNewMedicine = (item: any) => {
        setSelectedMedicine({label: item, value: "-1"})
    }

    const handleCreateNewMedicationFrequency = (item: any) => {
        setMedicationFrequency({label: item, value: "-1"})
    }

    const setActiveTabAndBillId = (index: number) => {
        setActiveTab(index);
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !duration || !medicationFrequency) {
            setAddMedicineError('Please fill out all fields before saving.');
            return;
        }

        try {
            setAddMedicineError('');

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
                setMedicineHistories(response.data.data);

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

    if (loading) {
        return <div className="my-8 text-center"><Loader/></div>;
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
                            onClick={() => setActiveTabAndBillId(index)}
                        >
                            {history.created_at.substring(0, 10)}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                {((medicineHistories[activeTab]?.status === 'doctor') || medicineHistories.length === 0) && (
                    <form onSubmit={handleAddMedicine}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                            <div>
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
                        {addMedicineError && <div className="text-red-500 mb-4">{addMedicineError}</div>}
                        {medicineFetchError && <div className="text-red-500">{medicineFetchError}</div>}
                    </form>
                )}
                <div className="max-w-4xl">
                    {(medicineHistories[activeTab]?.status !== 'doctor') && (medicineHistories[activeTab] && medicineHistories[activeTab].patient_medicines.length == 0) &&
                        <div className="p-3 text-gray-500">There were no medicines</div>
                    }
                    {medicineHistories[activeTab] && medicineHistories[activeTab].patient_medicines.length > 0 &&
                        <ServiceMedicinesTable patientMedicines={medicineHistories[activeTab].patient_medicines}/>
                    }
                </div>
            </div>
        </div>
    );
};

export default PatientMedicineManager;
