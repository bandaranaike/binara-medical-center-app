import React, {useEffect, useState} from "react";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import {BillingPageProps, DoctorFee} from "@/types/interfaces";
import DoctorSelect from "@/components/DoctorSelect";

const OPD: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData}) => {

    useEffect(() => {
        handleFormChange('service_type', "opd")
        handleFormChange('doctor_id', "")
        handleFormChange('opd_doctor_fee', "")
        handleFormChange('opd_doctor_charge', "")
    }, [resetData]);

    const handleDoctorChangeOption = (data: DoctorFee) => {
        handleFormChange('service_type', "opd")
        handleFormChange('doctor_id', data.id)
        handleFormChange('opd_doctor_fee', data.doctor_fee)
        handleFormChange('opd_doctor_charge', data.institution_charge)
        onDoctorNameChange(data.name)
    };

    return (
        <div>
            <DoctorSelect isBooking={false} date={null} doctorType="opd" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
        </div>
    );
};


const OPDPortal: React.FC = () => {

    const validationRules: any = {
        doctor_id: 'required',
    };
    const OPDComponent = withBillingComponent(OPD)

    // @ts-ignore
    return (<OPDComponent validation={validationRules} enableBooking={false}/>)
}

export default OPDPortal;