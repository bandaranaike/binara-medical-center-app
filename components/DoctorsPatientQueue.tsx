import React, { useState } from 'react';

interface PatientHistory {
    date: string;
    details: string;
}

interface Patient {
    id: number;
    name: string;
    histories: PatientHistory[];
}

const PatientHistories: React.FC = () => {
    const [activePatient, setActivePatient] = useState<number>(1);
    const [activeHistory, setActiveHistory] = useState<number>(0);

    const patients: Patient[] = [
        {
            id: 1,
            name: 'Patient 1',
            histories: [
                { date: '2024-08-02', details: 'Checkup details for August' },
                { date: '2024-05-06', details: 'Checkup details for May' },
            ],
        },
        {
            id: 2,
            name: 'Patient 2',
            histories: [
                { date: '2024-06-15', details: 'Checkup details for June' },
                { date: '2024-04-10', details: 'Checkup details for April' },
            ],
        },
    ];

    return (
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 relative">
            <div className="absolute border border-gray-600 bg-gray-800 rounded-lg -mt-20 -mr-3 top-0 right-0">
                <div className="p-3 text-2xl">Next</div>
                <div className="text-8xl px-6 py-3 border-t border-gray-600">12</div>
                <div className="border-t border-gray-600 p-3">Siriwardhana Puinchi hewa</div>
            </div>
            {/* Outer Tab for Patients */}
            <ul className="flex flex-wrap -mb-px border-b border-gray-800">
                {patients.map((patient, index) => (
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

            {/* Inner Tab for Patient Histories */}
            <div className="mt-4 mx-4">
                {patients
                    .filter((patient) => patient.id === activePatient)
                    .map((patient) => (
                        <div key={patient.id}>
                            <ul className="flex flex-wrap -mb-px">
                                {patient.histories.map((history, index) => (
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
                                ))}
                            </ul>

                            <div className="text-left p-4 border border-gray-800 rounded-md mb-8">
                                <h3 className="font-bold">Details:</h3>
                                <p>{patient.histories[activeHistory].details}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PatientHistories;
