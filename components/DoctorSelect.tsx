import React, {useEffect, useState} from "react";
import SearchableSelect from "@/components/form/SearchableSelect";
import {DoctorFee, Option} from "@/types/interfaces";
import CreateNewDoctor from "@/components/CreateNewDoctor";
import axiosLocal from "@/lib/axios";

interface DoctorSelectProps {
    resetSelection: string
    doctorType: string
    onDoctorSelect: (data: DoctorFee) => void;
    isBooking?: boolean
}

const DoctorSelect: React.FC<DoctorSelectProps> = ({onDoctorSelect, resetSelection, doctorType, isBooking}) => {

    const [doctor, setDoctor] = useState<Option>();
    const [errors, setErrors] = useState<any>({});
    const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);

    useEffect(() => {
        setDoctor(undefined);
    }, [resetSelection]);

    const getDoctorFee = (doctorId: number) => {
        if (doctorId) {
            try {
                axiosLocal.get(`doctor-channeling-fees/get-fee/${doctorId}`).then(result => {
                    const data = result.data;
                    onDoctorSelect({
                        id: doctorId,
                        institution_charge: data.system_price,
                        doctor_fee: data.bill_price,
                        name: data.name
                    });
                }).catch(e => {
                    setErrors({doctor: e.response.data.message})
                });
            } catch (e) {
                setErrors({doctor: "There was an error when fetching doctors"})
            }

        } else {
            onDoctorSelect({
                id: doctorId,
                institution_charge: 0,
                doctor_fee: 0,
                name: ""
            });
        }
    }

    const handleDoctorChangeOption = async (selectedOption: any) => {
        setDoctor(selectedOption);
        getDoctorFee(selectedOption?.value);
        setErrors((prevErrors: any) => ({...prevErrors, doctor: null}));
    };

    const handleOpenCreateDoctor = (doctorsName: any) => {
        setDoctor({label: doctorsName, value: '0'});
        setIsCreateDoctorOpen(true);
    };

    const handleCloseCreateDoctor = () => {
        setIsCreateDoctorOpen(false);
    };

    const setTheCurrentDoctor = (doctorId: number) => {
        getDoctorFee(doctorId);
    };

    return (
        <div>
            <SearchableSelect
                placeholder="Doctor Name"
                apiUri={'doctors'}
                type={doctorType}
                value={doctor}
                onChange={handleDoctorChangeOption}
                onCreateOption={handleOpenCreateDoctor}
                id={'DoctorNameSelect'}
                resetValue={!doctor}
                extraParams={{"is-booking": isBooking}}
            />
            {errors.doctor && <span className="text-red-500">{errors.doctor}</span>}

            <CreateNewDoctor
                isOpen={isCreateDoctorOpen}
                onClose={handleCloseCreateDoctor}
                onDoctorCreated={setTheCurrentDoctor}
                doctorsName={doctor ? doctor.label : ''}
                doctorType={doctorType}
            />

        </div>

    );
}
export default DoctorSelect;