import React, {useState} from "react";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import PatientDetails from "@/components/PatientDetails";
import Loader from "@/components/form/Loader";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import axiosLocal from "@/lib/axios";
import {Patient} from "@/types/interfaces";
import printService from "@/lib/printService";

interface WithBillingComponentProps {
    onSubmit: () => void;
    validation: any
}

const withBillingComponent = <P extends object>(
    WrappedComponent: React.ComponentType<P & {
        formData: any,
        handleFormChange: (name: string, value: string | number | boolean) => void,
        resetData: boolean
    }>
) => {
    const ComponentWithBilling: React.FC<WithBillingComponentProps & P> = ({onSubmit, ...props}) => {

        const [formData, setFormData] = useState<object>({
            is_booking: false,
            patient_id: null,
            doctor_id: null
        })

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
        const [successMessage, setSuccessMessage] = useState<string>(""); // State for success message

        const [isBooking, setIsBooking] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [resetForm, setResetForm] = useState(false);

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
            setFormData({})
            onSubmit()
            setResetForm(true);
        }

        const createInvoiceBill = async () => {
            const validationErrors = validateFormData(formData, validation);

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
            setIsLoading(true)
            setErrors({});

            try {

                const billSaveResponse = await axiosLocal.post('bills', {...formData, bill_amount, system_amount});

                if (billSaveResponse.status === 201) {
                    clearAllErrors()
                    setBillNumber(billSaveResponse.data.bill_number);
                    setSuccessMessage(`Invoice #${billSaveResponse.data.bill_id} successfully generated! Queue id: ${billSaveResponse.data.queue_id}`);

                    if (!isBooking) {
                        await handlePrint(billSaveResponse.data.bill_id, billSaveResponse.data.bill_items, billSaveResponse.data.total);
                    }

                    setTimeout(() => setSuccessMessage(""), 20000);
                    resetFormData()
                } else {
                    console.error("Error saving bill", billSaveResponse);
                }
            } catch (error) {
                console.error("Error saving bill", error);
            } finally {
                setIsLoading(false)
            }

        };

        const handlePrint = async (billId: number, billItems: any, total: number) => {
            const printData = {
                bill_id: billId,
                customer_name: patient ? patient.name : "Customer 001",
                doctor_name: doctorName,
                items: billItems,
                total: total,
            };

            try {
                await printService.sendPrintRequest(printData);
            } catch (error) {
                console.log("Failed to send print request. Check the console for details." + error);
            }
        };


        const getTotalAmount = (flag: string) => {
            return Object.entries(formData)
                .filter(([key, value]) => key.endsWith(flag) && typeof value === 'number')
                .reduce((sum, [, value]) => sum + value, 0)
        }

        const bill_amount = getTotalAmount('_fee');
        const system_amount = getTotalAmount('_charge');

        const total = bill_amount + system_amount;

        return (<>
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

                        <div className="my-4">
                            <WrappedComponent
                                {...(props as P)}
                                formData={formData}
                                onDoctorNameChange={setDoctorName}
                                handleFormChange={handleFormChange}
                                resetData={resetForm}
                            />
                        </div>

                        {errors && Object.keys(errors).map((errorKey) => (
                            <span key={errorKey} className="text-red-500 mb-3 block">{errors[errorKey]}</span>
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
                        <div className="text-lg mr-12">Total : {total}</div>
                        {successMessage && <span className="text-xl text-green-500 mr-4">{successMessage}</span>}
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
        </>)
    }

    return ComponentWithBilling;
}

export default withBillingComponent;