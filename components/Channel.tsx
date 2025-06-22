import React, {useEffect, useState} from 'react';
import TextInput from "@/components/form/TextInput";
import {BillingPageProps, DoctorFee} from "@/types/interfaces";
import withBillingComponent from "@/components/high-order-components/withBillingComponent";
import DoctorSelect from "@/components/DoctorSelect";

const Channel: React.FC<BillingPageProps> = ({handleFormChange, onDoctorNameChange, resetData, isBooking, doctorDate}) => {
    const [channelingFee, setChannelingFee] = useState("");
    const [institutionFee, setInstitutionFee] = useState("");

    useEffect(() => {
        handleFormChange('service_type', "specialist")
        setChannelingFee("")
        setInstitutionFee("")
    }, [resetData]);

    useEffect(() => {
        handleFormChange('channeling_fee', Number(channelingFee))
    }, [channelingFee]);

    useEffect(() => {
        handleFormChange('channeling_charge', Number(institutionFee))
    }, [institutionFee]);

    const handleDoctorChangeOption = (data: DoctorFee) => {
        handleFormChange('doctor_id', data.id)
        setChannelingFee(data.doctor_fee.toString())
        setInstitutionFee(data.institution_charge.toString())
        onDoctorNameChange(data.name)
    };

    const handleChannelingFeeChange = (value: string) => {
        setChannelingFee(value);
    };

    const handleInstitutionFeeChange = (value: string) => {
        setInstitutionFee(value);
    };

    return (
        <div>
            <DoctorSelect date={doctorDate} isBooking={isBooking} doctorType="specialist" resetSelection={resetData} onDoctorSelect={handleDoctorChangeOption}/>
            <TextInput name="Channeling Fee" value={channelingFee} onChange={handleChannelingFeeChange}/>
            <TextInput name="Institution Fee" value={institutionFee} onChange={handleInstitutionFeeChange}/>
        </div>
    );
};

const ChannelPortal: React.FC = () => {
    const ChannelComponent = withBillingComponent(Channel);

    const validationRules: any = {
        doctor_id: 'required',
        channeling_fee: 'required',
        channeling_charge: 'required',
    };

    // @ts-ignore
    return <ChannelComponent validation={validationRules} enableBooking={true}/>;
}

export default ChannelPortal;
