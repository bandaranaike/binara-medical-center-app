import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from '../components/form/SearchableSelect';
import {Option, PatientBill} from "@/types/interfaces";
import PatientMedicine from "@/components/PatientMedicine";
import DoctorPatientHistory from "@/components/DoctorPatientHistory"; // Assuming SearchableSelect is in the same folder

const PatientHistories: React.FC = () => {

    const [activePatient, setActivePatient] = useState<number>(-1);
    const [activePatientBill, setActivePatientBill] = useState<number>(-1);
    const [patientsBills, setPatientsBills] = useState<PatientBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [patientBillsChanged, setPatientBillsChanged] = useState<boolean>(false);
    const [allergy] = useState<Option>();
    const [disease] = useState<Option>();

    // Fetch the patientsBill data from the API
    useEffect(() => {
        const fetchPatientsBill = async () => {
            try {
                const response = await axios.get('/bills/pending'); // Update to your API endpoint
                const bills = response.data;

                if (bills[0]) {
                    setActivePatientBill(bills[0].id)
                    setActivePatient(bills[0].patient.id)
                }

                setPatientsBills(bills);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patientsBill data: ", error);
                setLoading(false);
            }
        };

        fetchPatientsBill();
    }, [patientBillsChanged]);

    const setActiveItems = (patientBill: PatientBill) => {
        setActivePatient(patientBill.patient_id)
        setActivePatientBill(patientBill.id)
    }

    // Handle adding new allergy and saving to DB
    const handleAddAllergy = async (newAllergy: string) => {
        try {
            // Make an API request to add the new allergy to the patient's record in the database
            const response = await axios.post('/patients/add-allergy', {
                patient_id: activePatient,
                allergy_name: newAllergy, // Send the allergy name
            });

            // Update local state with the added allergy if the request was successful
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBill ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        allergies: [...patientBill.patient.allergies, {id: response.data.id, name: newAllergy}]
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error adding allergy: ", error);
        }
    };

    // Handle removing allergy
    const handleRemoveAllergy = async (allergyId: number) => {
        try {
            // Make an API request to remove the allergy from the patient's record in the database
            await axios.delete(`/patients/remove-allergy/${allergyId}`, {
                data: {patient_id: activePatient} // Include patient ID in the request body
            });

            // If the request is successful, update local state to remove the allergy
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBill ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        allergies: patientBill.patient.allergies.filter(allergy => allergy.id !== allergyId)
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error removing allergy: ", error);
        }
    };

    // Handle adding new disease and saving to DB
    const handleAddDisease = async (newDisease: string) => {
        try {
            // Make an API request to add the new disease to the patient's record in the database
            const response = await axios.post('/patients/add-disease', {
                patient_id: activePatient,
                disease_name: newDisease, // Send the disease name
            });

            // Update local state with the added disease if the request was successful
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBill ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        diseases: [...patientBill.patient.diseases, {id: response.data.id, name: newDisease}]
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error adding disease: ", error);
        }
    };

    // Handle removing disease
    const handleRemoveDisease = async (diseaseId: number) => {
        try {
            // Make an API request to remove the disease from the patient's record in the database
            await axios.delete(`/patients/remove-disease/${diseaseId}`, {
                data: {patient_id: activePatient}
            });

            // If the request is successful, update local state to remove the disease
            setPatientsBills(prev => prev.map(patientBill =>
                patientBill.id === activePatientBill ? {
                    ...patientBill,
                    patient: {
                        ...patientBill.patient,
                        diseases: patientBill.patient.diseases.filter(disease => disease.id !== diseaseId)
                    },
                } : patientBill
            ));
        } catch (error) {
            console.error("Error removing disease: ", error);
        }
    };

    const billStatusHasChanged = (billId: number): any => {
        setPatientBillsChanged((prev) => !prev);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
            <div className="absolute border border-gray-600 bg-gray-800 rounded-lg mt-4 mr-4 top-0 right-0">
                <div className="p-2 text-xl">Next</div>
                <div className="text-6xl px-6 py-3 border-t border-gray-600">12</div>
            </div>
            {/* Outer Tab for Patients */}
            <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                {patientsBills.map((patientBill) => (
                    <li key={patientBill.id} className="me-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activePatientBill === patientBill.id
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                            } rounded-t-lg`}
                            onClick={() => setActiveItems(patientBill)}
                        >
                            #{patientBill.id} : {patientBill.patient.name}
                        </button>
                    </li>
                ))}
            </ul>

            {!patientsBills.length && (<div className="text-center my-6">There are currently no bills available for you</div>)}

            {/* Tabs for Adding New History and Patient Histories */}
            {(activePatientBill && patientsBills.length > 0 &&
                <div className="mt-6 mx-3">
                    <div className="my-3 bg-gray-900 grid grid-cols-2 gap-3 text-left">
                        <div className="border border-gray-600 rounded-lg">
                            <h3 className="font-bold text-lg border-b border-gray-600 px-4 py-2 flex justify-between items-center">
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
                                .filter((patientBill) => patientBill.id === activePatientBill)
                                .map((patientBill) =>
                                    patientBill.patient.allergies.length > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.patient.allergies.map((allergy, index) => (
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
                        </div>
                        <div className="border border-gray-600 rounded-lg">
                            <h3 className="font-bold text-lg border-b border-gray-600 px-4 py-2 flex justify-between items-center">
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
                                .filter((patientBill) => patientBill.id === activePatientBill)
                                .map((patientBill) =>
                                    patientBill.patient.diseases.length > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.patient.diseases.map((disease, index) => (
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

                        </div>
                    </div>

                    <DoctorPatientHistory
                        key={`${activePatientBill}-${activePatient}-${patientBillsChanged}`}
                        patientId={activePatient}
                    />
                    {activePatientBill > 0 && (
                        <PatientMedicine
                            key={`${activePatientBill}-${patientBillsChanged}`}
                            patientId={activePatient}
                            initialBillId={activePatientBill.toString()}
                            onBillStatusChange={billStatusHasChanged}/>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientHistories;
