import React, {useState} from 'react';
import axios from '../lib/axios';
import SearchableSelect from './form/SearchableSelect';
import {MedicineHistory, Option} from "@/types/interfaces";

interface PatientMedicineProps {
    patientId: number;
    patientCurrentBillId: number;
    doctorId: number;
    medicineHistories: MedicineHistory[];
    updateMedicineHistories: (newHistory: MedicineHistory) => void;
}

const PatientMedicine: React.FC<PatientMedicineProps> = (
    {
        patientId,
        patientCurrentBillId,
        doctorId,
        medicineHistories,
        updateMedicineHistories,
    }) => {
    const [activeTab, setActiveTab] = useState<number>(-1);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [dosage, setDosage] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [duration, setDuration] = useState<string>('');

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !dosage || !type || !duration) {
            alert('Please fill out all fields before saving.');
            return;
        }

        try {
            const response = await axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: patientCurrentBillId,
                doctor_id: doctorId,
                medicine_id: selectedMedicine.value,
                dosage,
                type,
                duration,
            });

            const newHistory: MedicineHistory = {
                date: new Date().toISOString().split('T')[0],
                medicineName: selectedMedicine.label,
                dosage,
                type,
                duration,
            };

            updateMedicineHistories(newHistory);

            // Clear the form fields
            setSelectedMedicine(undefined);
            setDosage('');
            setType('');
            setDuration('');
        } catch (error) {
            console.error('Error adding medicine:', error);
        }
    };

    return (
        <div className="mt-6 mx-3">
            <ul className="flex flex-wrap -mb-px">
                <li className="me-2 ml-2">
                    <button
                        className={`inline-block p-4 border-b-2 ${
                            activeTab === -1
                                ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                        } rounded-t-lg`}
                        onClick={() => setActiveTab(-1)}
                    >
                        Add Medicine
                    </button>
                </li>
                {medicineHistories.map((history, index) => (
                    <li key={index} className="me-2 ml-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activeTab === index
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                            } rounded-t-lg`}
                            onClick={() => setActiveTab(index)}
                        >
                            {history.date}
                        </button>
                    </li>
                ))}
            </ul>
            {activeTab === -1 ? (
                <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                    <form onSubmit={handleAddMedicine}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                            <div>
                                <SearchableSelect
                                    id="selectMedicine"
                                    value={selectedMedicine}
                                    onChange={(item: any) => setSelectedMedicine(item)}
                                    placeholder="Medicine"
                                    apiUri="medicines"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-left">Dosage:</label>
                                <input
                                    type="text"
                                    className="block w-full px-2 py-1.5 border border-gray-600 rounded mb-4 bg-gray-700"
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    placeholder="Enter dosage (e.g., 1 tablet twice daily)"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-left">Type:</label>
                                <input
                                    type="text"
                                    className="block w-full px-2 py-1.5 border border-gray-600 rounded mb-4 bg-gray-700"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="Enter type (e.g., tablet, syrup)"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-left">Duration:</label>
                                <input
                                    type="text"
                                    className="block w-full px-2 py-1.5 border border-gray-600 rounded mb-4 bg-gray-700"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="Enter duration (e.g., 5 days)"
                                />
                            </div>
                            <div>
                                <div className="py-3.5"></div>
                                <button
                                    type="submit"
                                    className="px-4 pt-2.5 pb-2 bg-blue-500 text-white rounded"
                                >
                                    Add Medicine
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                    <h3 className="font-bold">Medicine Details:</h3>
                    <p><strong>Date:</strong> {medicineHistories[activeTab]?.date}</p>
                    <p><strong>Medicine:</strong> {medicineHistories[activeTab]?.medicineName}</p>
                    <p><strong>Dosage:</strong> {medicineHistories[activeTab]?.dosage}</p>
                    <p><strong>Type:</strong> {medicineHistories[activeTab]?.type}</p>
                    <p><strong>Duration:</strong> {medicineHistories[activeTab]?.duration}</p>
                </div>
            )}
        </div>
    );
};

export default PatientMedicine;