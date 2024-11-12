import React, {useEffect, useState,} from 'react';
import axiosLocal from "@/lib/axios";
import {Option} from "@/types/interfaces";

interface CreateHospitalModalProps {
    isOpen: boolean;
    hospitalName: string;
    onClose: () => void;
    onHospitalCreated: (hospital: Option) => void;
}

const CreateHospitalModal: React.FC<CreateHospitalModalProps> = ({isOpen, hospitalName, onClose, onHospitalCreated}) => {
    const [name, setName] = useState(hospitalName);
    const [location, setLocation] = useState('');

    useEffect(() => {
        setName(hospitalName);
    }, [hospitalName]);

    const handleCreateHospital = async () => {
        try {
            const response = await axiosLocal.post('hospitals', {
                name,
                location,
            });
            onHospitalCreated({value: response.data.id, label: response.data.name});
            onClose();
        } catch (error) {
            console.error("Error creating hospital:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Add New Hospital</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Hospital Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-600 p-2 rounded-md bg-gray-700"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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
                        onClick={handleCreateHospital}
                    >
                        Save Hospital
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateHospitalModal;
