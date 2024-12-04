import React, {useEffect, useState} from 'react';
import axiosLocal from "@/lib/axios";
import SearchableSelect from '@/components/form/SearchableSelect';
import CreateHospitalModal from '@/components/CreateHospitalModal';
import CreateSpecialtyModal from '@/components/CreateSpecialtyModal'; // Import the new specialty modal
import {Option} from "@/types/interfaces";

interface CreateNewDoctorProps {
    isOpen: boolean;
    doctorsName: string;
    onClose: () => void;
    onDoctorCreated: (doctor: Option) => void;
}

const CreateNewDoctor: React.FC<CreateNewDoctorProps> = ({isOpen, doctorsName, onClose, onDoctorCreated}) => {
    const [name, setName] = useState(doctorsName);
    const [hospital, setHospital] = useState<Option>();
    const [specialty, setSpecialty] = useState<Option>();
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState<number | string>('');
    const [address, setAddress] = useState('');
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);

    useEffect(() => {
        setName(doctorsName);
    }, [doctorsName]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            let response = await axiosLocal.post('doctors', {
                name,
                hospital_id: hospital?.value,
                specialty_id: specialty?.value,
                telephone,
                email,
                age,
                address,
            });
            console.log("response.data", response.data)
            onDoctorCreated({value: response.data.id, label: response.data.name});
            onClose();
        } catch (error) {
            console.error("Error creating doctor:", error);
        }
    };

    const handleHospitalCreated = (newHospital: Option) => {
        setHospital(newHospital);
    };

    const handleHospitalChangeOption = (selectedOption: any) => {
        setHospital(selectedOption);
    };

    const handleOpenCreateHospital = (hospitalName: string) => {
        setHospital({label: hospitalName, value: '0'});
        setIsHospitalModalOpen(true);
    };

    const handleSpecialtyCreated = (newSpecialty: Option) => {
        setSpecialty(newSpecialty);
    };

    const handleSpecialtyChangeOption = (selectedOption: any) => {
        setSpecialty(selectedOption);
    };

    const handleOpenCreateSpecialty = (specialtyName: string) => {
        setSpecialty({label: specialtyName, value: '0'});
        setIsSpecialtyModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Create New Doctor</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Name :</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-600 p-2 rounded-md bg-gray-700"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <SearchableSelect
                            placeholder="Hospital"
                            apiUri="hospitals"
                            value={hospital}
                            onChange={handleHospitalChangeOption}
                            onCreateOption={handleOpenCreateHospital}
                            id={'HospitalNameSelect'}
                        />
                    </div>
                    <div className="mb-4">
                        <SearchableSelect
                            placeholder="Specialty"
                            apiUri="specialties"
                            value={specialty}
                            onChange={handleSpecialtyChangeOption}
                            onCreateOption={handleOpenCreateSpecialty}
                            id={'SpecialtyNameSelect'}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Telephone :</label>
                        <input
                            type="text"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            className="w-full border border-gray-600 p-2 rounded-md bg-gray-700"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email :</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-600 p-2 rounded-md bg-gray-700"
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
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Create Doctor
                        </button>
                    </div>
                </form>
            </div>

            <CreateHospitalModal
                isOpen={isHospitalModalOpen}
                onClose={() => setIsHospitalModalOpen(false)}
                onHospitalCreated={handleHospitalCreated}
                hospitalName={hospital ? hospital.label : ''}
            />

            <CreateSpecialtyModal
                isOpen={isSpecialtyModalOpen}
                onClose={() => setIsSpecialtyModalOpen(false)}
                onSpecialtyCreated={handleSpecialtyCreated}
                specialtyName={specialty ? specialty.label : ''}
            />
        </div>
    );
};

export default CreateNewDoctor;