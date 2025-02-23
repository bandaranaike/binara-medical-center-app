import React, {useState, useEffect} from 'react';
import axios from '@/lib/axios';
import {PatientMedicineHistory} from '@/types/interfaces';
import Loader from "@/components/form/Loader";
import PatientMedicineManager from "@/components/PatientMedicineManager";

interface PatientMedicineProps {
    patientId: number;
}

const DoctorPatientMedicineHistory: React.FC<PatientMedicineProps> = ({patientId}) => {
    const [medicineHistories, setMedicineHistories] = useState<PatientMedicineHistory[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [medicineFetchError, setMedicineFetchError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

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

    const setActiveTabAndBillId = (index: number) => {
        setActiveTab(index);
    }

    if (loading) {
        return <div className="my-8 text-center"><Loader/></div>;
    }

    return (
        <div className="">
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
           *** {medicineHistories[activeTab].id} ***
            {medicineHistories &&
                <PatientMedicineManager patientId={patientId} billId={medicineHistories[activeTab].id} editable={false}/>
            }
            {medicineFetchError && <div className="my-3 text-red-500">{medicineFetchError}</div>}
        </div>
    );
};

export default DoctorPatientMedicineHistory;
