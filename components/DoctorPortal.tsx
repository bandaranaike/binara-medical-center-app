import React, {useEffect, useState} from 'react';
import axios from '@/lib/axios';
import SearchableSelect from '@/components/form/SearchableSelect';
import {Option, PatientBill} from "@/types/interfaces";
import DoctorPatientHistory from "@/components/DoctorPatientHistory";
import Loader from "@/components/form/Loader";
import {DeleteIcon} from "@nextui-org/shared-icons";
import PatientMedicineManager from "@/components/PatientMedicineManager";
import BillItemsManager from "@/components/doctor/BillItemsManager";
import PusherListener from "@/components/PusherListener";

const DoctorPortal: React.FC = () => {

    const [activePatientId, setActivePatientId] = useState<number>(-1);
    const [patientsBills, setPatientsBills] = useState<PatientBill[]>([]);
    const [activePatientBill, setActivePatientBill] = useState<PatientBill>();
    const [loading, setLoading] = useState<boolean>(true);
    const [patientBillsChanged, setPatientBillsChanged] = useState('');
    const [allergy] = useState<Option>();
    const [disease] = useState<Option>();
    const [diseaseAlreadyHaveMessage, setDiseaseAlreadyHaveMessage] = useState<string>("");
    const [allergyAlreadyHaveMessage, setAllergyAlreadyHaveMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [statusChangeError, setStatusChangeError] = useState<string>("");
    const [medicineTotal, setMedicineTotal] = useState<number>(0);

    // Fetch the patientsBill data from the API
    useEffect(() => {
        const fetchPatientsBill = () => {
            try {
                axios.get('/bills/pending/doctor').then(response => {
                    const bills = response.data;

                    if (bills[0]) {
                        setActivePatientBill(bills[0])
                        setActivePatientId(bills[0].patient.id)
                    }

                    setPatientsBills(bills);
                    setLoading(false);
                }).catch(error => {
                    setError("Error fetching data: " + error.response.data.message)
                }).finally(() => setLoading(false));

            } catch (error) {
                console.error(error);
            }
        };

        const debounceFetch = setTimeout(fetchPatientsBill, 400); // Debounce API calls
        return () => clearTimeout(debounceFetch);

    }, [patientBillsChanged]);

    const setActiveItems = (patientBill: PatientBill) => {
        setDiseaseAlreadyHaveMessage("")
        setAllergyAlreadyHaveMessage("")
        setActivePatientId(patientBill.patient_id)
        setActivePatientBill(patientBill)
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

                setActivePatientBill(prevPatientBill =>
                    prevPatientBill ? {
                        ...prevPatientBill,
                        patient: {
                            ...prevPatientBill.patient,
                            allergies: [...(prevPatientBill.patient.allergies || []), {
                                id: response.data.id,
                                name: newAllergy
                            }]
                        }
                    } : prevPatientBill
                )
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
            setActivePatientBill(prevPatientBill =>
                prevPatientBill ? {
                    ...prevPatientBill,
                    patient: {
                        ...prevPatientBill.patient,
                        allergies: (prevPatientBill.patient.allergies || []).filter(allergy => allergy.id !== allergyId)
                    }
                } : prevPatientBill
            )

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

                setActivePatientBill(prevPatientBill =>
                    prevPatientBill ? {
                        ...prevPatientBill,
                        patient: {
                            ...prevPatientBill.patient,
                            diseases: [...(prevPatientBill.patient.diseases || []), {
                                id: response.data.id,
                                name: newDisease
                            }]
                        }
                    } : prevPatientBill
                )
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

            setActivePatientBill(prevPatientBill =>
                prevPatientBill ? {
                    ...prevPatientBill,
                    patient: {
                        ...prevPatientBill.patient,
                        diseases: (prevPatientBill.patient.diseases || []).filter(disease => disease.id !== diseaseId)
                    }
                } : prevPatientBill
            )
        } catch (error) {
            console.error("Error removing disease: ", error);
        }
    };

    const changeBillStatus = (status = 'pharmacy') => {
        setLoading(true)
        try {
            setStatusChangeError("")
            axios.put(`/bills/${activePatientBill?.id}/status`, {
                status,
            }).then(() => {
                setPatientBillsChanged(Math.random().toString());
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

            <PusherListener
                channelName="bills-channel"
                eventName="bill-created"
                onEventTriggerAction={() => setPatientBillsChanged(Math.random().toString())}
            />

            {patientsBills.length > 0 && (
                <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                    {patientsBills.map((patientBill) => (
                        <li key={patientBill.id} className="me-2">
                            <button
                                className={`inline-block p-4 border-b-2 ${
                                    activePatientBill?.id === patientBill.id
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                } rounded-t-lg`}
                                onClick={() => setActiveItems(patientBill)}
                            >
                                #{patientBill.queue_number}-{patientBill.id}
                            </button>
                        </li>
                    ))}
                </ul>
            ) || (
                <>
                    <h2 className="text-2xl font-bold mb-2 text-left">Doctor Portal</h2>
                    {error && <div className="text-red-500 mt-2">{error}</div> ||
                        <div>There are currently no bills available for you</div>}
                </>
            )}

            {/* Tabs for Adding New History and Patient Histories */}
            {(patientsBills.length > 0 &&
                <div className="mt-6 mx-3">
                    <div className="my-3 bg-gray-900 grid grid-cols-3 gap-3 text-left">
                        <div className="border border-gray-800 rounded-lg py-4 px-5 col-span-2">
                            {activePatientBill && (
                                <div>
                                    <div className="font-bold text-2xl mb-2">{activePatientBill.patient.name}</div>
                                    <div className="text-gray-500"> Age : {activePatientBill.patient.age}</div>
                                    {activePatientBill.patient.gender && <div className="text-gray-500"> Gender
                                        : {activePatientBill.patient.gender}</div>}
                                    <div className="text-gray-500"> Bill No. : {activePatientBill.id}</div>
                                </div>
                            )}
                        </div>
                        {/*<div className="border border-gray-800 rounded-lg">*/}
                        {/*    <h3 className="font-bold text-xl border-b border-gray-800 px-4 py-3 flex justify-between items-center">*/}
                        {/*        Allergies*/}
                        {/*    </h3>*/}
                        {/*    <div className="px-3 mt-3">*/}
                        {/*        <SearchableSelect*/}
                        {/*            placeholder="Add Allergy"*/}
                        {/*            apiUri="allergies"*/}
                        {/*            id="allergy"*/}
                        {/*            value={allergy}*/}
                        {/*            onChange={(item: any) => handleAddAllergy(item.label)}*/}
                        {/*            onCreateOption={(value: any) => handleAddAllergy(value)}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*    {activePatientBill && (activePatientBill.patient.allergies?.length || 0) > 0 ? (*/}
                        {/*        <ul key={activePatientBill.id} className="px-2 pb-2 ml-2">*/}
                        {/*            {activePatientBill.patient.allergies?.map((allergy, index) => (*/}
                        {/*                <li className="mb-1 flex content-center" key={index}>*/}
                        {/*                    {allergy.name}*/}
                        {/*                    <button*/}
                        {/*                        className="ml-2 hover:text-red-600 font-bold"*/}
                        {/*                        onClick={() => handleRemoveAllergy(allergy.id)}*/}
                        {/*                    >*/}
                        {/*                        <DeleteIcon/>*/}
                        {/*                    </button>*/}
                        {/*                </li>*/}
                        {/*            ))}*/}
                        {/*        </ul>*/}
                        {/*    ) : (*/}
                        {/*        <p className="p-3">No allergies listed.</p>*/}
                        {/*    )*/}
                        {/*    }*/}
                        {/*    {allergyAlreadyHaveMessage &&*/}
                        {/*        <div className="text-yellow-400 text-sm px-3 pb-3">{allergyAlreadyHaveMessage}</div>}*/}
                        {/*</div>*/}
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
                            {activePatientBill && (activePatientBill.patient.diseases?.length || 0) > 0 ? (
                                <ul key={activePatientBill.id} className="px-2 pb-2 ml-2">
                                    {activePatientBill.patient.diseases?.map((disease, index) => (
                                        <li className="mb-1 flex content-center" key={index}>
                                            {disease.name}
                                            <button
                                                className="ml-2 hover:text-red-600 font-bold"
                                                onClick={() => handleRemoveDisease(disease.id)}
                                            >
                                                <DeleteIcon/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="p-3">No diseases listed.</p>
                            }

                            {diseaseAlreadyHaveMessage &&
                                <div className="text-yellow-400 text-sm px-3 pb-3">{diseaseAlreadyHaveMessage}</div>}
                        </div>
                    </div>

                    <DoctorPatientHistory
                        key={`${activePatientBill?.id}-${activePatientId}-${patientBillsChanged}`}
                        patientId={activePatientId}
                    />

                    {activePatientBill &&
                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <PatientMedicineManager
                                onMedicineTotalChange={setMedicineTotal}
                                patientId={activePatientId}
                                billId={activePatientBill?.id.toString()}
                            />
                            <BillItemsManager
                                medicineTotal={medicineTotal}
                                billId={activePatientBill.id}
                            ></BillItemsManager>
                        </div>
                    }
                    <div className="flex justify-end">
                        {statusChangeError && <div className="text-red-500 mx-6 p-2">{statusChangeError}</div>}
                        <button onClick={() => changeBillStatus('reception')}
                                className="border-blue-600 border rounded px-4 py-2 bg-blue-700 text-gray-200 mr-4">Send to
                            Reception
                        </button>
                        <button onClick={() => changeBillStatus()}
                                className="border-green-600 border rounded px-4 py-2 bg-green-700 text-gray-200">Send to
                            pharmacy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPortal;
