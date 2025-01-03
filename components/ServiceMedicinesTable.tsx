import {PatientMedicine} from '@/types/interfaces';
import React from 'react';

interface MedicinesTableProps {
    patientMedicines: PatientMedicine[];
}

const MedicinesTable: React.FC<MedicinesTableProps> = ({patientMedicines}) => {
    return (
        <div className="border border-dashed border-gray-600 rounded-lg p-4 my-4">
            <h4 className="mb-2 text-lg font-bold">Medicines</h4>
            <div className="relative overflow-x-auto sm:rounded-lg border border-gray-800">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="bg-gray-700">
                    <tr className="bg-gray-800">
                        <th className="px-4 py-2">Medicine</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Dosage</th>
                        <th className="px-4 py-2 text-left">Duration</th>
                    </tr>
                    </thead>
                    <tbody>
                    {patientMedicines.map((medicine: PatientMedicine) => (
                        <tr key={medicine.id} className="border-t border-gray-800">
                            <td className="px-4 py-2 border-r border-gray-800">{medicine.medicine.name}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{medicine.type}</td>
                            <td className="px-4 py-2 border-r border-gray-800">{medicine.dosage}</td>
                            <td className="px-4 py-2">{medicine.duration}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MedicinesTable;
