import React, {useState} from "react";
import withBillingComponent from "@/components/HOC/withBillingComponent";
import TextInput from "@/components/form/TextInput";
import DoctorSelect from "@/components/DoctorSelect";

interface DentalProps {
    handleFormChange: (name: string, value: string | number | boolean) => void;
    validation: any
}

const Dental: React.FC<DentalProps> = ({handleFormChange}) => {
    const [resetInputs] = useState(false)
    const [registrationFee, setRegistrationFee] = useState("0")
    const handleRegistrationFeeChange = (value: number) => {
        handleFormChange('registration_fee', value)
        setRegistrationFee(value.toString())
    };
    const handleOnDoctorChange = (drData: { id: number, fee: number }) => {
        handleFormChange('doctor_id', drData.id)
        handleFormChange('registration_fee', drData.fee)
        setRegistrationFee(drData.fee.toString())
    };

    return (
        <div>
            <DoctorSelect doctorType="dental" resetSelection={resetInputs} onDoctorSelect={handleOnDoctorChange}/>
            <TextInput name="Registration fee" value={registrationFee} onChange={handleRegistrationFeeChange}/>
        </div>
    )
}

const DentalPortal: React.FC = () => {

    const validationRules: any = {
        registration_fee: 'required',
        doctor_id: 'required',
    };

    const handleChanges = () => {
        console.log("handleChanges triggered")
    };

    const handleFormChange = (name: string, value: string | number | boolean) => {
        console.log(`Form field ${name} changed to`, value);
    };

    const DentalComponent = withBillingComponent(Dental);

    return (<DentalComponent onSubmit={handleChanges} validation={validationRules} handleFormChange={handleFormChange}/>)
}

export default DentalPortal;