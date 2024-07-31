import React, {useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import TextInput from "@/components/form/TextInput";
import PatientDetails from "@/components/PatientDetails";
import {Option, Patient} from "@/types/interfaces";
import axios from "axios";
import axiosLocal from "@/lib/axios";

const Channel = () => {
    const [billNumber, setBillNumber] = useState<number>(0);
    const [telephone, setTelephone] = useState<Option>();
    const [isNewRecord, setIsNewRecord] = useState(true);
    const [doctor, setDoctor] = useState<Option>();
    const [patientPhone, setPatientPhone] = useState("");
    const [patientId, setPatientId] = useState(0);

    const [channelingFee, setChannelingFee] = useState("500");
    const [otherFee, setOtherFee] = useState("100");
    const [errors, setErrors] = useState<any>({});

    const handleSelectChange = (selectedOption: any) => {
        setTelephone(selectedOption);
        setPatientPhone(selectedOption.label);
        setIsNewRecord(false);
        setErrors((prevErrors: any) => ({...prevErrors, telephone: null}));
    };

    const handleOnPatientCreateOrSelect = (patientData: Patient) => {
        setPatientPhone(patientData.telephone);
        setPatientId(patientData.id)
    }

    const handleOnCreateOption = (selectedOption: any) => {
        setPatientPhone(selectedOption);
        setIsNewRecord(true);
        setErrors((prevErrors: any) => ({...prevErrors, telephone: null}));
    };

    const handleDoctorChangeOption = (selectedOption: any) => {
        setDoctor(selectedOption);
        setErrors((prevErrors: any) => ({...prevErrors, doctor: null}));
    };

    const handleChannelingFeeChange = (value: string) => {
        setChannelingFee(value);
        setErrors((prevErrors: any) => ({...prevErrors, channelingFee: null}));
    };

    const handleOtherFeeChange = (value: string) => {
        setOtherFee(value);
        setErrors((prevErrors: any) => ({...prevErrors, otherFee: null}));
    };

    const validateFields = () => {
        let validationErrors: any = {};

        if (!channelingFee || isNaN(Number(channelingFee))) {
            validationErrors.channelingFee = "Channeling fee is required and must be numeric.";
        }

        if (!otherFee || isNaN(Number(otherFee))) {
            validationErrors.otherFee = "Other fee is required and must be numeric.";
        }

        if (!telephone) {
            validationErrors.telephone = "Patient telephone is required.";
        }

        if (!doctor) {
            validationErrors.doctor = "Doctor selection is required.";
        }

        return validationErrors;
    };

    const saveAndPrint = async () => {
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        const backendUrl = process.env.BACKEND_API_URL || 'http://localhost/api/';
        try {
            const billSaveResponse = await axiosLocal.post(backendUrl + 'bills', {
                system_amount: parseFloat(channelingFee) + parseFloat(otherFee),
                bill_amount: parseFloat(channelingFee) + parseFloat(otherFee),
                patient_id: patientId, // You need to set the correct patient ID here
                doctor_id:  doctor?.value, // You need to set the correct doctor ID here
                status: 'pending',
                bill_items: [
                    {
                        service_id: 1, // Set the correct service ID here
                        system_amount: parseFloat(channelingFee),
                        bill_amount: parseFloat(channelingFee),
                    },
                    {
                        service_id: 2, // Set the correct service ID here
                        system_amount: parseFloat(otherFee),
                        bill_amount: parseFloat(otherFee),
                    }
                ]
            });

            if (billSaveResponse.status === 200) {
                await printBillData({
                    patientName: 'John Doe',
                    amount: 100,
                    billNumber: '12345'
                });
            } else {
                console.error("Error saving bill", billSaveResponse);
            }
        } catch (error) {
            console.error("Error saving bill", error);
        }
    }

    const printBillData = async (billData: object) => {
        try {
            axios.post('/api/generate-pdf', billData, {
                responseType: 'arraybuffer',
            });
        } catch (error) {
            console.error('Error generating bill PDF', error);
        }
    };


    return (
        <div className="bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6 pb-4">
                <span>{new Date().toDateString()}</span>
                <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="">
                    <SearchableSelect
                        placeholder="Patient Telephone"
                        apiUri={'patients'}
                        value={telephone}
                        onChange={handleSelectChange}
                        onCreateOption={handleOnCreateOption}
                        id={'PatientTelephoneSelect'}
                    />
                    {errors.telephone && <span className="text-red-500">{errors.telephone}</span>}

                    <SearchableSelect
                        placeholder="Doctor Name"
                        apiUri={'doctors'}
                        value={doctor}
                        onChange={handleDoctorChangeOption}
                        id={'DoctorNameSelect'}
                    />
                    {errors.doctor && <span className="text-red-500">{errors.doctor}</span>}

                    <TextInput
                        name="Channeling"
                        value={channelingFee}
                        onChange={handleChannelingFeeChange}
                    />
                    {errors.channelingFee && <span className="text-red-500">{errors.channelingFee}</span>}

                    <TextInput
                        name="Others"
                        value={otherFee}
                        onChange={handleOtherFeeChange}
                    />
                    {errors.otherFee && <span className="text-red-500">{errors.otherFee}</span>}
                </div>
                <div className="p-8 pb-5 col-span-2">
                    <PatientDetails onPatientCreatedOrSelected={handleOnPatientCreateOrSelect} patientPhone={patientPhone} isNew={isNewRecord}></PatientDetails>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <div></div>
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md" onClick={saveAndPrint}>Send to Print</button>
            </div>
        </div>
    );
};

export default Channel;
