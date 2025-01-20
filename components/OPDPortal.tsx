import React, {useEffect, useState} from "react";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import {BillingPageProps, DoctorFee} from "@/types/interfaces";
import DoctorSelect from "@/components/DoctorSelect";
import TextInput from "@/components/form/TextInput";

const OPD: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData}) => {

    useEffect(() => {
        handleFormChange('service_type', "opd")
    }, []);

    const handleDoctorChangeOption = (data: DoctorFee) => {
        handleFormChange('doctor_id', data.id)
        handleFormChange('opd_doctor_fee', data.doctor_fee)
        handleFormChange('opd_doctor_charge', data.institution_charge)
        onDoctorNameChange(data.name)
    };

    return (
        <div>
            <DoctorSelect doctorType="opd" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
        </div>
    );
};


const OPDPortal: React.FC = () => {

    const validationRules: any = {
        doctor_id: 'required',
    };
    const OPDComponent = withBillingComponent(OPD)

    // @ts-ignore
    return (<OPDComponent validation={validationRules}/>)
}

export default OPDPortal;