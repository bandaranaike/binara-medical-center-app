import React, {useState} from 'react';

import BillComponent from "@/components/BillComponent";
import withExtension from "@/components/withExtension";
import DoctorSelect from "@/components/DoctorSelect";
import TextInput from "@/components/form/TextInput";
import axiosLocal from "@/lib/axios";

const OPDPage = withExtension(BillComponent)

const OPD = () => {

    const [form, setForm] = useState<any>({
        service_type: 'opd',
        bill_amount: 0,
        system_amount: 0,
    })

    const [registrationFee, setRegistrationFee] = useState<string>("");
    const [resetDoctor, setResetDoctor] = useState<boolean>(false)

    const handleDoctorChangeOption = (data: { id: number, fee: number }) => {
        setForm({...form, doctor_id: data.id});
    };

    const handleBillAmountChange = (value: string) => {
        setRegistrationFee(value);
        setForm({...form, bill_amount: value});
    }

    const getDoctorFees = async (doctorId: number) => {
        axiosLocal.get(`doctor-channeling-fees/get-fee/${doctorId}`).then(drFeeResponse => {
            setRegistrationFee(drFeeResponse.data.bill_price.toString());
        });
    };

    const handleClearFormData = () => {
        setResetDoctor(true)
        setRegistrationFee("")
    };
    return (
        <OPDPage
            form={form}
            setForm={setForm}
            doctorRequired={true}
            onClearData={handleClearFormData}
        >
            <DoctorSelect doctorType="opd" resetSelection={resetDoctor} onDoctorSelect={handleDoctorChangeOption}/>
            <TextInput name="Doctor fee" value={registrationFee} onChange={handleBillAmountChange}/>
        </OPDPage>
    );
};

export default OPD;
