import React, {useState} from 'react';

interface Prescription {
    medicine: string;
    type: string;
    days: number
}

interface Patient {
    id: number;
    name: string;
    prescription: Prescription[];
}

const PharmacyPortal: React.FC = () => {
    const [activePatient, setActivePatient] = useState<number>(1);
    const [activeHistory, setActiveHistory] = useState<number>(0);

    const patients: Patient[] = [
        {
            id: 1,
            name: 'Patient 1',
            prescription: [
                {medicine: 'Medicine G600', type: 'Tablets', days: 5},
                {medicine: 'Medicine M500', type: 'Tablets', days: 5},
            ],
        },
        {
            id: 2,
            name: 'Patient 2',
            prescription: [
                {medicine: 'Medicine G600', type: 'Tablets', days: 5},
                {medicine: 'Medicine M500', type: 'Tablets', days: 5},
            ],
        },
    ];

    return (
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 relative">
            <div className="absolute border border-gray-600 bg-gray-800 rounded-lg -mt-20 -mr-3 top-0 right-0">
                <div className="text-xl">Nex 6t</div>
                <div className="text-8xl px-6 py-3 border-t border-gray-600">12</div>
                <div className="border-t border-gray-600 p-3">Siriwardhana</div>
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

        </div>
    );
};

export default PharmacyPortal;
