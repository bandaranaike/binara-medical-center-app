import React, {useCallback, useEffect, useState} from "react";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import PatientDetails from "@/components/PatientDetails";
import Loader from "@/components/form/Loader";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import axiosLocal from "@/lib/axios";
import {ApiError, BillingPageProps, Option, Patient} from "@/types/interfaces";
import printService from "@/lib/printService";
import {randomString} from "@/lib/strings";
import Select from "react-select";
import customStyles from "@/lib/customStyles";
import AvailabilityDatePicker from "@/components/form/AvailabilityDatePicker";
import debounce from "lodash.debounce";
import axios from "@/lib/axios";
import {useUserContext} from "@/context/UserContext";
import OldBillContinue from "@/components/reception/OldBillContinue";

interface WithBillingComponentProps {
    validation: any;
    enableBooking?: boolean;
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
        const [billCreateWarning, setBillCreateWarning] = useState<string>("");
        const [successMessage, setSuccessMessage] = useState<string>(""); // State for a success message

        const [isBooking, setIsBooking] = useState(false);
        const [isPrinting, setIsPrinting] = useState(true);
        const [isLoading, setIsLoading] = useState(false);
        const [resetForm, setResetForm] = useState("");
        const [billAmount, setBillAmount] = useState(0);
        const [systemAmount, setSystemAmount] = useState(0);
        const [paymentType, setPaymentType] = useState<Option | null>({value: 'cash', label: 'Cash'})

        const [date, setDate] = useState<Date | null | string>(new Date());
        const [availableDates, setAvailableDates] = useState([]);
        const {shift} = useUserContext()

        useEffect(() => {
            const getTotalAmount = (flag: string) => {
                return Object.entries(formData)
                    .filter(([key]) => key.endsWith(flag))
                    .reduce((sum, [, value]) => (sum + Number(value)), 0)
            }
            setBillAmount(getTotalAmount('_fee'));
            setSystemAmount(getTotalAmount('_charge'));

            if (formData.doctor_id) {
                fetchDoctorDates(formData.doctor_id)
            }
        }, [formData]);

        useEffect(() => {
            if (isBooking) setDate(null)
        }, [isBooking]);

        const fetchDoctorDates = useCallback(debounce(async (doctorId) => {
            try {
                axios.get(`doctor-availabilities/doctor/${doctorId}/get-dates`).then(response => {
                    const availableDates = response.data.map((dateData: { date: string }) => dateData.date);
                    setAvailableDates(availableDates)
                    if (!date) setDate(availableDates[0])
                }).catch(error => {
                    console.error('Error fetching data:' + error.response.data.message);
                });

            } catch (e) {
                const error = e as ApiError;
                console.error(error.response?.data?.message || "An error occurred");
            }
        }, 200), [formData.doctor_id]);

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

        const handleIsPrintCheckboxChange = (checked: boolean) => {
            setIsPrinting(checked)
        };

        const handleTreatmentContinueChange = (billId: number) => {
            handleFormChange('bill_reference', billId);
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
                    ...formData,
                    bill_amount: billAmount,
                    system_amount: systemAmount,
                    bill_id: billNumber,
                    payment_type: paymentType?.value,
                    shift,
                    date
                }).then(async billSaveResponse => {
                    const data = billSaveResponse.data;
                    clearAllErrors()
                    setBillNumber(data.bill_number);
                    setSuccessMessage(`Invoice #${data.bill_id} successfully generated! Queue id: ${data.queue_id}`);

                    if (data.warning) {
                        setBillCreateWarning(data.warning)
                    }

                    if (["specialist", "dental"].includes(formData.service_type) && !isBooking && isPrinting) {
                        try {
                            await printService.sendPrintRequest({
                                bill_reference: data.bill_reference,
                                payment_type: data.payment_type,
                                bill_id: data.bill_id,
                                customer_name: patient ? patient.name : "Customer 001",
                                doctor_name: doctorName,
                                items: data.bill_items,
                                total: Number(data.total) ? Number(data.total).toFixed(2) : data.total,
                            });

                        } catch (e: any) {
                            setBillCreateError(`Bill printing error: ${e.message}`)
                        }
                    }
                    resetFormData()
                }).catch(error => {
                    setBillCreateError(error.response.data.message);
                });
            } catch (error) {
                console.error(error)
            } finally {
                handleCheckboxChange(false)
                setIsLoading(false)
                setTimeout(() => {
                    setSuccessMessage("");
                    setBillCreateWarning("");
                    setBillCreateError("");
                }, 20000);
            }
        };

        return (<>
            <div className="bg-gray-900 text-white">
                <div className="flex items-center mb-1 pb-4 mt-4 gap-5">
                    <div className="">
                        {props.enableBooking &&
                            <CustomCheckbox label="Booking" checked={isBooking} setChecked={handleCheckboxChange}/>}
                    </div>
                    <div className="flex gap-4 items-center content-center">
                        {props.enableBooking && <AvailabilityDatePicker
                            disabled={!isBooking}
                            availableDates={availableDates}
                            onDateChange={setDate}
                            selectedDate={date}
                            hasDoctorLock={!!formData.doctor_id}
                        />}
                        {billNumber > 0 &&
                            <span className="text-lg">Bill No : <span className="font-bold">{billNumber}</span></span>}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <div className="border-b border-dashed border-gray-700 pb-6 mb-6 bg-gray-900">
                            <div className="mb-2">Search patient :</div>
                            <SearchablePatientSelect onCreateNew={handlePatientOnCreate}
                                                     onPatientSelect={handlePatientSelect}/>
                        </div>
                        <div className="my-4">
                            <OldBillContinue disabled={!patient?.id} patientId={patient?.id}
                                             onSelectReferredBillId={handleTreatmentContinueChange}/>
                        </div>

                        <div className="my-4">
                            <WrappedComponent
                                {...(props as P)}
                                formData={formData}
                                onDoctorNameChange={setDoctorName}
                                handleFormChange={handleFormChange}
                                resetData={resetForm}
                                patientId={patientId}
                                isBooking={isBooking}
                                doctorDate={date}
                                onBillIdAdded={setBillNumber}
                            />
                        </div>

                        {errors && Object.keys(errors).map((errorKey) => (
                            <span key={errorKey}
                                  className="text-red-500 mb-3 block first-letter:uppercase">{errors[errorKey]}</span>
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
                        <div className="text-lg mr-12"><span
                            className="text-sm text-gray-400">Total : </span> {(systemAmount + billAmount).toFixed(2)}
                        </div>
                    </div>
                    <div className="mt-3">
                        {billCreateError && <div className="text-red-500 mr-4">{billCreateError}</div>}
                        {billCreateWarning && <div className="text-yellow-500 mr-4">{billCreateWarning}</div>}
                        {successMessage && <div className="text-green-500 mr-4">{successMessage}</div>}
                    </div>
                    <div className="flex items-center">
                        {isLoading && (<div className="mr-4 mt-1"><Loader/></div>)}
                        <div className="mr-6 flex">
                            <label className="mr-3 mt-2 text-sm text-gray-400">Payment type</label>
                            <Select
                                instanceId="PaymentTypeSelect"
                                placeholder="Payment Type"
                                options={[{label: 'Cash', value: 'cash'}, {
                                    label: 'Card',
                                    value: 'card'
                                }, {label: 'Online', value: 'online'}]}
                                styles={customStyles}
                                value={paymentType}
                                onChange={setPaymentType}
                            />
                        </div>
                        <div className="mr-6 flex items-center">
                            <label className="mr-3 text-sm text-gray-400">Print bill ?</label>
                            <CustomCheckbox checked={isPrinting} setChecked={handleIsPrintCheckboxChange}/>
                        </div>
                        <button
                            className={`text-white px-5 py-2 rounded-md w-60 ${isBooking ? 'bg-blue-700' : 'bg-green-700'}`}
                            onClick={createInvoiceBill}>
                            {isBooking ? 'Create a booking' : isPrinting ? 'Create invoice and print' : 'Create invoice'}
                        </button>
                    </div>
                </div>
            </div>
        </>)
    }

    return ComponentWithBilling;
}

export default withBillingComponent;