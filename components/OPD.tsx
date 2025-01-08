import React, {useState} from 'react';

import BillComponent from "@/components/BillComponent";
import withExtension from "@/components/withExtension";
import DoctorSelect from "@/components/DoctorSelect";
import TextInput from "@/components/form/TextInput";
import {Option} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";

const OPDPage = withExtension(BillComponent)

const OPD = () => {

    const [form, setForm] = useState<any>({
        service_type: 'opd',
        bill_amount: 0,
        system_amount: 0,
    })

    const [billAmount, setBillAmount] = useState<string>("");
    const [resetDoctor, setResetDoctor] = useState<boolean>(false)

    const handleDoctorChangeOption = async (doctorId: number) => {
        await getDoctorFees(doctorId);
        setForm({...form, doctor_id: doctorId});
    };

    const handleBillAmountChange = (value: string) => {
        setBillAmount(value);
        setForm({...form, bill_amount: value});
    }

    const getDoctorFees = async (doctorId: number) => {
        axiosLocal.get(`doctor-channeling-fees/get-fee/${doctorId}/true`).then(drFeeResponse => {
            setBillAmount(drFeeResponse.data.bill_price.toString());
        });
    };

    const handleClearFormData = () => {

    };
    return (
        <OPDPage
            form={form}
            setForm={setForm}
            doctorRequired={true}
            onClearData={handleClearFormData}
        >
            <DoctorSelect resetSelection={resetDoctor} onDoctorSelect={handleDoctorChangeOption}/>
            <TextInput name="Bill amount" value={billAmount} onChange={handleBillAmountChange}/>
        </OPDPage>
    );
};

export default OPD;
