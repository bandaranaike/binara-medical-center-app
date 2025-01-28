import {HistoryItem, PatientMedicineHistory} from '@/types/interfaces';
import React from 'react';

interface MedicinesTableProps {
    patientMedicines?: HistoryItem[];
}

const MedicinesTable: React.FC<MedicinesTableProps> = ({patientMedicines}) => {
    return (

        <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="bg-gray-700">
                <tr className="bg-gray-800">
                    <th className="px-4 py-2">Medicine/Treatment</th>
                    <th className="px-4 py-2 text-left">Medication Frequency</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                </tr>
                </thead>
                <tbody>
                {patientMedicines && patientMedicines.map((medicine: HistoryItem) => (
                    <tr key={medicine.id} className="border-t border-gray-800">
                        <td className="px-4 py-2 border-r border-gray-800">{medicine.medicine.name}</td>
                        <td className="px-4 py-2 border-r border-gray-800">{medicine.medication_frequency.name}</td>
                        <td className="px-4 py-2">{medicine.duration}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicinesTable;
