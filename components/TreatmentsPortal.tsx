import React, {useEffect} from 'react';
import {BillingPageProps, DoctorFee, ServicesStatus} from "@/types/interfaces";
import Services from "@/components/Services";
import DoctorSelect from "@/components/DoctorSelect";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";

const Treatment: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData, onBillIdAdded, patientId = 0}) => {

    useEffect(() => {
        handleFormChange("service_type", "opd")
    }, [resetData]);

    const handleServiceStatusChange = (servicesStatus: ServicesStatus) => {
        handleFormChange('service_charge', servicesStatus.total)
    }

    const handleDoctorChangeOption = (drData: DoctorFee) => {
        onDoctorNameChange(drData.name)
        handleFormChange('doctor_fee', drData.doctor_fee)
        handleFormChange('doctor_charge', drData.institution_charge)
    };

    return (
        <div>
            <DoctorSelect doctorType="opd" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
            <Services
                key="treatment-portal"
                onServiceStatusChange={handleServiceStatusChange}
                patientId={patientId}
                resetBillItems={!!resetData}
                onBillCreated={onBillIdAdded}
            ></Services>
        </div>
    );
};

const TreatmentPortal: React.FC = () => {
    const TreatmentComponent = withBillingComponent(Treatment);

    //@ts-ignore
    return <TreatmentComponent validation={undefined}/>
}

export default TreatmentPortal;
