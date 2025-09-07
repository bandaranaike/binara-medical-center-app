import React, {useEffect, useState} from 'react';
import axiosLocal from "@/lib/axios";
import SearchableSelect from '@/components/form/SearchableSelect';
import CreateHospitalModal from '@/components/CreateHospitalModal';
import CreateSpecialtyModal from '@/components/CreateSpecialtyModal'; // Import the new specialty modal
import {Option} from "@/types/interfaces";
import TextInput from "@/components/form/TextInput";
import CustomRadio from "@/components/form/CustomRadio";

interface CreateNewDoctorProps {
    isOpen: boolean;
    doctorType: string;
    doctorsName: string;
    onClose: () => void;
    onDoctorCreated: (id: number) => void;
}

const CreateNewDoctor: React.FC<CreateNewDoctorProps> = ({isOpen, doctorType: initialDoctorType, doctorsName, onClose, onDoctorCreated}) => {
    const [name, setName] = useState(doctorsName);
    const [hospital, setHospital] = useState<Option>();
    const [specialty, setSpecialty] = useState<Option>();
    const [telephone, setTelephone] = useState('');
    const [email, setEmail] = useState('');
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
    const [doctorType, setDoctorType] = useState(initialDoctorType)
    const [error, setError] = useState("")

    useEffect(() => {
        setName(doctorsName);
    }, [doctorsName]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        try {
            axiosLocal.post('doctors', {
                name,
                hospital_id: hospital?.value,
                specialty_id: specialty?.value,
                telephone,
                email,
                doctor_type: doctorType
            }).then((response) => {
                onDoctorCreated(response.data.item.id);
                onClose();
            }).catch(error => {
                setError("Error creating doctor: " + error.response.data.message);
            });

        } catch (error) {

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Create New Doctor</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <TextInput
                            name="Name"
                            type="text"
                            value={name}
                            onChange={setName}
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
                        <div className="flex">
                            <CustomRadio
                                label="Dental"
                                value="dental"
                                groupValue={doctorType}
                                onChange={setDoctorType}
                            />
                            <CustomRadio
                                label="OPD"
                                value="opd"
                                groupValue={doctorType}
                                onChange={setDoctorType}
                            />
                            <CustomRadio
                                label="Specialist"
                                value="specialist"
                                groupValue={doctorType}
                                onChange={setDoctorType}
                            />
                        </div>

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
                        <TextInput
                            name="Telephone"
                            type="text"
                            value={telephone}
                            onChange={setTelephone}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <TextInput
                            name="Email"
                            type="email"
                            value={email}
                            onChange={setEmail}
                        />
                    </div>
                    {error && <div className="my-4 text-red-500">{error}</div>}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md mr-2"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md"
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
