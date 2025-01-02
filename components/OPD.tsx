import React, {useEffect, useState} from 'react';

import BillComponent from "@/components/BillComponent";
import withExtension from "@/components/withExtension";
import DoctorSelect from "@/components/DoctorSelect";

const OPDPage = withExtension(BillComponent)

const OPD = () => {

    const [form, setForm] = useState<any>({})

    const handleDoctorChangeOption = (doctorId: number) => {
        setForm({...form, doctor_id: doctorId});
    };

    return (
        <OPDPage
            form={form}
            setForm={setForm}
            doctorRequired={true}
        >
            <DoctorSelect onDoctorSelect={handleDoctorChangeOption}/>
        </OPDPage>
    );
};

export default OPD;
