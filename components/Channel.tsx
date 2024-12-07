import React, { useState } from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import TextInput from "@/components/form/TextInput";
import PatientDetails from "@/components/PatientDetails";
import { Option, Patient } from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import CreateNewDoctor from "@/components/CreateNewDoctor";

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
    const [successMessage, setSuccessMessage] = useState<string>(""); // State for success message

    const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);

    const handleSelectChange = (selectedOption: any) => {
        setTelephone(selectedOption);
        setPatientPhone(selectedOption.label);
        setIsNewRecord(false);
        setErrors((prevErrors: any) => ({ ...prevErrors, telephone: null }));
    };

    const handleOnPatientCreateOrSelect = (patientData: Patient) => {
        setPatientPhone(patientData.telephone);
        setPatientId(patientData.id);
    };

    const handleOnCreateOption = (selectedOption: any) => {
        setPatientPhone(selectedOption);
        setTelephone({ value: "", label: selectedOption });
        setIsNewRecord(true);
        setErrors((prevErrors: any) => ({ ...prevErrors, telephone: null }));
    };

    const handleDoctorChangeOption = (selectedOption: any) => {
        setDoctor(selectedOption);
        getDoctorFees(selectedOption);
        setErrors((prevErrors: any) => ({ ...prevErrors, doctor: null }));
    };

    const getDoctorFees = (selectedOption: Option) => {
        axiosLocal.get(`doctor-channeling-fees/get-fee/${selectedOption.value}`).then(drFeeResponse => {
            setChannelingFee(drFeeResponse.data);
        });
    };

    const resetForm = () => {
        setTelephone(undefined);
        setDoctor(undefined);
        setPatientPhone("");
        setPatientId(0);
        setChannelingFee("500");
        setOtherFee("100");
        setIsNewRecord(true);
        setErrors({});
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

    const createInvoiceBill = async () => {
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        try {
            const billSaveResponse = await axiosLocal.post('bills', {
                system_amount: parseFloat(channelingFee) + parseFloat(otherFee),
                bill_amount: parseFloat(channelingFee) + parseFloat(otherFee),
                patient_id: patientId,
                doctor_id: doctor?.value,
            });

            if (billSaveResponse.status === 200) {
                setBillNumber(billSaveResponse.data.bill_number); // Assume bill_number is returned
                setSuccessMessage(`Invoice #${billSaveResponse.data} successfully generated!`); // Set success message
                setTimeout(() => setSuccessMessage(""), 10000); // Clear message after 5 seconds
                resetForm();
            } else {
                console.error("Error saving bill", billSaveResponse);
            }
        } catch (error) {
            console.error("Error saving bill", error);
        }
    };
    const handleChannelingFeeChange = (value: string) => {
        setChannelingFee(value);
        setErrors((prevErrors: any) => ({ ...prevErrors, channelingFee: null }));
    };

    const handleOtherFeeChange = (value: string) => {
        setOtherFee(value);
        setErrors((prevErrors: any) => ({ ...prevErrors, otherFee: null }));
    };

    const handleOpenCreateDoctor = (doctorsName: any) => {
        setDoctor({ label: doctorsName, value: '0' });
        setIsCreateDoctorOpen(true);
    };

    const handleCloseCreateDoctor = () => {
        setIsCreateDoctorOpen(false);
    };

    const refreshDoctorList = (doctor: Option) => {
        setDoctor(doctor);
        console.log("Doctor list refreshed.", doctor);
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
                        onCreateOption={handleOpenCreateDoctor}
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
                    <PatientDetails
                        onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                        patientPhone={patientPhone}
                        isNew={isNewRecord}
                    ></PatientDetails>
                </div>
            </div>

            <CreateNewDoctor
                isOpen={isCreateDoctorOpen}
                onClose={handleCloseCreateDoctor}
                onDoctorCreated={refreshDoctorList}
                doctorsName={doctor ? doctor.label : ''}
            />

            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    {successMessage && <span className="text-green-500 mr-4">{successMessage}</span>}
                </div>
                <button className="bg-gray-700 text-white px-5 py-2 rounded-md" onClick={createInvoiceBill}>Create invoice</button>
            </div>
        </div>
    );
};

export default Channel;
