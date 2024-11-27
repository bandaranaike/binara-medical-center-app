import React, {useState, useEffect} from 'react';
import axios from '../lib/axios';
import SearchableSelect from '../components/form/SearchableSelect';
import {MedicineHistory, Option} from "@/types/interfaces";
import AddIcon from "@/components/icons/AddIcon";
import PatientMedicine from "@/components/PatientMedicine"; // Assuming SearchableSelect is in the same folder

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

interface PatientBill {
    id: number;
    name: string;
    patient_id: number,
    allergies: Allergy[];
    diseases: Disease[];
    histories: PatientHistory[];
    medicineHistories: MedicineHistory[];
}

const PatientHistories: React.FC = () => {

    const [activePatient, setActivePatient] = useState<number>(-1);
    const [activePatientBill, setActivePatientBill] = useState<number>(-1);
    const [activeHistory, setActiveHistory] = useState<number>(-1); // Use -1 for the new history form tab
    const [patientsBills, setPatientsBills] = useState<PatientBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newNote, setNewNote] = useState<string>('');
    const [doctorId] = useState<number>(1);
    const [allergy, setAllergy] = useState<Option>();
    const [disease, setDisease] = useState<Option>();
    const [isAddAllergyModalOpen, setIsAddAllergyModalOpen] = useState(false);
    const [isAddDiseaseModalOpen, setIsAddDiseaseModalOpen] = useState(false);

    // Fetch the patientsBill data from the API
    useEffect(() => {
        const fetchPatientsBill = async () => {
            try {
                const response = await axios.get('/bills/pending'); // Update to your API endpoint
                const bills = response.data;
                const transformedPatientsBill = bills.map((bill: any) => ({
                    id: bill.id,
                    patient_id: bill.patient.id,
                    name: bill.patient.name,
                    allergies: bill.patient.allergies,
                    diseases: bill.patient.diseases,
                    histories: bill.patient.patient_histories.map((history: any) => ({
                        date: history.created_at.toString().split('T')[0],
                        note: history.note,
                    })),
                }));
                setPatientsBills(transformedPatientsBill);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patientsBill data: ", error);
                setLoading(false);
            }
        };

        fetchPatientsBill();
    }, []);

    // Reset activeHistory when the activePatientBill changes
    useEffect(() => {
        setActiveHistory(-1); // Reset to the first tab (add new history) when switching patientsBill
    }, [activePatientBill]);

    const setActiveItems = (patientBill: PatientBill) => {
        setActivePatient(patientBill.patient_id)
        setActivePatientBill(patientBill.id)
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
            const updatedPatientsBill = patientsBills.map((patientBill) => {
                if (patientBill.id === activePatientBill) {
                    return {
                        ...patientBill,
                        histories: [
                            {date: new Date().toISOString().split('T')[0], note: newNote}, // Add new history locally
                            ...patientBill.histories,
                        ],
                    };
                }
                return patientBill;
            });

            setPatientsBills(updatedPatientsBill);
            setNewNote(''); // Clear the input after submission
        } catch (error) {
            console.error("Error adding history: ", error);
        }
    };

    // Handle adding new allergy and saving to DB
    const handleAddAllergy = async (newAllergy: string) => {
        console.log("newAllergy", newAllergy)
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
                    allergies: [...patientBill.allergies, {id: response.data.id, name: newAllergy}]
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
                    allergies: patientBill.allergies.filter(allergy => allergy.id !== allergyId)
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
                    diseases: [...patientBill.diseases, {id: response.data.id, name: newDisease}]
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
                    diseases: patientBill.diseases.filter(disease => disease.id !== diseaseId)
                } : patientBill
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
                            #{patientBill.id} : {patientBill.name}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tabs for Adding New History and Patient Histories */}
            {(activePatientBill > 0 &&
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
                                    patientBill.allergies.length > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.allergies.map((allergy, index) => (
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
                                    patientBill.diseases.length > 0 ? (
                                        <ul key={patientBill.id} className="px-2 pb-2 ml-2">
                                            {patientBill.diseases.map((disease, index) => (
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
                        {patientsBills
                            .filter((patientBill) => patientBill.id === activePatientBill)
                            .map((patientBill) => (
                                patientBill.histories.map((history, index) => (
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
                                    placeholder="Enter note for patientBill history..."
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
                    {activeHistory !== -1 && patientsBills
                        .filter((patientBill) => patientBill.id === activePatientBill)
                        .map((patientBill) => (
                            <div key={patientBill.id} className="text-left p-4 border border-gray-800 rounded-md mb-8">
                                <h3 className="font-bold">Note:</h3>
                                <p>{patientBill.histories[activeHistory]?.note || "No notes available."}</p>
                            </div>
                        ))}
                    {activePatientBill > 0 && (
                        <PatientMedicine
                            patientId={activePatient}
                            patientCurrentBillId={activePatientBill}
                            doctorId={doctorId}
                            medicineHistories={
                                patientsBills.find((bill) => bill.id === activePatientBill)?.medicineHistories || []
                            }
                            updateMedicineHistories={(newHistory) => {
                                setPatientsBills((prev) =>
                                    prev.map((bill) =>
                                        bill.id === activePatientBill
                                            ? {
                                                ...bill,
                                                medicineHistories: [
                                                    newHistory,
                                                    ...(bill.medicineHistories || []),
                                                ],
                                            }
                                            : bill
                                    )
                                );
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientHistories;
