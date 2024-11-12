import React, {useEffect, useState} from 'react';
import axiosLocal from "@/lib/axios";
import {Option} from "@/types/interfaces";

interface CreateSpecialtyModalProps {
    isOpen: boolean;
    specialtyName: string;
    onClose: () => void;
    onSpecialtyCreated: (specialty: Option) => void;
}

const CreateSpecialtyModal: React.FC<CreateSpecialtyModalProps> = ({isOpen, specialtyName, onClose, onSpecialtyCreated}) => {
    const [name, setName] = useState(specialtyName);

    useEffect(() => {
        setName(specialtyName);
    }, [specialtyName]);

    const handleCreateSpecialty = async () => {
        try {
            const response = await axiosLocal.post('specialties', {
                name,
            });
            onSpecialtyCreated({value: response.data.id, label: response.data.name});
            onClose();
        } catch (error) {
            console.error("Error creating specialty:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Add New Specialty</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Specialty Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-600 p-2 rounded-md bg-gray-700"
                        required
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={handleCreateSpecialty}
                    >
                        Save Specialty
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSpecialtyModal;
