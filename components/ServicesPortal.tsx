import React, {useState} from 'react';
import PatientDetails from "@/components/PatientDetails";
import {Option, Patient, ServicesStatus} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import Services from "@/components/Services";
import SearchableSelect from "@/components/form/SearchableSelect";
import DoctorSelect from "@/components/DoctorSelect";
import Loader from "@/components/form/Loader";

const ServicesPortal = () => {
    const [billNumber, setBillNumber] = useState<number>(0);
    const [patientNotFound, setPatientNotFound] = useState<boolean>(false);
    const [isBooking, setIsBooking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [doctorId, setDoctorId] = useState(0);
    const [patientPhone, setPatientPhone] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientId, setPatientId] = useState(0);
    const [patient, setPatient] = useState<Patient | null>();

    const [billAmount, setBillAmount] = useState(0);
    const [numberOfServices, setNumberOfServices] = useState(0);
    const [errors, setErrors] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [resetServices, setResetServices] = useState(false);


    const handleOnPatientCreateOrSelect = (patientData: Patient) => {
        setPatientNotFound(false)
        setPatientId(patientData.id);
    };

    const resetForm = () => {
        setDoctorId(0);
        setPatientPhone("");
        setPatientId(0);
        setBillAmount(0);
        setErrors({});
        setPatientName('');
        setPatientNotFound(false);
    };

    const validateFields = () => {
        let validationErrors: any = {};

        if (!patientId) {
            validationErrors.patient = "Patient is required.";
            setPatientNotFound(true); // Show the patient not found message
        } else {
            setPatientNotFound(false); // Hide the message once a patient is found
        }

        if (numberOfServices === 0) {
            validationErrors.services = "Please select at least one service.";
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
        setPatientNotFound(false); // Clear patient not found state if all is valid
        try {
            setIsLoading(true);
            const billSaveResponse = await axiosLocal.put(`bills/${billNumber}/change-temp-status`, {
                bill_amount: billAmount,
                patient_id: patientId,
                doctor_id: doctorId,
                is_booking: isBooking,
            });

            if (billSaveResponse.status === 200) {
                setBillNumber(billSaveResponse.data.bill_number); // Assume bill_number is returned
                setSuccessMessage(`Invoice #${billNumber} was successfully generated!`);
                setTimeout(() => setSuccessMessage(""), 10000);
                resetForm();
                setResetServices(!resetServices);
                setBillNumber(0);
            } else {
                console.error("Error saving bill", billSaveResponse);
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error saving bill", error);
        }
    };

    const handleServiceStatusChange = (servicesStatus: ServicesStatus) => {
        errors.services = "";
        setNumberOfServices(servicesStatus.count);
        setBillAmount(servicesStatus.total)
        setBillNumber(servicesStatus.bill_id)
    }

    const handlePatientSelect = (patient: Patient) => {
        setPatientId(patient.id);
        setPatient(patient);
    };

    const handlePatientOnCreate = (searchedKey: string) => {
        if (/^-?\d+$/.test(searchedKey)) {
            setPatientPhone(searchedKey);
            setPatientName("");
        } else {
            setPatientName(searchedKey);
            setPatientPhone("")
        }
        setPatientId(0);
    }

    const handleCheckboxChange = (checked: boolean) => {
        setIsBooking(checked)
    };

    const handleDoctorChangeOption = (doctorId: number) => {
        setDoctorId(doctorId);
    };

    return (
        <div className="bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6 pb-4">
                <span>{new Date().toDateString()}</span>
                {billNumber > 0 && <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>}
            </div>

            <div className="grid grid-cols-3 gap-8">

                <div>
                    <div className="mb-4 border-b border-dashed border-gray-700 pb-6 mb-6 bg-gray-900">
                        <div className="mb-2">Search patient :</div>
                        <SearchablePatientSelect onCreateNew={handlePatientOnCreate} onPatientSelect={handlePatientSelect}/>
                    </div>

                    <DoctorSelect onDoctorSelect={handleDoctorChangeOption}/>

                    <Services
                        onServiceStatusChange={handleServiceStatusChange}
                        patientId={patientId}
                        onNotPatientFound={() => setPatientNotFound(true)}
                        resetBillItems={resetServices}
                    ></Services>

                    {errors.services && <span className="text-red-500 mt-4 block">{errors.services}</span>}
                </div>
                <div className="p-8 pb-5 col-span-2">
                    <PatientDetails
                        onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                        patientPhone={patientPhone}
                        patientName={patientName}
                        patientNotFound={patientNotFound}
                        patient={patient ? patient : undefined}
                    ></PatientDetails>
                </div>
            </div>


            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    {successMessage && <span className="text-green-500 mr-4">{successMessage}</span>}
                </div>
                <div className="flex items-center">
                    {isLoading && (<div className="mr-4 mt-1"><Loader/></div>)}
                    <span className="mr-4"><CustomCheckbox label="Booking" onChange={handleCheckboxChange}/></span>
                    <button className={`text-white px-5 py-2 rounded-md w-60 ${isBooking ? 'bg-blue-700' : 'bg-green-700'}`} onClick={createInvoiceBill}>
                        {isBooking ? 'Create a booking' : 'Create invoice and print'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServicesPortal;
