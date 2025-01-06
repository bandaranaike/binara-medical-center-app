import React, {useState} from 'react';
import SearchableSelect from "@/components/form/SearchableSelect";
import TextInput from "@/components/form/TextInput";
import PatientDetails from "@/components/PatientDetails";
import {Option, Patient} from "@/types/interfaces";
import axiosLocal from "@/lib/axios";
import CreateNewDoctor from "@/components/CreateNewDoctor";
import SearchablePatientSelect from "@/components/form/SearchablePatientSelect";
import CustomCheckbox from "@/components/form/CustomCheckbox";
import Loader from "@/components/form/Loader";
import printService from "@/lib/printService";

const Channel = () => {
    const [billNumber, setBillNumber] = useState<number>(0);
    const [patientNotFound, setPatientNotFound] = useState<boolean>(false);
    const [isBooking, setIsBooking] = useState(false);
    const [doctor, setDoctor] = useState<Option>();
    const [patientPhone, setPatientPhone] = useState("");
    const [patientName, setPatientName] = useState("")
    const [patientId, setPatientId] = useState(0);
    const [patient, setPatient] = useState<Patient | null>();

    const [channelingFee, setChannelingFee] = useState("");
    const [institutionFee, setInstitutionFee] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [successMessage, setSuccessMessage] = useState<string>("");

    const [isCreateDoctorOpen, setIsCreateDoctorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOnPatientCreateOrSelect = (patientData: Patient) => {
        setPatientNotFound(false)
        setPatientId(patientData.id);
    };

    const handleDoctorChangeOption = (selectedOption: any) => {
        setDoctor(selectedOption);
        getDoctorFees(selectedOption);
        setErrors((prevErrors: any) => ({...prevErrors, doctor: null}));
    };

    const getDoctorFees = (selectedOption: Option) => {
        axiosLocal.get(`doctor-channeling-fees/get-fee/${selectedOption.value}`).then(drFeeResponse => {
            setChannelingFee(drFeeResponse.data.bill_price.toString());
            setInstitutionFee(drFeeResponse.data.system_price.toString());
            resetErrors('channelingFee');
            resetErrors('institutionFee');
        });
    };

    const validateFields = () => {
        let validationErrors: any = {};

        if (!channelingFee || isNaN(Number(channelingFee))) {
            validationErrors.channelingFee = "Channeling fee must be numeric.";
        }

        if (!institutionFee || isNaN(Number(institutionFee))) {
            validationErrors.institutionFee = "Institution fee must be numeric.";
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
            setIsLoading(true);
            const billSaveResponse = await axiosLocal.post('bills', {
                bill_amount: parseFloat(channelingFee),
                system_amount: parseFloat(institutionFee),
                patient_id: patientId,
                doctor_id: doctor?.value,
                is_booking: isBooking,
                bill_items: {
                    channeling_fee: channelingFee,
                    institution_fee: institutionFee
                }
            });

            if (billSaveResponse.status === 201) {
                setBillNumber(billSaveResponse.data.bill_number); // Assume bill_number is returned
                setSuccessMessage(`Invoice #${billSaveResponse.data.bill_id} successfully generated! Queue number is ${billSaveResponse.data.queue_id}`);
                await handlePrint(billSaveResponse.data.bill_id, billSaveResponse.data.bill_items);
                setTimeout(() => setSuccessMessage(""), 15000);
                setIsLoading(false);
            } else {
                console.error("Error saving bill", billSaveResponse);
            }
        } catch (error) {
            console.error("Error saving bill", error);
        }
    };

    const handleChannelingFeeChange = (value: string) => {
        setChannelingFee(value);
        resetErrors('channelingFee');
    };

    const resetErrors = (key: string) => {
        setErrors((prevErrors: any) => ({...prevErrors, [key]: null}));
    }

    const handleInstitutionFeeChange = (value: string) => {
        setInstitutionFee(value);
        resetErrors('institutionFee');
    };

    const handleOpenCreateDoctor = (doctorsName: any) => {
        setDoctor({label: doctorsName, value: '0'});
        setIsCreateDoctorOpen(true);
    };

    const handleCloseCreateDoctor = () => {
        setIsCreateDoctorOpen(false);
    };

    const refreshDoctorList = (doctor: Option) => {
        setDoctor(doctor);
    };

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
        setPatient(null);
    }

    const handleCheckboxChange = (checked: boolean) => {
        setIsBooking(checked)
    };

    const handlePrint = async (billId: number, billItems: any) => {
        const printData = {
            bill_id: billId,
            customer_name: patientName,
            // items: [
            //     {name: "Item A", price: 10.0},
            //     {name: "Item B", price: 15.5},
            // ],
            items: billItems,
            total: 25.5,
        };

        try {
            await printService.sendPrintRequest(printData);
            alert("Print request sent successfully!");
        } catch (error) {
            alert("Failed to send print request. Check the console for details.");
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
                    <SearchableSelect
                        placeholder="Doctor Name"
                        apiUri={'doctors'}
                        value={doctor}
                        onChange={handleDoctorChangeOption}
                        onCreateOption={handleOpenCreateDoctor}
                        id={'DoctorNameSelect'}
                    />
                    {errors.doctor && <span className="text-red-500 mb-3 block">{errors.doctor}</span>}

                    <TextInput
                        name="Channeling Fee"
                        value={channelingFee}
                        onChange={handleChannelingFeeChange}
                    />
                    {errors.channelingFee && <span className="text-red-500">{errors.channelingFee}</span>}

                    <TextInput
                        name="Institution Fee"
                        value={institutionFee}
                        onChange={handleInstitutionFeeChange}
                    />
                    {errors.institutionFee && <span className="text-red-500">{errors.institutionFee}</span>}

                </div>
                <div className="p-8 pb-5 col-span-2">
                    <PatientDetails
                        onPatientCreatedOrSelected={handleOnPatientCreateOrSelect}
                        patientPhone={patientPhone}
                        patientName={patientName}
                        patient={patient ? patient : undefined}
                        patientNotFound={patientNotFound}
                        resetForm={isLoading}
                    />
                </div>
            </div>

            <CreateNewDoctor
                isOpen={isCreateDoctorOpen}
                onClose={handleCloseCreateDoctor}
                onDoctorCreated={refreshDoctorList}
                doctorsName={doctor ? doctor.label : ''}
                isOPD={false}
            />

            <div className="flex justify-between mt-4">
                <div className="flex items-center">
                    {successMessage && <span className="text-green-500 text-xl mr-4">{successMessage}</span>}
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

export default Channel;
