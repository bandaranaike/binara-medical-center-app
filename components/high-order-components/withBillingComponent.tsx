import React, {useEffect, useState} from "react";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import PatientDetails from "@/components/PatientDetails";
import Loader from "@/components/form/Loader";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import axiosLocal from "@/lib/axios";
import {BillingPageProps, Patient} from "@/types/interfaces";
import printService from "@/lib/printService";
import {randomString} from "@/lib/strings";

interface WithBillingComponentProps {
    validation: any
}

const withBillingComponent = <P extends object>(
    WrappedComponent: React.ComponentType<P & BillingPageProps>
) => {
    const ComponentWithBilling: React.FC<WithBillingComponentProps & P> = ({...props}) => {
        const defaultFormData = {
            is_booking: false,
            patient_id: null,
            doctor_id: null,
            service_type: ""
        }

        const [formData, setFormData] = useState<{
            is_booking: boolean,
            patient_id: number | null,
            doctor_id: number | null,
            service_type: string
        }>(defaultFormData)

        const [validation] = useState({
            patient_id: 'required',
            doctor_id: null,
            ...props.validation
        })

        const [billNumber, setBillNumber] = useState<number>(0);
        const [patientPhone, setPatientPhone] = useState("");
        const [patientId, setPatientId] = useState(0);
        const [patient, setPatient] = useState<Patient | null>();
        const [patientName, setPatientName] = useState("")
        const [doctorName, setDoctorName] = useState("")
        const [patientNotFound, setPatientNotFound] = useState<boolean>(false);

        const [errors, setErrors] = useState<any>();
        const [billCreateError, setBillCreateError] = useState<string>("");
        const [successMessage, setSuccessMessage] = useState<string>(""); // State for success message

        const [isBooking, setIsBooking] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [resetForm, setResetForm] = useState("");
        const [billAmount, setBillAmount] = useState(0);
        const [systemAmount, setSystemAmount] = useState(0);

        useEffect(() => {
            const getTotalAmount = (flag: string) => {
                return Object.entries(formData)
                    .filter(([key, value]) => key.endsWith(flag) && typeof value === 'number')
                    .reduce((sum, [, value]) => typeof value === 'number' ? (sum + value) : sum, 0)
            }
            setBillAmount(getTotalAmount('_fee'));
            setSystemAmount(getTotalAmount('_charge'));
        }, [formData]);

        const handleFormChange = (name: string, value: string | number | boolean) => {
            setFormData((prevState) => ({...prevState, [name]: value}));
        };

        const validateFormData = (formData: any, validation: any) => {
            const errors: any = {};

            Object.entries(validation).forEach(([key, rule]) => {
                const value: any = formData[key];

                // Apply validation rules
                if (rule === 'required' && (value === null || value === '' || value === undefined)) {
                    const formattedKey = key.replace('_id', '').replace('_', ' ');
                    errors[key] = `${formattedKey} is required`;
                }
            });

            if (!formData.patient_id) {
                setPatientNotFound(true);
            } else {
                setPatientNotFound(false);
            }

            return errors;
        };

        const handleOnPatientCreateOrSelect = (patientData: Patient) => {
            setPatient(patientData)
            setPatientId(patientData.id);
            handleFormChange('patient_id', patientData.id);
            if (errors && errors.patient && patientData.id !== patientId) {
                removeError('patient');
                setPatientNotFound(false);
            }
        };

        const removeError = (key: string) => {
            const updatedErrors = {...errors};
            if (updatedErrors[key]) {
                delete updatedErrors[key];
            }
            setErrors(updatedErrors);
        };

        const clearAllErrors = () => {
            setErrors({});
            handleFormChange('is_booking', false);
            setPatientNotFound(false)
        }

        const handlePatientSelect = (patient: Patient) => {
            setPatientId(patient.id);
            setPatient(patient);
            // handleFormChange('is_booking', formData.is_booking);
            handleFormChange('patient_id', patient.id);
        };

        // TODO this method should move to the PatientDetails.tsx and pass only searchedKey
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
            handleFormChange('is_booking', checked);
        };

        const resetFormData = () => {
            setFormData(defaultFormData)
            setResetForm(randomString());
        }

        const createInvoiceBill = () => {
            const validationErrors = validateFormData(formData, validation);

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            try {
                setIsLoading(true)
                setBillCreateError("")
                setErrors({});
                axiosLocal.post('bills', {
                    ...formData, bill_amount: billAmount, system_amount: systemAmount, bill_id: billNumber
                }).then(async billSaveResponse => {
                    const data = billSaveResponse.data;
                    clearAllErrors()
                    setBillNumber(data.bill_number);
                    setSuccessMessage(`Invoice #${data.bill_id} successfully generated! Queue id: ${data.queue_id}`);

                    if (["specialist", "dental"].includes(formData.service_type) && !isBooking) {

                        await printService.sendPrintRequest({
                            bill_reference: data.bill_reference,
                            bill_id: data.bill_id,
                            customer_name: patient ? patient.name : "Customer 001",
                            doctor_name: doctorName,
                            items: data.bill_items,
                            total: data.total,
                        });
                    }
                    setTimeout(() => setSuccessMessage(""), 20000);
                    resetFormData()
                }).catch(error => {
                    setBillCreateError("Error saving bill. " + error.response.data.message);
                });
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        };

        const handlePrint = async (billId: number, billItems: any, total: number) => {

            try {

            } catch (error) {
                console.log("Failed to send print request. Check the console for details." + error);
            }
        };

        return (<>
            <div className="bg-gray-900 text-white">
                <div className="flex justify-between items-center mb-6 pb-4">
                    <span>{new Date().toDateString()}</span>
                    <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <div className="border-b border-dashed border-gray-700 pb-6 mb-6 bg-gray-900">
                            <div className="mb-2">Search patient :</div>
                            <SearchablePatientSelect onCreateNew={handlePatientOnCreate} onPatientSelect={handlePatientSelect}/>
                        </div>

                        <div className="my-4">
                            <WrappedComponent
                                {...(props as P)}
                                formData={formData}
                                onDoctorNameChange={setDoctorName}
                                handleFormChange={handleFormChange}
                                resetData={resetForm}
                                patientId={patientId}
                                onBillIdAdded={setBillNumber}
                            />
                        </div>

                        {errors && Object.keys(errors).map((errorKey) => (
                            <span key={errorKey} className="text-red-500 mb-3 block first-letter:uppercase">{errors[errorKey]}</span>
                        ))}
                    </div>
                    <div className="p-8 pb-5 col-span-2">
                        <PatientDetails
                            onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                            patientPhone={patientPhone}
                            patientName={patientName}
                            patient={patient ? patient : undefined}
                            patientNotFound={patientNotFound}
                            resetForm={resetForm}
                        ></PatientDetails>
                    </div>
                </div>

                <div className="flex justify-between mt-4">
                    <div className="flex items-center">
                        <div className="text-lg mr-12">Total : LKR {(systemAmount + billAmount).toFixed(2)}</div>
                    </div>
                    <div className="mt-3">
                        {billCreateError && <span className="text-red-500 mr-4">{billCreateError}</span>}
                        {successMessage && <span className="text-green-500 mr-4">{successMessage}</span>}
                    </div>
                    <div className="flex items-center">
                        {isLoading && (<div className="mr-4 mt-1"><Loader/></div>)}
                        <span className="mr-4"><CustomCheckbox label="Booking" checked={isBooking} setChecked={handleCheckboxChange}/></span>
                        <button className={`text-white px-5 py-2 rounded-md w-60 ${isBooking ? 'bg-blue-700' : 'bg-green-700'}`} onClick={createInvoiceBill}>
                            {isBooking ? 'Create a booking' : 'Create invoice and print'}
                        </button>
                    </div>
                </div>
            </div>
        </>)
    }

    return ComponentWithBilling;
}

export default withBillingComponent;