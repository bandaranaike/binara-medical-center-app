import React, {useState} from "react";
import withBillingComponent from "@/components/HOC/withBillingComponent";
import TextInput from "@/components/form/TextInput";
import DoctorSelect from "@/components/DoctorSelect";

interface DentalProps {
    handleFormChange: (name: string, value: string | number | boolean) => void;
    validation: any
}

const DentalPortal: React.FC = () => {
    const [restInputs, setResetInputs] = useState(false)

    const validationRules: any = {
        registration_fee: 'required',
        doctor_id: 'required',
    };

    const handleChanges = (item: any) => {
    };

    const Dental: React.FC<DentalProps> = ({handleFormChange}) => {
        const handleRegistrationFeeChange = (value: number) => {
            handleFormChange('registration_fee', value)
        };
        const handleOnDoctorChange = (doctorId: number) => {
            handleFormChange('doctor_id', doctorId)
        };

        return (
            <div>
                <DoctorSelect doctorType="dental" resetSelection={restInputs} onDoctorSelect={handleOnDoctorChange}/>
                <TextInput name="Registration fee" onChange={handleRegistrationFeeChange}/>
            </div>
        )
    }

    const DentalComponent = withBillingComponent(Dental);

    const handleFormChange = () => {
    };

    return (<DentalComponent onSubmit={handleChanges} validation={validationRules} handleFormChange={handleFormChange}/>)
}

export default DentalPortal;