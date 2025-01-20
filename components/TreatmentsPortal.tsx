import React, {useState} from 'react';
import PatientDetails from "@/components/PatientDetails";
import {BillingPageProps, DoctorFee, Option, Patient, ServicesStatus} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import Services from "@/components/Services";
import SearchableSelect from "@/components/form/SearchableSelect";
import DoctorSelect from "@/components/DoctorSelect";
import Loader from "@/components/form/Loader";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";

const Treatment: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData}) => {
    const [billNumber, setBillNumber] = useState<number>(0);
    const [patientNotFound, setPatientNotFound] = useState<boolean>(false);

    const [doctorId, setDoctorId] = useState(0);

    const [patientId, setPatientId] = useState(0);

    const [billAmount, setBillAmount] = useState(0);
    const [numberOfServices, setNumberOfServices] = useState(0);
    const [errors, setErrors] = useState<any>({});
    const [resetServices, setResetServices] = useState(false);

    const handleServiceStatusChange = (servicesStatus: ServicesStatus) => {
        errors.services = "";
        setNumberOfServices(servicesStatus.count);
        setBillAmount(servicesStatus.total)
        setBillNumber(servicesStatus.bill_id)
    }

    const handleDoctorChangeOption = (drData: DoctorFee) => {
        setDoctorId(drData.id);
    };

    return (
        <div>
            <DoctorSelect doctorType="opd" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
            <Services
                key="treatment-portal"
                onServiceStatusChange={handleServiceStatusChange}
                patientId={patientId}
                onNotPatientFound={() => setPatientNotFound(true)}
                resetBillItems={resetServices}
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
