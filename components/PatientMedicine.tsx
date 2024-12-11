import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from './form/SearchableSelect';
import {MedicineHistory, Option} from '@/types/interfaces';

interface PatientMedicineProps {
    patientId: number;
}

const PatientMedicine: React.FC<PatientMedicineProps> = ({patientId}) => {
    const [medicineHistories, setMedicineHistories] = useState<MedicineHistory[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [dosage, setDosage] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

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

        fetchMedicineHistories();
    }, [patientId]);

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !dosage || !type || !duration) {
            alert('Please fill out all fields before saving.');
            return;
        }

        try {
            const response = await axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: medicineHistories.find((history) => history.billId)?.billId, // Use the first bill's ID
                medicine_id: selectedMedicine.value,
                dosage,
                type,
                duration,
            });

            // Update the medicine history for the current bill
            setMedicineHistories(response.data.data);

            // Clear the form fields
            setSelectedMedicine(undefined);
            setDosage('');
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
        <div className="mt-6 mx-3">
            <ul className="flex flex-wrap -mb-px">
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
            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                {medicineHistories[activeTab]?.status === 'doctor' && (
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
