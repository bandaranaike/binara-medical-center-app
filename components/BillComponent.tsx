import React, {useEffect, useState} from 'react';
import PatientDetails from "@/components/PatientDetails";
import {BillComponentProps, Patient} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import Loader from "@/components/form/Loader";
import CustomCheckbox from "@/components/form/CustomCheckbox";

const BillComponent: React.FC<BillComponentProps> = ({children, form, onCreateInvoiceBill, onValidating, errors: iE, setForm}) => {
        const [billNumber, setBillNumber] = useState<number>(0);
        // const [form, setForm] = useState<any>({...initialFrom, is_booking: false});
        const [patientPhone, setPatientPhone] = useState("");
        const [patientId, setPatientId] = useState(0);
        const [patient, setPatient] = useState<Patient | null>();
        const [patientName, setPatientName] = useState("")
        const [patientNotFound, setPatientNotFound] = useState<boolean>(false);

        const [errors, setErrors] = useState<any>(iE);
        const [successMessage, setSuccessMessage] = useState<string>(""); // State for success message

        const [isBooking, setIsBooking] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            setErrors({...iE, ...errors})
            console.log("8989", iE)
        }, [iE]);
        const handleOnPatientCreateOrSelect = (patientData: Patient) => {
            setPatientNotFound(false);
            setPatientId(patientData.id);
            if (errors.patient && patientData.id !== patientId) {
                removeError('patient');
            }
        };

        const removeError = (key: string) => {
            const updatedErrors = {...errors};
            if (updatedErrors[key]) {
                delete updatedErrors[key];
            }
            console.log("4444", updatedErrors, errors)
            setErrors(updatedErrors);
        };


        const validateFields = () => {

            if (onValidating) onValidating();

            let validationErrors: any = errors;

            // if (!form.doctor_id) {
            //     validationErrors.doctor = "Doctor is required.";
            // } else {
            //     delete validationErrors.doctor;
            // }

            if (!form.patient_id) {
                setPatientNotFound(true);
                validationErrors.patient = "Patient is required.";
            } else {
                delete validationErrors.patient;
            }

            return validationErrors;
        };
        const handlePatientSelect = (patient: Patient) => {
            setPatientId(patient.id);
            setPatient(patient);
            setForm({...form, patient_id: patient.id});
        };

        const handlePatientOnCreate = (searchedKey: string) => {
            if (/^-?\d+$/.test(searchedKey)) {
                setPatientPhone(searchedKey);
                setPatientName("");
            } else {
                setPatientName(searchedKey);
                setPatientPhone("")
            }
            setPatient(null);
        }

        const handleCheckboxChange = (checked: boolean) => {
            setIsBooking(checked)
            setForm({...form, is_booking: checked});
        };

        const createInvoiceBill = async () => {
            const validationErrors = validateFields();

            if (Object.keys(validationErrors).length > 0) {
                console.log("validation errors", validationErrors);
                console.log("5555", validationErrors, errors)
                setErrors(validationErrors);
                return;
            }

            setIsLoading(true)

            console.log("6666", errors)
            setErrors({});

            if (onCreateInvoiceBill) {
                onCreateInvoiceBill();
            } else {
                try {
                    const billSaveResponse = await axiosLocal.post('bills', form);

                    if (billSaveResponse.status === 200) {
                        console.log("billSaveResponse", billSaveResponse);
                        setBillNumber(billSaveResponse.data.bill_number);
                        setSuccessMessage(`Invoice #${billSaveResponse.data} successfully generated!`);
                        setForm({is_booking: false});
                        setTimeout(() => setSuccessMessage(""), 10000); // Clear message after 10 seconds
                    } else {
                        console.error("Error saving bill", billSaveResponse);
                    }
                } catch (error) {
                    console.error("Error saving bill", error);
                } finally {
                    setIsLoading(false)
                }
            }
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

                        <div className="my-4">{children}</div>

                    </div>
                    <div className="p-8 pb-5 col-span-2">
                        <PatientDetails
                            onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                            patientPhone={patientPhone}
                            patientName={patientName}
                            patient={patient ? patient : undefined}
                            patientNotFound={patientNotFound}
                            resetForm={isLoading}
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
    }
;

export default BillComponent;
