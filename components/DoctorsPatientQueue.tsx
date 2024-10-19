import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from '../components/form/SearchableSelect';
import {Option} from "@/types/interfaces"; // Assuming SearchableSelect is in the same folder

interface PatientHistory {
    date: string;
    note: string;
}

interface Allergy {
    name: string;
    id: number;
}

interface Disease {
    name: string;
    id: number;
}

interface Patient {
    id: number;
    name: string;
    allergies: Allergy[];
    diseases: Disease[];
    histories: PatientHistory[];
}

const PatientHistories: React.FC = () => {

    const [activePatient, setActivePatient] = useState<number>(-1);
    const [activeHistory, setActiveHistory] = useState<number>(-1); // Use -1 for the new history form tab
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newNote, setNewNote] = useState<string>('');
    const [doctorId] = useState<number>(1);
    const [allergy, setAllergy] = useState<Option>();
    const [disease, setDisease] = useState<Option>();

    // Fetch the patients data from the API
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await axios.get('/bills/pending'); // Update to your API endpoint
                const bills = response.data;
                const transformedPatients = bills.map((bill: any) => ({
                    id: bill.id,
                    name: bill.patient.name,
                    allergies: bill.patient.allergies,
                    diseases: bill.patient.diseases,
                    histories: bill.patient.patient_histories.map((history: any) => ({
                        date: history.created_at.toString().split('T')[0],
                        note: history.note,
                    })),
                }));
                setPatients(transformedPatients);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patients data: ", error);
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    // Reset activeHistory when the activePatient changes
    useEffect(() => {
        setActiveHistory(-1); // Reset to the first tab (add new history) when switching patients
    }, [activePatient]);

    const setActiveItems = (paitent : Patient)=> {

    }

    // Handle adding new history
    const handleAddHistory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote) {
            alert("Please enter a note before submitting.");
            return;
        }

        try {
            // Send the new history to the API
            await axios.post('/patients-histories', {
                note: newNote,
                patient_id: activePatient,
                doctor_id: doctorId, // Assuming you have the doctor ID from somewhere
            });

            // Update the local state with the new history
            const updatedPatients = patients.map((patient) => {
                if (patient.id === activePatient) {
                    return {
                        ...patient,
                        histories: [
                            {date: new Date().toISOString().split('T')[0], note: newNote}, // Add new history locally
                            ...patient.histories,
                        ],
                    };
                }
                return patient;
            });

            setPatients(updatedPatients);
            setNewNote(''); // Clear the input after submission
        } catch (error) {
            console.error("Error adding history: ", error);
        }
    };

    // Handle adding new allergy and saving to DB
    const handleAddAllergy = async (newAllergy: { label: string, value: string }) => {
        try {
            // Make an API request to add the new allergy to the patient's record in the database
            const response = await axios.post('/patients/add-allergy', {
                patient_id: activePatient,
                allergy_name: newAllergy.label, // Send the allergy name
            });

            // Update local state with the added allergy if the request was successful
            setPatients(prev => prev.map(patient =>
                patient.id === activePatient ? {
                    ...patient,
                    allergies: [...patient.allergies, {id: response.data.id, name: newAllergy.label}]
                } : patient
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
            setPatients(prev => prev.map(patient =>
                patient.id === activePatient ? {
                    ...patient,
                    allergies: patient.allergies.filter(allergy => allergy.id !== allergyId)
                } : patient
            ));
        } catch (error) {
            console.error("Error removing allergy: ", error);
        }
    };

    // Handle adding new disease and saving to DB
    const handleAddDisease = async (newDisease: { label: string, value: string }) => {
        try {
            // Make an API request to add the new disease to the patient's record in the database
            const response = await axios.post('/patients/add-disease', {
                patient_id: activePatient,
                disease_name: newDisease.label, // Send the disease name
            });

            // Update local state with the added disease if the request was successful
            setPatients(prev => prev.map(patient =>
                patient.id === activePatient ? {
                    ...patient,
                    diseases: [...patient.diseases, {id: response.data.id, name: newDisease.label}]
                } : patient
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
            setPatients(prev => prev.map(patient =>
                patient.id === activePatient ? {
                    ...patient,
                    diseases: patient.diseases.filter(disease => disease.id !== diseaseId)
                } : patient
            ));
        } catch (error) {
            console.error("Error removing disease: ", error);
        }
    };


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
                {patients.map((patient) => (
                    <li key={patient.id} className="me-2">
                        <button
                            className={`inline-block p-4 border-b-2 ${
                                activePatient === patient.id
                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                            } rounded-t-lg`}
                            onClick={() => setActivePatient(patient.id)}
                        >
                            #{patient.id} : {patient.name}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tabs for Adding New History and Patient Histories */}
            {(activePatient > 0 &&
                <div className="mt-6 mx-3">
                    <div className="my-3 bg-gray-900 grid grid-cols-2 gap-3 text-left">
                        <div className="border border-gray-600 rounded-lg">
                            <h3 className="font-bold text-lg border-b border-gray-600 px-4 py-2">Allergies</h3>
                            {patients
                                .filter((patient) => patient.id === activePatient)
                                .map((patient) =>
                                    patient.allergies.length > 0 ? (
                                        <ul key={patient.id} className="p-2 ml-2">
                                            {patient.allergies.map((allergy, index) => (
                                                <li className="mb-1" key={index}>
                                                    {allergy.name}
                                                    <button
                                                        className="ml-2 text-red-500"
                                                        onClick={() => handleRemoveAllergy(allergy.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                            <li>
                                                <SearchableSelect
                                                    placeholder="Add Allergy"
                                                    apiUri="allergies"
                                                    id="allergy"
                                                    value={allergy}
                                                    onChange={(value: any) => handleAddAllergy(value)}
                                                />
                                            </li>
                                        </ul>
                                    ) : (
                                        <p className="p-3" key={patient.id}>No allergies listed.</p>
                                    )
                                )}
                        </div>
                        <div className="border border-gray-600 rounded-lg">
                            <h3 className="font-bold text-lg border-b border-gray-600 px-4 py-2">Diseases</h3>
                            {patients
                                .filter((patient) => patient.id === activePatient)
                                .map((patient) =>
                                    patient.diseases.length > 0 ? (
                                        <ul key={patient.id} className="p-2 ml-2">
                                            {patient.diseases.map((disease, index) => (
                                                <li className="mb-1" key={index}>
                                                    {disease.name}
                                                    <button
                                                        className="ml-2 text-red-500"
                                                        onClick={() => handleRemoveDisease(disease.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                            <li>
                                                <SearchableSelect
                                                    placeholder="Add Disease"
                                                    apiUri="diseases"
                                                    id="disease"
                                                    value={disease}
                                                    onChange={(value: any) => handleAddDisease(value)}
                                                />
                                            </li>
                                        </ul>
                                    ) : (
                                        <p className="p-3" key={patient.id}>No diseases listed.</p>
                                    )
                                )}

                        </div>
                    </div>

                    <ul className="flex flex-wrap -mb-px">
                        {/* Add New History Tab */}
                        <li className="me-2 ml-2">
                            <button
                                className={`inline-block p-4 border-b-2 ${
                                    activeHistory === -1
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                } rounded-t-lg`}
                                onClick={() => setActiveHistory(-1)}
                            >
                                Add New History
                            </button>
                        </li>

                        {/* Patient Histories Tabs */}
                        {patients
                            .filter((patient) => patient.id === activePatient)
                            .map((patient) => (
                                patient.histories.map((history, index) => (
                                    <li key={index} className="me-2 ml-2">
                                        <button
                                            className={`inline-block p-4 border-b-2 ${
                                                activeHistory === index
                                                    ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                            } rounded-t-lg`}

                                            onClick={() => setActiveHistory(index)}
                                        >
                                            {history.date}
                                        </button>
                                    </li>
                                ))
                            ))}
                    </ul>

                    {/* Form to Add New History */}
                    {activeHistory === -1 && (
                        <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                            <form onSubmit={handleAddHistory}>
                                <label className="block mb-2 text-left">Note:</label>
                                <textarea
                                    className="block w-full p-2 border border-gray-600 rounded mb-4 bg-gray-700"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Enter note for patient history..."
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Add History
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Display Selected Patient History */}
                    {activeHistory !== -1 && patients
                        .filter((patient) => patient.id === activePatient)
                        .map((patient) => (
                            <div key={patient.id} className="text-left p-4 border border-gray-800 rounded-md mb-8">
                                <h3 className="font-bold">Note:</h3>
                                <p>{patient.histories[activeHistory]?.note || "No notes available."}</p>
                            </div>
                        ))}

                </div>
            )}
        </div>
    );
};

export default PatientHistories;
