import React, {useEffect, useState} from "react";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import TextInput from "@/components/form/TextInput";
import DoctorSelect from "@/components/DoctorSelect";
import {BillingPageProps, DoctorFee} from "@/types/interfaces";

const Dental: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData, isBooking, doctorDate}) => {
    const [registrationFee, setRegistrationFee] = useState("0")

    useEffect(() => {
        if (resetData) {
            setRegistrationFee("")
        }
    }, [resetData]);

    const handleRegistrationFeeChange = (value: string) => {
        handleFormChange('registration_charge', Number(value))
        setRegistrationFee(value)
    };
    const handleOnDoctorChange = (drData: DoctorFee) => {
        handleFormChange('doctor_id', drData.id)
        handleFormChange('registration_charge', drData.institution_charge)
        handleFormChange('service_type', "dental")
        onDoctorNameChange(drData.name)
        setRegistrationFee(drData.institution_charge.toString())
    };

    return (
        <div>
            <DoctorSelect doctorType="dental" date={doctorDate} isBooking={isBooking} resetSelection={resetData} onDoctorSelect={handleOnDoctorChange}/>
            <TextInput name="Registration fee" value={registrationFee} onChange={handleRegistrationFeeChange}/>
        </div>
    )
}

const DentalPortal: React.FC = () => {

    const validationRules: any = {
        registration_charge: 'required',
        doctor_id: 'required',
    };

    const DentalComponent = withBillingComponent(Dental);

    return <DentalComponent validation={validationRules} enableBooking={true}/>;
};
export default DentalPortal;