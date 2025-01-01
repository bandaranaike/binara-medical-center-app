import React, {useState} from 'react';

import BillComponent from "@/components/BillComponent";
import withExtension from "@/components/withExtension";
import DoctorSelect from "@/components/DoctorSelect";

const OPDPage = withExtension(BillComponent)

const OPD = () => {

    const [form, setForm] = useState<any>({})
    const [errors, setErrors] = useState<any>({});

    const handleDoctorChangeOption = (doctorId: number) => {
        setForm({...form, doctor_id: doctorId});
        setErrors((prevErrors: any) => {
            const updatedErrors = {...prevErrors};
            delete updatedErrors.doctor; // Clear doctor error when a doctor is selected
            return updatedErrors;
        });
        console.log("dddd")
    };

    const handleValidations = () => {

        console.log("01", form);
        const newErrors: any = {...errors};
        if (!form.doctor_id) {
            // console.log("02", form);
            console.log("021", errors);
            newErrors.doctor = "Please select a doctor.";
            console.log("022", errors);
        } else {
            console.log("03");
            delete newErrors.doctor;
        }
        setErrors(newErrors);
    };

    return (
        <OPDPage
            form={form}
            errors={errors}
            setForm={setForm}
            onValidating={handleValidations}
        >
            <DoctorSelect onDoctorSelect={handleDoctorChangeOption}/>
            {errors.doctor && <span className="text-red-500 mb-3 block">{errors.doctor}</span>}
        </OPDPage>
    );
};

export default OPD;
