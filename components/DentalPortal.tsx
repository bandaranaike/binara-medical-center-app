import React, {useState} from "react";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import TextInput from "@/components/form/TextInput";
import DoctorSelect from "@/components/DoctorSelect";

interface DentalProps {
    handleFormChange: (name: string, value: string | number | boolean) => void;
    validation: any
    onDoctorNameChange: (name: string) => void
}

const Dental: React.FC<DentalProps> = ({handleFormChange, onDoctorNameChange}) => {
    const [resetInputs] = useState(false)
    const [registrationFee, setRegistrationFee] = useState("0")
    const handleRegistrationFeeChange = (value: string) => {
        handleFormChange('registration_charge', Number(value))
        setRegistrationFee(value)
    };
    const handleOnDoctorChange = (drData: { id: number, fee: number, name: string }) => {
        handleFormChange('doctor_id', drData.id)
        handleFormChange('registration_charge', drData.fee)
        handleFormChange('service_type', "dental")
        onDoctorNameChange(drData.name)
        setRegistrationFee(drData.fee.toString())
    };

    return (
        <div>
            <DoctorSelect doctorType="dental" resetSelection={resetInputs} onDoctorSelect={handleOnDoctorChange}/>
            <TextInput name="Registration fee" value={registrationFee} onChange={handleRegistrationFeeChange}/>
        </div>
    )
}

// <DentalPortal>
//      <withBillingComponent onDoctorNameChange>
//          <Dental/>
//      </withBillingComponent>
// </DentalPortal>

const DentalPortal: React.FC = () => {

    const validationRules: any = {
        registration_charge: 'required',
        doctor_id: 'required',
    };

    const handleChanges = () => {
        console.log("handleChanges triggered")
    };

    const handleFormChange = (name: string, value: string | number | boolean) => {
        console.log(`Form field ${name} changed to`, value);
    };

    const DentalComponent = withBillingComponent(Dental);

    return (<DentalComponent onDoctorNameChange={() => null} onSubmit={handleChanges} validation={validationRules} handleFormChange={handleFormChange}/>)
}

export default DentalPortal;