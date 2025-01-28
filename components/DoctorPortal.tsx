import React, {useEffect, useState} from 'react';
import axios from '@/lib/axios';
import SearchableSelect from '@/components/form/SearchableSelect';
import {Option, Patient, PatientBill} from "@/types/interfaces";
import PatientMedicineManager from "@/components/PatientMedicineManager";
import DoctorPatientHistory from "@/components/DoctorPatientHistory";
import Loader from "@/components/form/Loader"; // Assuming SearchableSelect is in the same folder

const DoctorPortal: React.FC = () => {

    const [activePatientId, setActivePatientId] = useState<number>(-1);
    const [activePatient, setActivePatient] = useState<Patient>();
    const [activePatientBillId, setActivePatientBillId] = useState<number>(-1);
    const [patientsBills, setPatientsBills] = useState<PatientBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [patientBillsChanged, setPatientBillsChanged] = useState<boolean>(false);
    const [allergy] = useState<Option>();
    const [disease] = useState<Option>();
    const [diseaseAlreadyHaveMessage, setDiseaseAlreadyHaveMessage] = useState<string>("");
    const [allergyAlreadyHaveMessage, setAllergyAlreadyHaveMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [statusChangeError, setStatusChangeError] = useState<string>("");

    // Fetch the patientsBill data from the API
    useEffect(() => {
        const fetchPatientsBill = async () => {
            try {
                const response = await axios.get('/bills/pending/doctor'); // Update to your API endpoint
                const bills = response.data;

                if (bills[0]) {
                    setActivePatientBillId(bills[0].id)
                    setActivePatientId(bills[0].patient.id)
                    setActivePatient(bills[0].patient)
                }

                setPatientsBills(bills);
                setLoading(false);
            } catch (error) {
                setError("Error fetching patientsBill data. " + error);
                setLoading(false);
            }
        };

        const debounceFetch = setTimeout(fetchPatientsBill, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);

    }, [patientBillsChanged]);

    const setActiveItems = (patientBill: PatientBill) => {
        setActivePatientId(patientBill.patient_id)
        setActivePatientBillId(patientBill.id)
    }

    // Handle adding new allergy and saving to DB
    const handleAddAllergy = async (newAllergy: string) => {
        setAllergyAlreadyHaveMessage("")
        try {
            // Make an API request to add the new allergy to the patient's record in the database
            const response = await axios.post('/patients/add-allergy', {
                patient_id: activePatientId,
                allergy_name: newAllergy, // Send the allergy name
            });
            if (response.status === 201) {
                // Update local state with the added allergy if the request was successful
                setPatientsBills(prev => prev.map(patientBill =>
                    patientBill.id === activePatientBillId ? {
                        ...patientBill,
                        patient: {
                            ...patientBill.patient,
                            allergies: [...(patientBill.patient.allergies || []), {id: response.data.id, name: newAllergy}]
                        },
                    } : patientBill
                ));
            } else if (response.status === 208) {
                setAllergyAlreadyHaveMessage(`The patient already has the allergy: ${newAllergy}`);
            }
        } catch (error) {
            console.error("Error adding allergy: ", error);
        }
    };

    // Handle removing allergy
    const handleRemoveAllergy = async (allergyId: number) => {
        setAllergyAlreadyHaveMessage("")
        try {
            // Make an API request to remove the allergy from the patient's record in the database
            await axios.delete(`/patients/remove-allergy/${allergyId}`, {
                data: {patient_id: activePatientId} // Include patient ID in the request body
            });

            // If the request is successful, update local state to remove the allergy
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBillId ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        allergies: (patientBill.patient.allergies || []).filter(allergy => allergy.id !== allergyId)
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error removing allergy: ", error);
        }
    };

    // Handle adding new disease and saving to DB
    const handleAddDisease = async (newDisease: string) => {
        setDiseaseAlreadyHaveMessage("")
        try {
            // Make an API request to add the new disease to the patient's record in the database
            const response = await axios.post('/patients/add-disease', {
                patient_id: activePatientId,
                disease_name: newDisease, // Send the disease name
            });

            if (response.status === 201) {
                // Update local state with the added disease if the request was successful
                setPatientsBills(prev => prev.map(patientBill =>
                    patientBill.id === activePatientBillId ? {
                        ...patientBill,
                        patient: {
                            ...patientBill.patient,
                            diseases: [...(patientBill.patient.diseases || []), {id: response.data.id, name: newDisease}]
                        },
                    } : patientBill
                ));
            } else if (response.status === 208) {
                setDiseaseAlreadyHaveMessage(`The patient already has the disease: ${newDisease}`);
            }

        } catch (error) {
            console.error("Error adding disease: ", error);
        }
    };

    // Handle removing disease
    const handleRemoveDisease = async (diseaseId: number) => {
        setDiseaseAlreadyHaveMessage("")
        try {
            // Make an API request to remove the disease from the patient's record in the database
            await axios.delete(`/patients/remove-disease/${diseaseId}`, {
                data: {patient_id: activePatientId}
            });

            // If the request is successful, update local state to remove the disease
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBillId ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        diseases: (patientBill.patient.diseases || []).filter(disease => disease.id !== diseaseId)
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error removing disease: ", error);
        }
    };

    const changeBillStatus = async () => {
        setLoading(true)
        try {
            setStatusChangeError("")
            const response = await axios.put(`/bills/${activePatientBillId}/status`, {
                status: 'pharmacy',
            }).then(() => {
                setPatientBillsChanged((prev) => !prev);
            }).catch(error => {
                setStatusChangeError("Failed to update the bill status : " + error.response.data.message)
            }).finally(() => setLoading(false));
        } catch (error) {
            console.error('Error updating the bill status:', error);
        }
    }

    if (loading) {
        return <div className="my-4"><Loader/></div>;
    }

    return (
        <div className="font-medium dark:text-gray-400 dark:border-gray-700 relative">
            {/*<div className="absolute border border-gray-700 bg-gray-800 rounded mt-4 mr-4 -top-24 -right-8 px-3 py-2 text-center">*/}
            {/*    <div className="mb-1 text-lg">Next</div>*/}
            {/*    <div className="text-2xl">12</div>*/}
            {/*</div>*/}

            {patientsBills.length > 0 && (
                <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                    {patientsBills.map((patientBill) => (
                        <li key={patientBill.id} className="me-2">
                            <button
                                className={`inline-block p-4 border-b-2 ${
                                    activePatientBillId === patientBill.id
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                } rounded-t-lg`}
                                onClick={() => setActiveItems(patientBill)}
                            >
                                #{patientBill.queue_number}
                            </button>
                        </li>
                    ))}
                </ul>
            ) || (
                <>
                    <h2 className="text-2xl font-bold mb-2 text-left">Doctor Portal</h2>
                    {error && <div className="text-red-500 mt-2">{error}</div> || <div>There are currently no bills available for you</div>}
                </>
            )}

            {/* Tabs for Adding New History and Patient Histories */}
            {(activePatientBillId && patientsBills.length > 0 &&
                <div className="mt-6 mx-3">
                    <div className="my-3 bg-gray-900 grid grid-cols-3 gap-3 text-left">
                        <div className="border border-gray-800 rounded-lg py-4 px-5">
                            {activePatient && (
                                <div>
                                    <div className="font-bold text-2xl mb-2">{activePatient.name}</div>
                                    <div className="text-gray-500"> Age : {activePatient.age}</div>
                                    <div className="text-gray-500"> Gender : {activePatient.gender}</div>
                                </div>
                            )}
                        </div>
                        <div className="border border-gray-800 rounded-lg">
                            <h3 className="font-bold text-xl border-b border-gray-800 px-4 py-3 flex justify-between items-center">
                                Allergies
                            </h3>
                            <div className="px-3 mt-3">
                                <SearchableSelect
                                    placeholder="Add Allergy"
                                    apiUri="allergies"
                                    id="allergy"
                                    value={allergy}
                                    onChange={(item: any) => handleAddAllergy(item.label)}
                                    onCreateOption={(value: any) => handleAddAllergy(value)}
                                />
                            </div>
                            {patientsBills
                                .filter((patientBill) => patientBill.id === activePatientBillId)
                                .map((patientBill) =>
                                    (patientBill.patient.allergies?.length || 0) > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.patient.allergies?.map((allergy, index) => (
                                                <li className="mb-1" key={index}>
                                                    {allergy.name}
                                                    <button
                                                        className="ml-2 text-red-600 font-bold"
                                                        onClick={() => handleRemoveAllergy(allergy.id)}
                                                    >
                                                        x
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="p-3" key={patientBill.id}>No allergies listed.</p>
                                    )
                                )}
                            {allergyAlreadyHaveMessage && <div className="text-yellow-400 text-sm px-3 pb-3">{allergyAlreadyHaveMessage}</div>}
                        </div>
                        <div className="border border-gray-800 rounded-lg">
                            <h3 className="font-bold text-xl border-b border-gray-800 px-4 py-3 flex justify-between items-center">
                                Diseases
                            </h3>
                            <div className="px-3 mt-3">
                                <SearchableSelect
                                    placeholder="Add Disease"
                                    apiUri="diseases"
                                    id="disease"
                                    value={disease}
                                    onChange={(item: any) => handleAddDisease(item.label)}
                                    onCreateOption={(value: any) => handleAddDisease(value)}
                                />
                            </div>
                            {patientsBills
                                .filter((patientBill) => patientBill.id === activePatientBillId)
                                .map((patientBill) =>
                                    (patientBill.patient.diseases?.length || 0) > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.patient.diseases?.map((disease, index) => (
                                                <li className="mb-1" key={index}>
                                                    {disease.name}
                                                    <button
                                                        className="ml-2 text-red-600 font-bold"
                                                        onClick={() => handleRemoveDisease(disease.id)}
                                                    >
                                                        x
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="p-3" key={patientBill.id}>No diseases listed.</p>
                                    )
                                )}

                            {diseaseAlreadyHaveMessage && <div className="text-yellow-400 text-sm px-3 pb-3">{diseaseAlreadyHaveMessage}</div>}
                        </div>
                    </div>

                    <DoctorPatientHistory
                        key={`${activePatientBillId}-${activePatientId}-${patientBillsChanged}`}
                        patientId={activePatientId}
                    />
                    {activePatientBillId > 0 && (
                        <PatientMedicineManager
                            key={`${activePatientBillId}-${patientBillsChanged}`}
                            patientId={activePatientId}
                            billId={activePatientBillId.toString()}/>
                    )}

                    <div className="flex justify-end">
                        {statusChangeError && <div className="text-red-500 mx-6 p-2">{statusChangeError}</div>}
                        <button onClick={changeBillStatus} className="border-green-600 border rounded px-4 py-2 bg-green-700 text-gray-100">Send to pharmacy</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPortal;
