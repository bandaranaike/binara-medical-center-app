import React, {EffectCallback, useCallback, useEffect, useMemo, useState} from "react";
import TextInput from "@/components/form/TextInput";
import axios from "@/lib/axios";
import {isEmpty} from "lodash";
import {Option, Patient, PatientDetailsProps} from "@/types/interfaces";
import Select from "react-select";
import customStyles from "@/lib/custom-styles";
import Loader from "@/components/form/Loader";
import parsePhoneNumber, {E164Number} from "libphonenumber-js";
import debounce from "lodash.debounce";

const PatientDetails: React.FC<PatientDetailsProps> = ({patientPhone, patientName, onPatientCreatedOrSelected, patientNotFound, patient, resetForm}) => {
    const [id, setId] = useState(0);
    const [name, setName] = useState(patientName);
    const [age, setAge] = useState(0);
    const [telephone, setTelephone] = useState(patientPhone);
    const [validatedPhone, setValidatePhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [gender, setGender] = useState<Option | null>(null);
    const [isNew, setIsNew] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [savedMessage, setSavedMessage] = useState({isSuccess: true, message: ""});
    const [currentPatient, setCurrentPatient] = useState(patient);
    const [hasTelephoneTyped, setHasTelephoneTyped] = useState(false);

    const [errors, setErrors] = useState({
        name: "",
        age: "",
        telephone: "",
        email: "",
        address: "",
        year: "",
        month: "",
        day: "",
    });


    useEffect(() => {
        if (resetForm) {
            clearUserData();
            setName("");
            setTelephone("")
            setIsNew(true);
        }
    }, [resetForm]);

    useEffect(() => {
        clearUserData();
        setName(patientName);
        setTelephone(patientPhone);
        setIsNew(true)
        setCurrentPatient(undefined);
    }, [patientName, patientPhone]);


    useEffect(() => {
        clearUserData();
        if (patient) {
            populateFields(patient);
            setIsNew(false);
            setCurrentPatient(patient);
        }
    }, [patient])

    useEffect(() => {
        if (onPatientCreatedOrSelected && currentPatient) {
            onPatientCreatedOrSelected(currentPatient);
        }
    }, [currentPatient]);

    useEffect(() => {
        if (patientNotFound) {
            setSavedMessage({message: "Please save the patient first!", isSuccess: false,});
        } else {
            setSavedMessage({message: "", isSuccess: true,});
        }
    }, [patientNotFound]);

    const [debouncedTelephone, setDebouncedTelephone] = useState(telephone);

    useEffect(() => {
        if (telephone) {
            setHasTelephoneTyped(true); // Mark that the user has started typing
        }
        const handler = setTimeout(() => {
            setDebouncedTelephone(telephone);
        }, 300);

        return () => clearTimeout(handler);
    }, [telephone]);

    useEffect(() => {
        if (hasTelephoneTyped)
            validatePhoneNumber(debouncedTelephone);
    }, [debouncedTelephone]);

    const clearUserData = () => {
        setId(0);
        setAge(0);
        setEmail("");
        setAddress("");
        setYear("");
        setMonth("");
        setDay("");
        setGender(null);
        setErrors({
            name: "",
            age: "",
            telephone: "",
            email: "",
            address: "",
            year: "",
            month: "",
            day: "",
        });
        setSavedMessage({message: "", isSuccess: true,});
    };

    const populateFields = ({id, name, age, address, telephone, email, birthday, gender}: Patient) => {
        setIsLoading(true);
        setId(id);
        setName(name);
        setAge(age);
        setTelephone(telephone);
        setEmail(email ?? "");
        setAddress(address ?? "");

        if (birthday) {
            const birthDate = new Date(birthday);
            setYear(birthDate.getFullYear().toString());
            setMonth((birthDate.getMonth() + 1).toString());
            setDay(birthDate.getDate().toString());
        }

        setGender({label: gender, value: gender});
        setIsLoading(false);
    };

    const validateInputs = () => {
        let valid = true;
        let newErrors: any = {};

        if (!name) {
            valid = false;
            newErrors.name = "Name is required.";
        }

        if (!age || !Number.isInteger(Number(age)) || Number(age) < 1) {
            valid = false;
            newErrors.age = "Age must be a positive integer.";
        }

        if (!telephone) {
            valid = false;
            newErrors.telephone = "Telephone is required.";
        } else {
            if (!validatePhoneNumber(telephone)) {
                newErrors.telephone = "Phone number is invalid";
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const validatePhoneNumber = (phone: string) => {
        const formattedPhone = parsePhoneNumber(phone, "LK");
        if (!formattedPhone || !formattedPhone.isValid()) {
            setErrors({...errors, telephone: "Phone number is invalid"})
            return false;
        }
        setErrors({...errors, telephone: ""})
        setValidatePhone(formattedPhone.number);
        return true;
    }

    const savePatientData = () => {
        setSavedMessage({message: "", isSuccess: false});
        if (!validateInputs()) return;

        setIsLoading(true);

        const isCreate = isNew && isEmpty(id);
        const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        axios(`patients${isCreate ? "" : `/${id}`}`, {
            method: isCreate ? "POST" : "PUT",
            data: {name, age, telephone: validatedPhone, email, address, birthday, gender: gender?.value},
        })
            .then((response) => {
                const newPatientData = response.data.data;
                populateFields(newPatientData);
                setIsNew(false); // Update the state to reflect the saved patient
                onPatientCreatedOrSelected(newPatientData);
                setCurrentPatient(undefined);
                setSavedMessage({message: "Patient saved successfully!", isSuccess: true});
            })
            .catch((error) => {
                const message = error.response?.data?.message ?? "Error saving patient.";
                setSavedMessage({message, isSuccess: false});
            }).finally(() => setIsLoading(false));
    };

    const resetToNewPatient = () => {
        clearUserData();
        setIsNew(true);
    };

    const genderOptions = [
        {value: "male", label: "Male"},
        {value: "female", label: "Female"},
        {value: "other", label: "Other"},
    ];

    return (
        <div className={`border border-dashed ${isNew ? "border-green-700" : "border-blue-800"} p-6 rounded-lg`}>
            <div className="grid grid-cols-3 gap-4">
                <TextInput required name={"Name"} value={name} onChange={setName} error={errors.name}/>
                <TextInput required name={"Telephone"} value={telephone} onChange={setTelephone} error={errors.telephone}/>
                <TextInput name={"Age"} required value={age.toString()} onChange={(e) => setAge(Number(e))} error={errors.age}/>
                <div className="flex space-x-4">
                    <TextInput name={"Birth Year"} value={year} onChange={setYear} error={errors.year}/>
                    <TextInput name={"Month"} value={month} onChange={setMonth} error={errors.month}/>
                    <TextInput name={"Day"} value={day} onChange={setDay} error={errors.day}/>
                </div>
                <TextInput name={"Address"} value={address} onChange={setAddress} error={errors.address}/>
                <TextInput name={"Email"} value={email} onChange={setEmail} error={errors.email}/>
                <Select
                    instanceId="GenderSelect"
                    placeholder="Gender"
                    options={genderOptions}
                    styles={customStyles}
                    value={gender}
                    onChange={(option: Option | null) => setGender(option)}
                />
            </div>
            <div className="flex mt-6 space-x-4">
                <button
                    className={`py-2 px-4 ${isNew ? "bg-green-600 border-green-700" : "bg-blue-800 border-blue-700"} rounded border`}
                    onClick={savePatientData}
                >
                    {isNew ? "Create Profile" : "Save Profile"}
                </button>
                <button
                    className="py-2 px-4 bg-gray-700 border-gray-700 rounded border"
                    onClick={resetToNewPatient}
                >
                    Reset & Create New
                </button>
                <div className={`pt-2 pl-3 ${savedMessage.isSuccess ? "text-green-500" : "text-red-500"}`}>
                    {savedMessage.message}
                </div>
                {isLoading && (
                    <div className="flex grow justify-end">
                        <Loader/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetails;
