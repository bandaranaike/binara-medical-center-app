import React, {useEffect} from 'react';
import {BillingPageProps, DoctorFee} from "@/types/interfaces";
import DoctorSelect from "@/components/DoctorSelect";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";

const Treatment: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData}) => {

    useEffect(() => {
        handleFormChange("service_type", "opd")
    }, [resetData]);

    const handleDoctorChangeOption = (drData: DoctorFee) => {
        onDoctorNameChange(drData.name)
        handleFormChange('doctor_fee', drData.doctor_fee)
        handleFormChange('doctor_charge', drData.institution_charge)
    };

    return (
        <div>
            <DoctorSelect doctorType="opd" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
        </div>
    );
};

const TreatmentPortal: React.FC = () => {
    const TreatmentComponent = withBillingComponent(Treatment);

    //@ts-ignore
    return <TreatmentComponent validation={undefined}/>
}

export default TreatmentPortal;
