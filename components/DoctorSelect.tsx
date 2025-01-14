import React, {useEffect, useState} from "react";
import SearchableSelect from "@/components/form/SearchableSelect";
import {Option} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import CreateNewDoctor from "@/components/CreateNewDoctor";

interface DoctorSelectProps {
    resetSelection: boolean
    onDoctorSelect: (selectedDoctorId: number) => void;
}

const DoctorSelect: React.FC<DoctorSelectProps> = ({onDoctorSelect, resetSelection}) => {

    const [doctor, setDoctor] = useState<Option>();
    const [errors, setErrors] = useState<any>({});
    const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);

    useEffect(() => {
        setDoctor(undefined);
    }, [resetSelection]);

    const handleDoctorChangeOption = (selectedOption: any) => {
        setDoctor(selectedOption);
        onDoctorSelect(selectedOption.value);
        setErrors((prevErrors: any) => ({...prevErrors, doctor: null}));
    };

    const handleOpenCreateDoctor = (doctorsName: any) => {
        setDoctor({label: doctorsName, value: '0'});
        setIsCreateDoctorOpen(true);
    };

    const handleCloseCreateDoctor = () => {
        setIsCreateDoctorOpen(false);
    };

    const setTheCurrentDoctor = (doctor: Option) => {
        setDoctor(doctor);
    };

    return (
        <div>
            <SearchableSelect
                placeholder="Doctor Name"
                apiUri={'doctors'}
                value={doctor}
                onChange={handleDoctorChangeOption}
                onCreateOption={handleOpenCreateDoctor}
                id={'DoctorNameSelect'}
            />
            {errors.doctor && <span className="text-red-500">{errors.doctor}</span>}

            <CreateNewDoctor
                isOpen={isCreateDoctorOpen}
                onClose={handleCloseCreateDoctor}
                onDoctorCreated={setTheCurrentDoctor}
                doctorsName={doctor ? doctor.label : ''}
                isOPD={false}
            />

        </div>

    );
}
export default DoctorSelect;