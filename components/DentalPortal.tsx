import React, {useEffect, useState} from "react";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import TextInput from "@/components/form/TextInput";
import DoctorSelect from "@/components/DoctorSelect";

interface DentalProps {
    handleFormChange: (name: string, value: string | number | boolean) => void;
    validation: any
    onDoctorNameChange: (name: string) => void
    resetData: boolean
}

const Dental: React.FC<DentalProps> = ({handleFormChange, onDoctorNameChange, resetData}) => {
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
    const handleOnDoctorChange = (drData: { id: number, fee: number, name: string }) => {
        handleFormChange('doctor_id', drData.id)
        handleFormChange('registration_charge', drData.fee)
        handleFormChange('service_type', "dental")
        onDoctorNameChange(drData.name)
        setRegistrationFee(drData.fee.toString())
    };

    return (
        <div>
            <DoctorSelect doctorType="dental" resetSelection={resetData} onDoctorSelect={handleOnDoctorChange}/>
            <TextInput name="Registration fee" value={registrationFee} onChange={handleRegistrationFeeChange}/>
        </div>
    )
}

// <DentalPortal>
//      <withBillingComponent validation onSubmit onDoctorNameChange>
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

    // @ts-ignore
    return (<DentalComponent onSubmit={handleChanges} validation={validationRules}/>)
}

export default DentalPortal;