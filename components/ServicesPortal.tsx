import React, {useState} from 'react';
import PatientDetails from "@/components/PatientDetails";
import {Option, Patient} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import Services from "@/components/Services";

const ServicesPortal = () => {
    const [billNumber, setBillNumber] = useState<number>(0);
    const [patientNotFound, setPatientNotFound] = useState<boolean>(false);
    const [isNewRecord, setIsNewRecord] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [doctor, setDoctor] = useState<Option>();
    const [patientPhone, setPatientPhone] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientId, setPatientId] = useState(0);

    const [channelingFee, setChannelingFee] = useState("");
    const [otherFee, setOtherFee] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>("");


    const handleOnPatientCreateOrSelect = (patientData: Patient) => {
        setPatientPhone(patientData.telephone);
        setPatientNotFound(false)
        setPatientId(patientData.id);
    };

    const resetForm = () => {
        setDoctor({label: "", value: "0"});
        setPatientPhone("");
        setPatientId(0);
        setChannelingFee("500");
        setOtherFee("100");
        setIsNewRecord(true);
        setErrors({});
        setPatientName('');
        setPatientNotFound(false);
    };

    const validateFields = () => {
        let validationErrors: any = {};

        if (channelingFee && isNaN(Number(channelingFee))) {
            validationErrors.channelingFee = "Channeling fee must be numeric.";
        }

        if (otherFee && isNaN(Number(otherFee))) {
            validationErrors.otherFee = "Other fee must be numeric.";
        }

        if (!doctor) {
            validationErrors.doctor = "Doctor selection is required.";
        }

        if (!patientId) {
            validationErrors.patient = "Patient is required.";
            setPatientNotFound(true); // Show the patient not found message
        } else {
            setPatientNotFound(false); // Hide the message once a patient is found
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
            const billSaveResponse = await axiosLocal.post('bills', {
                bill_amount: parseFloat(channelingFee),
                patient_id: patientId,
                doctor_id: doctor?.value,
                is_booking: isBooking,
                is_opd: false,
            });

            if (billSaveResponse.status === 200) {
                setBillNumber(billSaveResponse.data.bill_number); // Assume bill_number is returned
                setSuccessMessage(`Invoice #${billSaveResponse.data} was successfully generated!`);
                setTimeout(() => setSuccessMessage(""), 10000);
                resetForm();
            } else {
                console.error("Error saving bill", billSaveResponse);
            }
        } catch (error) {
            console.error("Error saving bill", error);
        }
    };


    const handlePatientSelect = (patient: Patient) => {
        setPatientPhone(patient.telephone);
        setIsNewRecord(false);
        setPatientId(patient.id);
    };

    const handlePatientOnCreate = (searchedKey: string) => {
        if (/^-?\d+$/.test(searchedKey)) {
            setPatientPhone(searchedKey);
            setPatientName("");
        } else {
            setPatientName(searchedKey);
            setPatientPhone("")
        }
        setIsNewRecord(true);
    }

    const handleCheckboxChange = (checked: boolean) => {
        setIsBooking(checked)
    };

    return (
        <div className="bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6 pb-4">
                <span>{new Date().toDateString()}</span>
                <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>
            </div>

            <div className="grid grid-cols-3 gap-8">

                <div>
                    <div className="mb-4 border-b border-dashed border-gray-700 pb-6 mb-6 bg-gray-900">
                        <div className="mb-2">Search patient :</div>
                        <SearchablePatientSelect onCreateNew={handlePatientOnCreate} onPatientSelect={handlePatientSelect}/>
                    </div>
                    <Services/>
                </div>
                <div className="p-8 pb-5 col-span-2">
                    <PatientDetails
                        onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                        patientPhone={patientPhone}
                        patientName={patientName}
                        patientId={patientId}
                        isNew={isNewRecord}
                        patientNotFound={patientNotFound}
                    ></PatientDetails>
                </div>
            </div>


            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    {successMessage && <span className="text-green-500 mr-4">{successMessage}</span>}
                </div>
                <div className="flex items-center">

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
