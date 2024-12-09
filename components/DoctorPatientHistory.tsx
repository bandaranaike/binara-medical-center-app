import React, {useEffect, useState} from 'react';
import {History} from '@/types/interfaces';
import axios from '@/lib/axios'; // Assumes you have a setup for axios instance

interface DoctorPatientHistoryProps {
    patientId: number;
    doctorId: number;
}

const DoctorPatientHistory: React.FC<DoctorPatientHistoryProps> =
    ({
         patientId,
         doctorId,
     }) => {
        const [activeHistory, setActiveHistory] = useState<number>(1);
        const [newNote, setNewNote] = useState<string>('');
        const [histories, setHistories] = useState<History[]>([]);
        const [loading, setLoading] = useState<boolean>(true);
        const [error, setError] = useState<string | null>(null);

        // Fetch Patient History
        useEffect(() => {
            const fetchHistory = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await axios.get(`/doctor/${doctorId}/patient/${patientId}/history`);
                    setHistories(response.data.data || []);
                } catch (err) {
                    setError('Failed to load patient history.');
                } finally {
                    setLoading(false);
                }
            };

            fetchHistory();
        }, [patientId, doctorId]);

        // Handle Add History Submit
        const handleAddHistorySubmit =
            async (e: React.FormEvent) => {
                e.preventDefault();
                if (!newNote) {
                    alert("Please enter a note before submitting.");
                    return;
                }

                try {
                    // Send the new history to the API
                    // Send the new history to the API
                    const response = await axios.post('/patients/add-history', {
                        note: newNote,
                        patient_id: patientId,
                        doctor_id: doctorId,
                    });

                    // Extract the created history from the API response (assuming the API returns the created history)
                    const newHistory = response.data.data;

                    // Prepend the new history to the existing histories array
                    setHistories((prevHistories) => [newHistory, ...prevHistories]);
                    setNewNote(''); // Clear the input after submission
                } catch (error) {
                    console.error("Error adding history: ", error);
                }
            };

        return (
            <div id="doctor-patient-history">
                {/* Loading or Error */}
                {loading && <p>Loading patient history...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        {/* Tabs */}
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
                            {histories.map((history, index) => (
                                <li key={history.id} className="me-2 ml-2">
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
                            ))}
                        </ul>

                        {/* Form to Add New History */}
                        {activeHistory === -1 && (
                            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                                <form onSubmit={handleAddHistorySubmit}>
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
                        {activeHistory !== -1 && histories[activeHistory] && (
                            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                                <h3 className="font-bold">Note:</h3>
                                <p>{histories[activeHistory].note || 'No notes available.'}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
;

export default DoctorPatientHistory;
