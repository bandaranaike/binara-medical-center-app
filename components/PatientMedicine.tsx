import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from './form/SearchableSelect';
import {MedicineHistory, Option} from '@/types/interfaces';

interface PatientMedicineProps {
    patientId: number;
    initialBillId: string;
    onBillStatusChange: (billId: number) => void;
}

const PatientMedicine: React.FC<PatientMedicineProps> = ({patientId, initialBillId, onBillStatusChange}) => {
    const [medicineHistories, setMedicineHistories] = useState<MedicineHistory[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [selectedMedicine, setSelectedMedicine] = useState<Option>();
    const [dosage, setDosage] = useState<string>('');
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

        fetchMedicineHistories();
    }, [patientId]);

    const handleCreateNewMedicine = (item: any) => {
        setSelectedMedicine({label: item, value: "-1"})
    }

    const setActiveTabAndBillId = (index: number, billId: string) => {
        setActiveTab(index);
        setBillId(billId);
    }

    const changeBillStatus = async () => {
        try {

            const currentBillId = medicineHistories[activeTab] ? medicineHistories[activeTab].billId : billId;

            const response = await axios.put(`/bills/${currentBillId}/status`, {
                status: 'pharmacy',
            });

            if (response.status === 200) {
                setMedicineHistories(medicineHistories.filter((item) => item.billId !== currentBillId));
                onBillStatusChange(Number(currentBillId));
                return response.data; // Handle the response data as needed
            } else {
                console.error('Failed to update the bill status:', response);
            }
        } catch (error) {
            console.error('Error updating the bill status:', error);
        }
    }

    const handleAddMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine || !dosage || !type || !duration) {
            alert('Please fill out all fields before saving.');
            return;
        }

        try {
            const response = await axios.post('/patients/add-medicine', {
                patient_id: patientId,
                bill_id: billId, // medicineHistories.find((history) => history.billId)?.billId, // Use the first bill's ID
                medicine_id: selectedMedicine.value,
                medicine_name: selectedMedicine.value === '-1' ? selectedMedicine.label : null,
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
        <div className="mt-6">
            <ul className="flex flex-wrap -mb-px">
                {medicineHistories.length === 0 && (
                    <li key="first" className="me-2 ml-2">
                        <button className={`inline-block p-4 border-b-2 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' rounded-t-lg`}>
                            Add new
                        </button>
                    </li>
                )}
                {medicineHistories.map((history, index) => (
                    <li key={index} className="me-2 ml-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activeTab === index
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
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

                <div className="text-right">
                    <button onClick={changeBillStatus} className="border-green-600 border rounded px-4 py-2 bg-green-700 text-gray-100">Send to pharmacy</button>
                </div>

            </div>
        </div>
    );
};

export default PatientMedicine;
